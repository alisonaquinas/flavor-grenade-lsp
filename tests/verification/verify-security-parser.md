---
title: Verification — Security — Parser Safety
tags: [test/verification, "requirements/security/parser-safety"]
aliases: [Verify Parser Safety]
---

# Verification — Security — Parser Safety

## Purpose

This document defines verification test cases for the parser safety security requirements of `flavor-grenade-lsp`. Each test case validates that the OFM parser is hardened against resource exhaustion and denial-of-service attacks through adversarially crafted vault content. The requirements are defined in [[requirements/security/parser-safety]] and the threat analysis in [[research/security-threat-model]]. Security tests are predominantly Agent-driven; adversarial inputs must be constructed and sent to a running server instance to observe actual server behaviour. Scripted steps provide supporting static analysis.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Security.Parser.ReDoS` | All OFM parser regexes audited for catastrophic backtracking; super-linear patterns prohibited | Phase 3 |
| `Security.Parser.ParseTimeout` | Any single vault file must complete parsing within 200 ms; stalled files skipped without crash | Phase 3 |
| `Security.Parser.YAMLLimits` | Frontmatter YAML: alias cap 50, max 64 KB, safe mode; parse failures caught without logging content | Phase 3 |
| `Security.Parser.EmbedDepth` | Embed resolution detects cycles via visited-URI set; max depth 10; FG005 on cycle | Phase 7 |
| `Security.Parser.VaultFileLimit` | Initial indexing stops at configurable max file count (default 50,000); client notified via `window/showMessage` | Phase 4 |

---

## Test Cases

### TC-VER-SECP-001 — Security.Parser.ReDoS

**Planguage Tag:** `Security.Parser.ReDoS`
**Gist:** All regular expressions in the OFM parser must be audited for catastrophic backtracking; any pattern with super-linear worst-case behaviour against crafted input is prohibited from merging into `src/parser/`.
**Type:** Both
**BDD Reference:** **BDD gap**
**Phase:** Phase 3

> [!WARNING] Threat: A vault file with crafted Markdown (e.g., `[[` followed by thousands of `|` characters) can lock the Bun event loop for seconds via ReDoS in a naively written wiki-link regex, making the editor appear unresponsive. This mirrors CVE-2022-21670 (markdown-it) and CVE-2025-6493 (CodeMirror).

**Setup:** `src/parser/` contains TypeScript files with regex literals. `safe-regex` npm package available or equivalent static analysis tool.

**Scripted steps:**

```bash
# 1. Run safe-regex against all regex literals in src/parser/
bunx safe-regex $(grep -roh "['\`]/[^/]*/[gimsuy]*" src/parser/*.ts 2>/dev/null | \
  sed "s/^['\`]//" | sed "s/['\`]$//") 2>/dev/null || \
  echo "ADVISORY: safe-regex not available; use vuln-regex-detector or manual analysis"

# 2. Find all regex literals and new RegExp() calls in src/parser/
grep -n 'new RegExp\|/[^/]\+/' src/parser/*.ts 2>/dev/null | head -50

# 3. Check for nested quantifiers (high-risk pattern for ReDoS)
# Patterns like /(a+)+/, /(\w+)* /, /(a|aa)+/ are high-risk
grep -n '([^)]*\+)[+*]\|([^)]*\*)[+*]\|(\w[^)]*|[^)]*\w)[+*]' \
  src/parser/*.ts 2>/dev/null && \
  echo "WARNING: potential nested quantifier found" || \
  echo "OK: no obvious nested quantifiers"

# 4. Count confirmed super-linear patterns (from safe-regex output)
flagged=$(bunx safe-regex --json src/parser/*.ts 2>/dev/null | \
  node -e "let d='';process.stdin.on('data',c=>d+=c);\
           process.stdin.on('end',()=>{ \
             try{const r=JSON.parse(d);console.log(r.filter(x=>x.unsafe).length)}catch{console.log(0)} \
           })" 2>/dev/null || echo 0)
echo "Flagged super-linear patterns: $flagged"
[ "$flagged" -eq 0 ] && echo "PASS: 0 super-linear patterns" || \
  echo "FAIL: $flagged super-linear pattern(s) found in src/parser/"
```

**Agent-driven steps:**
1. Agent reads all `.ts` files under `src/parser/` and extracts every regex literal and `new RegExp()` call.
2. Agent constructs an adversarial input for each wiki-link regex: a string of the form `[[` followed by 10,000 repetitions of `|` without a closing `]]`, and measures whether the regex terminates in under 1 ms against this input.
3. Agent constructs an adversarial input for the tag regex: `#` followed by 10,000 alternating `a` and ` ` characters, and verifies the regex terminates immediately.
4. Agent verifies that each regex in `src/parser/` is either: (a) confirmed safe by `safe-regex` analysis, or (b) accompanied by a code comment documenting its manual worst-case analysis and author sign-off.

**Pass criterion:** 0 super-linear patterns — all parser regexes pass `safe-regex` or are documented as safe by manual analysis.
**Fail criterion:** Any confirmed super-linear regex pattern in `src/parser/` at the time of a Phase 3 gate review.

---

### TC-VER-SECP-002 — Security.Parser.ParseTimeout

**Planguage Tag:** `Security.Parser.ParseTimeout`
**Gist:** Processing of any single vault file must complete within 200 ms; files exceeding the timeout must be skipped with an empty parse result, a warning log entry, and no crash or index corruption.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 3

> [!WARNING] Threat: A pathologically large vault file (e.g., a 50 MB Markdown export or a file with 10,000 deeply nested wiki-link structures) can stall the Bun event loop synchronously, making the LSP server unresponsive to all editor requests until parsing completes or the editor's LSP timeout fires.

**Setup:** A running `flavor-grenade-lsp` server instance started against a test vault. A fixture file designed to stress the parser.

**Agent-driven steps:**
1. Agent creates a test fixture file `stress-parse.md` containing 10,000 lines of the form `[[note-$i|$i]]` where `$i` is the line index — this exercises the wiki-link regex at scale without being adversarial in the ReDoS sense but stresses parse throughput.
2. Agent starts the server with the test vault, sends `initialize` and `initialized` notifications, then waits for the server to index the vault.
3. Agent records the wall-clock time from the server's `workspace/didChangeWatchedFiles` notification for `stress-parse.md` to the completion of indexing.
4. Agent verifies that if the file took longer than 200 ms to parse, the server emitted a `window/logMessage` with level Warning (not an unhandled exception) and returned an empty parse result for that file.
5. Agent verifies server responsiveness after the timeout: sends `textDocument/completion` for a different vault file and expects a response within 500 ms.
6. Agent confirms the stress fixture file has no index entries in the vault index (empty parse result was stored, not partial data).

**Pass criterion:** 100% of pathological files abort within 200 ms; server remains responsive after timeout; subsequent files index normally; empty result stored for timed-out file.
**Fail criterion:** Any parse operation that stalls for more than 200 ms without aborting; any parse timeout that crashes the server or prevents subsequent file indexing.

---

### TC-VER-SECP-003 — Security.Parser.YAMLLimits

**Planguage Tag:** `Security.Parser.YAMLLimits`
**Gist:** Frontmatter YAML must be parsed with an alias expansion cap of 50, a maximum size of 64 KB, and in `js-yaml` safe mode; any parse failure must be caught, logged without content, and treated as malformed frontmatter.
**Type:** Both
**BDD Reference:** **BDD gap**
**Phase:** Phase 3

> [!WARNING] Threat: A YAML "billion laughs" attack using anchor/alias chains (e.g., 10 levels of 10-alias references) can expand to 10 billion objects in heap, exhausting process memory. Even a single oversized frontmatter block can stall parsing. These are well-documented YAML parser vulnerabilities applicable to any vault content processed by this server.

**Setup:** A running server instance. Test fixture vault files with pathological YAML frontmatter.

**Scripted steps:**

```bash
# 1. Verify the parser source uses js-yaml with maxAliases option
grep -n 'maxAliases\|max_aliases\|js-yaml\|jsYaml' src/parser/*.ts 2>/dev/null
# Expected: a line showing maxAliases: 50 or equivalent

# 2. Verify safe mode is enforced (no SCHEMA with Function/Regexp)
grep -n 'DEFAULT_FULL_SCHEMA\|FAILSAFE_SCHEMA\|CORE_SCHEMA\|js_types\|Function' \
  src/parser/*.ts 2>/dev/null
# Expected: no DEFAULT_FULL_SCHEMA or Function schema references

# 3. Verify 64 KB size check occurs before parsing
grep -n '65536\|64 \* 1024\|64KB\|maxSize' src/parser/*.ts 2>/dev/null
# Expected: a size guard before the js-yaml parse call

# 4. Create fixture: YAML with 51 aliases (exceeds limit)
python3 -c "
anchors = ' '.join(f'&a{i} [{i}]' for i in range(51))
refs = ' '.join(f'*a{i}' for i in range(51))
print(f'---\naliases: [{refs}]\n---')
" > /tmp/fixture-51-aliases.md

# 5. Create fixture: YAML exceeding 64 KB
python3 -c "
print('---')
print('title: ' + 'x' * 65537)
print('---')
" > /tmp/fixture-oversized.md
```

**Agent-driven steps:**
1. Agent creates fixture (a): a vault file with YAML frontmatter containing exactly 51 anchor/alias pairs (exceeds the 50-alias cap). Agent adds this file to the test vault and observes the server's response.
2. Agent verifies the server emits an FG007 diagnostic for the file and does NOT crash.
3. Agent creates fixture (b): a vault file whose YAML frontmatter block is exactly 65,537 bytes (one byte over the 64 KB limit). Agent adds it to the vault and verifies the server rejects it before invoking `js-yaml`.
4. Agent creates fixture (c): a vault file with syntactically invalid YAML frontmatter (`--- : : : ---`). Agent adds it to the vault and verifies the server catches the parse exception, emits FG007, and continues indexing subsequent files.
5. Agent captures all log output during these tests and searches for any substring from the fixture file content (e.g., any of the alias values). Confirms none appear in logs.
6. Agent inspects the server source to confirm `js-yaml` is called with `{ schema: jsYaml.CORE_SCHEMA }` or equivalent safe mode, and that `maxAliases: 50` is passed.

**Pass criterion:** 100% compliance — alias limit enforced, size limit enforced, exceptions caught, zero content in logs; FG007 emitted for each failure case.
**Fail criterion:** Any YAML parse operation that processes more than 50 aliases; any parse exception that propagates uncaught; any YAML content appearing in log output.

---

### TC-VER-SECP-004 — Security.Parser.EmbedDepth

**Planguage Tag:** `Security.Parser.EmbedDepth`
**Gist:** Embed resolution must detect cycles using a visited-URI set and enforce a maximum depth of 10; circular embeds produce FG005 and depth-exceeded embeds stop resolution without error propagation.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 7

> [!WARNING] Threat: A circular embed chain (`![[A]]` in A embeds B, B embeds A) causes unbounded recursion in a naive resolver, exhausting the call stack and crashing the server process with a stack overflow. This is a vault-content denial-of-service attack requiring no special privileges — any contributor to a shared vault can create it.

**Setup:** A running server instance. A test vault with deliberate circular embed structures.

**Agent-driven steps:**
1. Agent creates a 2-node cycle: `vault/cycle-a.md` containing `![[cycle-b]]`, and `vault/cycle-b.md` containing `![[cycle-a]]`. Agent triggers embed resolution for `cycle-a.md`.
2. Agent verifies the server returns an FG005 diagnostic for `cycle-a.md` without crashing. Agent confirms the server process is still alive by sending a `textDocument/hover` request and receiving a response.
3. Agent creates a 3-node cycle: A embeds B, B embeds C, C embeds A. Agent triggers resolution and verifies FG005 is emitted for the first file where the cycle is detected.
4. Agent creates a self-referencing embed: `vault/self-ref.md` containing `![[self-ref]]`. Agent triggers resolution and verifies FG005 is emitted.
5. Agent creates a non-circular chain of depth 11: `d1.md` embeds `d2.md` embeds ... `d11.md`. Agent triggers resolution for `d1.md` and verifies: (a) resolution stops at depth 10, (b) no FG005 is emitted (not a cycle), (c) partial resolution result is returned for the first 10 levels.
6. Agent creates a non-circular chain of depth 9 and verifies complete, correct resolution with no diagnostic.
7. Agent confirms that after all six test cases, the server's VaultIndex for non-cycle files in the same vault is not corrupted (a `textDocument/definition` request for a non-cycle file returns the correct result).

**Pass criterion:** 100% of cycles detected without crash; FG005 emitted for each cycle case; 100% of depth-exceeded chains stop cleanly at depth 10 with no FG005; 0% false positives on non-circular chains.
**Fail criterion:** Any circular embed that crashes the server or causes a stack overflow; any circular detection that misidentifies a non-circular chain (depth <= 10) as circular.

---

### TC-VER-SECP-005 — Security.Parser.VaultFileLimit

**Planguage Tag:** `Security.Parser.VaultFileLimit`
**Gist:** Initial vault indexing must stop at a configurable maximum file count (built-in default: 50,000); when the limit is reached, the server must notify the client via `window/showMessage` and continue operating with a partial index.
**Type:** Agent-driven
**BDD Reference:** **BDD gap**
**Phase:** Phase 4

> [!WARNING] Threat: An accidentally large vault root (e.g., the user sets their home directory as the vault, or a mounted network share with millions of files) causes VaultIndex construction to exhaust heap memory or stall for minutes. This is a denial-of-service condition that makes the editor's LSP integration non-functional.

**Setup:** A test environment capable of creating 50,001 small files. A running server instance with the file limit set to 50,000.

**Agent-driven steps:**
1. Agent creates a test fixture vault with 50,001 empty `.md` files named `note-000001.md` through `note-050001.md`. Agent confirms the total file count is exactly 50,001 using `ls | wc -l`.
2. Agent starts the server against the fixture vault with the default file limit (50,000) and captures all LSP messages from the server.
3. Agent verifies that after indexing completes, exactly 50,000 files are indexed. Agent sends `workspace/symbol` for a note that was the 50,001st file alphabetically and confirms it returns no results (it was not indexed).
4. Agent inspects the captured LSP messages for a `window/showMessage` notification with `MessageType: 2` (Warning) containing text indicating the vault exceeded the file limit.
5. Agent verifies the server is responsive after indexing by sending `textDocument/completion` for a file that was within the first 50,000 indexed, and confirms a response arrives within 500 ms.
6. Agent modifies `bunfig.toml` to set `vaultFileLimit = 100` and repeats the test with a 101-file vault. Verifies exactly 100 files are indexed and the `window/showMessage` notification is still sent.

**Pass criterion:** 100% of oversized vaults trigger the limit correctly; client always notified via `window/showMessage` Warning; server remains responsive and correctly serves the partial index.
**Fail criterion:** Any indexing run against an oversized vault that does not stop at the limit; any notification failure; any server unresponsiveness after the limit is reached.
