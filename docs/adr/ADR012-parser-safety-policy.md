---
adr: "012"
title: Parser Safety Policy — Timeouts, Depth Limits, ReDoS-Safe Regex Discipline
status: accepted
date: 2026-04-17
---

# ADR012 — Parser Safety Policy

## Context

The OFM parser (introduced in Phase 3) reads every `.md` file in the vault and applies regular expressions and recursive descent logic to extract wiki-links, tags, block anchors, frontmatter YAML, callouts, embeds, and comments. Because vault content is partially trusted — it may originate from shared vaults, cloned repositories, or Obsidian Publish mirrors — the parser is exposed to adversarially crafted input.

Research documented in [[research/security-threat-model]] identifies three concrete parser-level threats:

1. **ReDoS** — crafted input that triggers catastrophic backtracking in a regex engine, locking the Node.js/Bun event loop for seconds or indefinitely. Multiple Markdown parsing libraries have ReDoS CVEs (markdown-it CVE-2022-21670, CodeMirror CVE-2025-6493, marked pre-4.0.10, markdown-to-jsx GHSL-2020-300).
2. **Deeply nested YAML** — YAML anchors and aliases can produce exponentially large object graphs ("billion laughs" pattern), exhausting heap memory during frontmatter parsing.
3. **Infinite recursion in embed resolution** — `![[A]]` embedding `![[B]]` embedding `![[A]]` creates a cycle that causes unbounded recursion in any naive embed resolver.

The threat is real and well-evidenced; mitigation belongs at the parser boundary, not in the LSP handler layer.

## Decision

The OFM parser must conform to all of the following rules:

### 1. ReDoS-Safe Regex Discipline

Every regular expression used in the OFM parser must be audited before merge using **at least one** of:

- Static analysis with `safe-regex` (npm package) or `vuln-regex-detector`
- Manual worst-case complexity analysis demonstrating linear or near-linear behaviour on adversarial inputs
- Replacement with a non-regex state machine for constructs with unbounded structure (e.g., wiki-link contents, frontmatter bodies)

No regex with catastrophic backtracking potential (exponential or polynomial worst case against crafted input) may be merged into `src/parser/`.

The following patterns are **prohibited** without explicit justification in a code review:

- Nested quantifiers on overlapping character classes (e.g., `(a+)+`, `([a-z]*)*`)
- Alternation with common prefixes under a quantifier (e.g., `(foo|foobar)+`)
- Greedy quantifiers on `.*` or `.+` inside capturing groups that can match the same character

### 2. Per-File Parse Timeout

The parser must complete processing of any single vault file within **200 ms** of wall clock time. If a parse operation exceeds this limit, the parser must:

1. Abort the parse operation (via a `AbortController` signal or timeout wrapper)
2. Record a warning-level log entry identifying the file path and elapsed time
3. Return an empty parse result for that file (no crash, no partial index corruption)
4. Continue indexing the remaining vault files

The timeout is enforced at the file level, not the vault level, so a single pathological file cannot block the entire indexing pass.

### 3. YAML Frontmatter Depth and Alias Limits

Frontmatter YAML must be parsed with the following constraints applied to `js-yaml`'s `load()`:

- **`maxAliases: 50`** — cap YAML alias expansion to prevent billion-laughs amplification
- **Maximum frontmatter size: 64 KB** — frontmatter exceeding this size is treated as malformed and produces FG007 (MalformedFrontmatter); the remainder of the file is still parsed
- **Try/catch required** — any YAML parse exception is caught; the exception message is logged (without the YAML content) and the file is indexed with an empty frontmatter block

### 4. Embed Cycle Detection and Depth Limit

The embed resolver must maintain a `Set<string>` of visited document URIs for each resolution chain. A document URI encountered a second time in the same chain produces FG005 (BrokenBlockRef repurposed as CircularEmbed, or a dedicated FG008 if the code registry is extended). Cycle detection operates independently of the depth limit.

Additionally, embed resolution must not recurse deeper than **10 levels** regardless of whether a cycle exists. At depth 10, resolution stops and the embed is treated as unresolved.

### 5. File Count Limit

During initial vault indexing, the VaultIndex must enforce a configurable maximum file count. The built-in default is **50,000 files**. When the limit is reached:

1. Indexing stops
2. A `window/showMessage` notification is sent to the client with severity Warning
3. The server continues operating with a partial index
4. The limit is configurable via `[vault] max_files` in `.flavor-grenade.toml`

## Consequences

### Positive

- Vault content — including content crafted by third parties in shared vaults — cannot cause the server to lock up, exhaust memory, or crash
- All parser contributors are given explicit, reviewable criteria for regex safety
- The timeout and limit policies make server behaviour predictable and bounded regardless of vault content

### Negative

- A hard parse timeout (200 ms) will cause very large or complex files to produce empty parse results; authors of exceptionally large documents may notice incomplete diagnostics
- YAML alias limit of 50 will reject legitimate (if unusual) YAML frontmatter that uses extensive anchor references
- Additional implementation complexity in the parser: timeout wrappers, cycle-detection sets, depth counters

### Neutral

- The `safe-regex` audit requirement applies only to `src/parser/`; LSP handler layer regexes are not required to pass the same audit (though they should be kept simple)
- The file count limit does not affect the rename path — rename operates on explicitly named files, not the full index

## Related

- [[adr/ADR013-vault-root-confinement]] — complements this ADR with path safety rules
- [[research/security-threat-model#Threat-Category-1]] — threat evidence
- [[requirements/security/parser-safety]] — Planguage requirements derived from this ADR
- [[plans/phase-03-ofm-parser]] — implementation phase
