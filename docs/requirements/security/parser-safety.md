---
title: Requirements — Parser Safety
tags:
  - requirements/security
  - requirements/security/parser-safety
aliases:
  - Parser Safety Requirements
  - OFM Parser Security
---

# Parser Safety Requirements

> [!NOTE] Scope
> These are **technical security requirements** governing the OFM parser introduced in Phase 3. They bound resource consumption, prohibit unsafe regex patterns, and constrain recursive resolution to prevent adversarially crafted vault content from causing denial of service or memory exhaustion. Evidence for each requirement is drawn from [[research/security-threat-model#Threat-Category-1]] and [[research/security-threat-model#Threat-Category-5]]. Decisions are codified in [[adr/ADR012-parser-safety-policy]].

---

**Tag:** Security.Parser.ReDoS
**Gist:** All regular expressions in the OFM parser must be audited for catastrophic backtracking; any pattern with super-linear worst-case behaviour against crafted input is prohibited from merging into `src/parser/`.
**Ambition:** Multiple Markdown parsing libraries have shipped ReDoS vulnerabilities: markdown-it (CVE-2022-21670), CodeMirror (CVE-2025-6493), marked (pre-4.0.10), and markdown-to-jsx (GHSL-2020-300). The OFM parser writes its own regexes for wiki-links, tags, block IDs, callouts, and comments — all of which accept user-controlled vault content. A single file containing a crafted sequence of characters (e.g., `[[` followed by thousands of `|` characters) could lock the Bun event loop for seconds, causing the editor to time out. The prohibition on nested quantifiers and overlapping alternation patterns, enforced by static analysis before merge, prevents this class of vulnerability from being introduced.
**Scale:** Number of regex patterns in `src/parser/` that produce super-linear worst-case matching time against adversarial input, as determined by `safe-regex` static analysis or equivalent manual worst-case complexity analysis.
**Meter:**
1. Run `safe-regex` (or `vuln-regex-detector`) against every regex literal and `new RegExp()` call in `src/parser/`.
2. For each flagged pattern, perform manual worst-case analysis to confirm or clear the finding.
3. Count confirmed super-linear patterns.
**Fail:** Any confirmed super-linear regex pattern in `src/parser/` at the time of a Phase 3 gate review.
**Goal:** 0 super-linear patterns — all parser regexes pass `safe-regex` or are documented as safe by manual analysis.
**Stakeholders:** Vault authors using shared or third-party vaults, server reliability, editor responsiveness.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-1.1]], [[adr/ADR012-parser-safety-policy]], CVE-2022-21670, CVE-2025-6493.

---

**Tag:** Security.Parser.ParseTimeout
**Gist:** Processing of any single vault file must complete within 200 ms; files exceeding the timeout must be skipped with an empty parse result, a warning log entry, and no crash or index corruption.
**Ambition:** A hard per-file timeout bounds the worst-case event loop stall from any single pathological input. Even with perfectly safe regexes, an exceptionally large file (e.g., a 50 MB markdown export) could stall synchronous string processing. The 200 ms limit is chosen to be well above the 99th-percentile parse time for normal vault files (which complete in under 5 ms in practice) while remaining short enough that a single stalled file does not cause the editor to perceive the LSP as unresponsive (typical LSP timeout thresholds are 1–5 seconds). The empty-result fallback ensures the rest of the vault continues to be indexed.
**Scale:** Percentage of pathological vault file parse attempts (files that would normally exceed the timeout) that: (a) abort within 200 ms, (b) do not crash the server, (c) produce an empty parse result for that file, and (d) allow subsequent files to be indexed normally.
**Meter:**
1. Create a test fixture file designed to stress the parser (e.g., 10,000 nested wiki-link-like structures).
2. Start the server, trigger indexing of the fixture vault.
3. Measure wall-clock time from parse start to parse completion or timeout.
4. Verify the server is still responsive after the timeout (send a `textDocument/completion` request; expect a response within 500 ms).
5. Verify the problematic file produces no index entries (empty result).
**Fail:** Any parse operation that stalls for more than 200 ms without aborting; any parse timeout that crashes the server or prevents subsequent file indexing.
**Goal:** 100% of pathological files abort within 200 ms; server remains responsive; subsequent files index normally.
**Stakeholders:** Editor users on shared or third-party vaults, server reliability engineers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-1.1]], [[adr/ADR012-parser-safety-policy#2-per-file-parse-timeout]].

---

**Tag:** Security.Parser.YAMLLimits
**Gist:** Frontmatter YAML must be parsed with an alias expansion cap of 50, a maximum size of 64 KB, and in `js-yaml` safe mode; any parse failure must be caught, logged without content, and treated as malformed frontmatter.
**Ambition:** YAML anchor/alias expansion can amplify a small input into an exponentially large object graph ("billion laughs" pattern). A frontmatter block using 10 levels of 10-alias references expands to 10 billion objects on heap allocation. `js-yaml` provides a `maxAliases` option to cap this. The 64 KB size limit prevents even reaching the alias expansion stage for unreasonably large frontmatter blocks. Safe mode (no `!!js/function` or `!!python/object` tags) prevents YAML from being used as a code execution vector — though JavaScript YAML parsers default to safe mode, this must be explicitly enforced to prevent future dependency upgrades from changing the default.
**Scale:** Percentage of frontmatter YAML parse operations that: (a) correctly reject inputs with more than 50 aliases, (b) correctly reject inputs larger than 64 KB, (c) catch all parse exceptions without crashing, and (d) never log the YAML content of a failed parse.
**Meter:**
1. Create test fixtures: (a) YAML with 51 aliases, (b) YAML exceeding 64 KB, (c) malformed YAML syntax.
2. For each fixture, trigger frontmatter parsing.
3. Verify: (a) alias limit produces a caught exception and FG007 diagnostic, (b) size limit rejects before parsing, (c) malformed YAML produces FG007 without server crash.
4. Check server logs: verify no YAML content appears.
**Fail:** Any YAML parse operation that processes more than 50 aliases; any parse exception that propagates uncaught; any YAML content appearing in log output.
**Goal:** 100% compliance — all limits enforced, all exceptions caught, zero content in logs.
**Stakeholders:** Vault authors, server reliability, security auditors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-1.3]], [[adr/ADR012-parser-safety-policy#3-yaml-frontmatter-depth-and-alias-limits]], js-yaml documentation.

---

**Tag:** Security.Parser.EmbedDepth
**Gist:** Embed resolution must detect cycles using a visited-URI set and enforce a maximum depth of 10; circular embeds produce FG005 and depth-exceeded embeds stop resolution without error propagation.
**Ambition:** A circular embed chain (`![[A]]` → `![[B]]` → `![[A]]`) causes unbounded recursion in any naive resolver. Without cycle detection, the server call stack grows until a stack overflow error crashes the process. The visited-URI set breaks cycles in O(1) per step. The separate depth limit of 10 prevents non-circular but pathologically deep chains from consuming excessive stack and memory. Both limits are necessary — cycles bypass depth limits if not detected separately.
**Scale:** Percentage of circular embed inputs that: (a) produce FG005 without server crash, (b) complete resolution within 500 ms, and (c) do not corrupt the VaultIndex for non-circular embeds in the same vault.
**Meter:**
1. Create a test vault with at least three distinct cycle patterns: 2-node cycle, 3-node cycle, self-referencing embed.
2. Also create a non-circular chain of depth 11 (exceeds limit) and a non-circular chain of depth 9 (within limit).
3. For each circular case: verify FG005 diagnostic emitted, server remains responsive.
4. For depth-11 case: verify resolution stops at depth 10, no FG005 (not a cycle), partial resolution.
5. For depth-9 case: verify correct resolution.
**Fail:** Any circular embed that crashes the server or causes a stack overflow; any circular detection that misidentifies a non-circular chain as circular.
**Goal:** 100% of cycles detected without crash; 100% of depth-exceeded chains stop cleanly; 0% false positives on non-circular chains.
**Stakeholders:** Vault authors using transclusion-heavy vaults, server reliability.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-5.2]], [[adr/ADR012-parser-safety-policy#4-embed-cycle-detection-and-depth-limit]], [[requirements/diagnostics]].

---

**Tag:** Security.Parser.VaultFileLimit
**Gist:** Initial vault indexing must stop at a configurable maximum file count (built-in default: 50,000); when the limit is reached, the server must notify the client via `window/showMessage` and continue operating with a partial index.
**Ambition:** An accidentally large vault root (e.g., the user sets their home directory as the vault, or a mounted network share with millions of files) would cause the VaultIndex to attempt to read and parse every file, exhausting memory and taking minutes or hours to complete. The file count limit provides a safety ceiling. The `window/showMessage` notification informs the user that the index is partial, allowing them to reconfigure the vault root. The server continuing to operate — rather than failing — means the user retains LSP functionality for the files that were indexed.
**Scale:** Percentage of vault indexing runs against a vault exceeding the limit that: (a) stop exactly at the limit, (b) send a `window/showMessage` Warning, and (c) complete indexing of the files up to the limit without error.
**Meter:**
1. Create a test fixture vault with 50,001 files (can use empty files for the test).
2. Set the file limit to 50,000 in `bunfig.toml` (or accept the default).
3. Start the server and trigger indexing.
4. Verify exactly 50,000 files are indexed (not 50,001).
5. Verify a `window/showMessage` notification with MessageType Warning is sent to the client.
6. Verify the server responds normally to `textDocument/completion` for an indexed file.
**Fail:** Any indexing run against an oversized vault that does not stop at the limit; any notification failure; any server unresponsiveness after the limit is reached.
**Goal:** 100% of oversized vaults trigger the limit correctly; client is always notified; server remains responsive.
**Stakeholders:** Users with accidentally large vault roots, server reliability.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/security-threat-model#Sub-threat-5.1]], [[adr/ADR012-parser-safety-policy#5-file-count-limit]].
