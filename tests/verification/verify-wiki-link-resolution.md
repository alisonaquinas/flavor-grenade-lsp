---
title: Verification — Wiki-Link Resolution
tags: [test/verification, "requirements/wiki-link-resolution"]
aliases: [Verify Wiki-Link Resolution]
---

# Verification — Wiki-Link Resolution

## Purpose

This file defines scripted and agent-driven verification test cases for the five Planguage requirements in the wiki-link resolution domain. Each test case maps directly to one Planguage tag defined in [[requirements/wiki-link-resolution]] and validates the server's behaviour against the Fail and Goal thresholds stated there. The tests cover style-mode binding for completion and rename edits, alias-based link resolution, single-file mode cross-file suppression, FG001 suppression on non-markdown inline URLs, and ignore-glob enforcement in completion and definition responses.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Link.Wiki.StyleBinding` | Completion items and rename edits must conform to the active `wiki.style` setting. | Phase 1 |
| `Link.Wiki.AliasResolution` | YAML `aliases:` values must be treated as valid link targets equivalent to the document's primary name. | Phase 1 |
| `Link.Resolution.ModeScope` | Single-file mode must suppress all cross-file link resolution and return no cross-file results. | Phase 1 |
| `Link.Inline.URLSkip` | Non-markdown inline link URLs must produce no FG001 diagnostic. | Phase 1 |
| `Link.Resolution.IgnoreGlob` | Files matching configured ignore patterns must be absent from all completion candidates and definition results. | Phase 2 |

## Test Cases

### TC-VER-WIKI-001 — Link.Wiki.StyleBinding

**Planguage Tag:** `Link.Wiki.StyleBinding`
**Gist:** Completion items and rename edits must conform to the wiki link style that is active in the current configuration.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario covers this requirement
**Phase:** Phase 1

**Setup:**
Configure a test vault with at least 10 documents whose titles differ from their file stems (e.g., `my-note.md` with frontmatter title `My Note`). Set `wiki.style` in the server configuration to each of the three values: `file-stem`, `title-slug`, `file-path-stem`. For each style value, a fresh server instance is initialised against the vault root.

**Scripted steps:**

```gherkin
Given a vault of 10 documents where each file stem differs from the document title
And the server configuration sets "wiki.style" to "file-stem"
When completion is triggered at a "[[" position in an open document
Then all CompletionItem.insertText values match the file-stem format
And when "wiki.style" is "title-slug" the same trigger yields title-slug formatted insertText values
And when "wiki.style" is "file-path-stem" the same trigger yields file-path-stem formatted insertText values
And for each style a rename WorkspaceEdit on any document title produces newText values conforming to that style
And (conforming items / total items) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes 10 fixture markdown files whose stems differ from their H1 titles (e.g., `my-note.md` with content `# My Note\nBody text.`).
3. Agent writes `.flavor-grenade.toml` with `wiki.style = "file-stem"`.
4. Agent spawns LSP server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` (with vault `rootUri`) + `initialized` JSON-RPC.
6. Agent sends `textDocument/didOpen` for a new document; sends `textDocument/completion` at a `[[` position; collects all `CompletionItem.insertText` values.
7. Agent validates each `insertText` value against the `file-stem` format rule from [[design/domain-layer]]; counts conforming vs. total.
8. Agent sends `workspace/executeCommand` (or equivalent) to trigger a rename on one document; collects all `newText` values from the returned `WorkspaceEdit`; validates conformance.
9. Agent shuts down; restarts with `wiki.style = "title-slug"`; repeats steps 6–8.
10. Agent shuts down; restarts with `wiki.style = "file-path-stem"`; repeats steps 6–8.
11. Agent computes (conforming items / total items) × 100 across all three style passes.
12. Agent records measurement against Fail/Goal thresholds.
13. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of completion items and rename `WorkspaceEdit` text edits conform to the active `wiki.style` setting.
**Fail criterion:** Any single non-conforming item (i.e., < 100%).

---

### TC-VER-WIKI-002 — Link.Wiki.AliasResolution

**Planguage Tag:** `Link.Wiki.AliasResolution`
**Gist:** YAML `aliases:` frontmatter values must be treated as valid link targets equivalent to the document's primary name.
**Type:** Both
**BDD Reference:** [[bdd/features/wiki-links]] — `Alias-based wiki-link resolves correctly`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 5 documents each declaring at least 2 distinct aliases in YAML frontmatter (e.g., `aliases: [Alias A, Alias B]`). Open a new document that contains `[[alias-text]]` wiki-links targeting those declared aliases.

**Scripted steps:**

```gherkin
Given a vault of 5 documents each declaring at least 2 YAML aliases in frontmatter
And a document "test.md" containing one "[[alias-text]]" link per declared alias
When the LSP processes textDocument/didOpen for "test.md"
Then no FG001 diagnostic is published for any alias-based wiki-link
And textDocument/completion at "[[" returns each declared alias as a candidate with correct detail
And textDocument/definition on each alias link returns a Location pointing to the declaring document
And (alias links resolving correctly / total alias links tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes 5 fixture documents each with frontmatter declaring 2 aliases, e.g.:
   ```
   ---
   aliases: [Alpha One, Alpha Two]
   ---
   # Source Alpha
   ```
3. Agent writes `test.md` containing `[[Alpha One]]`, `[[Alpha Two]]`, etc. for all 10 alias values.
4. Agent spawns LSP server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` + `initialized` JSON-RPC.
6. Agent sends `textDocument/didOpen` for `test.md`; collects `publishDiagnostics` notifications; asserts no `FG001` code appears on any alias link.
7. Agent sends `textDocument/completion` at a `[[` position; verifies all 10 declared aliases appear as `CompletionItem` entries with `detail` naming the owning document.
8. Agent sends `textDocument/definition` for the range of each alias token; asserts each response `Location.uri` points to the document that declared that alias.
9. Agent computes (alias links resolving correctly / total alias links tested) × 100.
10. Agent records measurement against Fail/Goal thresholds.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of alias links resolve correctly; no FG001 diagnostic is produced for any `[[alias-text]]` link that matches a declared alias.
**Fail criterion:** Any alias-based `[[link]]` that fails to resolve to its declaring document, or any alias link that produces FG001.

---

### TC-VER-WIKI-003 — Link.Resolution.ModeScope

**Planguage Tag:** `Link.Resolution.ModeScope`
**Gist:** Single-file mode must suppress all cross-file link resolution and must not return cross-file results in any LSP response.
**Type:** Both
**BDD Reference:** [[bdd/features/wiki-links]] — `Single-file mode suppresses FG001`
**Phase:** Phase 1

**Setup:**
Start the server in single-file mode by opening a single `.md` file without a workspace root — no `rootUri` or `workspaceFolders` in the `initialize` request. The open document contains wiki-links, headings, and references that would resolve cross-file in workspace mode.

**Scripted steps:**

```gherkin
Given no vault root is detected (single-file mode)
And the file "orphan.md" contains wiki-links, heading references, and block references to other files
When the LSP processes textDocument/completion at a "[[" position in "orphan.md"
And the LSP processes textDocument/definition on a wiki-link token in "orphan.md"
And the LSP processes textDocument/references on a heading token in "orphan.md"
Then no completion result item has a uri differing from "orphan.md"
And no definition result item has a uri differing from "orphan.md"
And no references result item has a uri differing from "orphan.md"
And (cross-file result items / total result items) × 100 equals 0
```

**Agent-driven steps:**

1. Agent creates a temp directory (no `.obsidian/` subdirectory, no vault root).
2. Agent writes `orphan.md` with content containing `[[some-other-note]]`, a heading `# My Heading`, and `[[another#^block]]`.
3. Agent spawns LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` with no `rootUri` and no `workspaceFolders` + `initialized` JSON-RPC.
5. Agent sends `textDocument/didOpen` for `orphan.md`.
6. Agent sends `textDocument/completion` at a `[[` position; collects all response items; records any whose `textEdit` or `data` uri differs from `orphan.md`'s URI.
7. Agent sends `textDocument/definition` on the `[[some-other-note]]` token range; records any response location whose `uri` differs from `orphan.md`'s URI.
8. Agent sends `textDocument/references` on the `# My Heading` token range; records any response location whose `uri` differs from `orphan.md`'s URI.
9. Agent asserts cross-file result count equals 0.
10. Agent records measurement against Fail/Goal thresholds.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** 0% of responses contain cross-file results.
**Fail criterion:** Any cross-file result item appearing in any LSP response while the server is in single-file mode.

---

### TC-VER-WIKI-004 — Link.Inline.URLSkip

**Planguage Tag:** `Link.Inline.URLSkip`
**Gist:** Standard inline Markdown links whose URL is not a markdown file path must produce no FG001 (BrokenWikiLink) diagnostic.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario covers this requirement
**Phase:** Phase 1

**Setup:**
Create a document containing at least 10 inline links: at least 3 `https://` URLs, 2 `mailto:` URLs, 2 `#fragment-only` links, 2 `ftp://` URLs, and 1 relative link to a `.md` file whose target does not exist in the vault. Open the document in the LSP client.

**Scripted steps:**

```gherkin
Given a document containing inline links: 3 https:// URLs, 2 mailto: URLs, 2 fragment-only links, 2 ftp:// URLs, and 1 relative .md link to a non-existent file
When the LSP processes textDocument/didOpen for the document
Then no FG001 diagnostic is produced for any inline link whose URL is not a .md file path
And exactly one FG001 diagnostic is produced for the relative .md link whose target does not exist
And the count of FG001 diagnostics overlapping non-markdown inline link URLs equals 0
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `links.md` with exact content:
   ```
   [External](https://example.com)
   [Another](https://obsidian.md)
   [Third](https://github.com)
   [Mail me](mailto:user@example.com)
   [Support](mailto:support@example.com)
   [Top](#introduction)
   [Section](#getting-started)
   [FTP one](ftp://files.example.com/data.zip)
   [FTP two](ftp://archive.example.com/backup.tar)
   [Relative doc](./nonexistent-document.md)
   ```
3. Agent spawns LSP server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` (with vault `rootUri`) + `initialized` JSON-RPC.
5. Agent sends `textDocument/didOpen` for `links.md`; collects all `publishDiagnostics` notifications.
6. Agent filters collected diagnostics to those with code `FG001`.
7. Agent checks that none of the FG001 diagnostics have a range overlapping the URL portion of the 9 non-markdown inline links.
8. Agent verifies exactly one FG001 diagnostic is present, and its range covers the `./nonexistent-document.md` URL.
9. Agent records measurement against Fail/Goal thresholds.
10. Agent sends `shutdown` + `exit`.

**Pass criterion:** 0% of non-markdown inline links produce FG001; the single relative `.md` link to a non-existent target correctly produces FG001.
**Fail criterion:** Any FG001 diagnostic produced for a non-markdown inline link URL.

---

### TC-VER-WIKI-005 — Link.Resolution.IgnoreGlob

**Planguage Tag:** `Link.Resolution.IgnoreGlob`
**Gist:** Files matching `.gitignore`-style glob patterns in the server configuration must be absent from all completion candidates and go-to-definition results.
**Type:** Both
**BDD Reference:** **BDD gap** — no scenario covers this requirement
**Phase:** Phase 2

**Setup:**
Configure `ignore_patterns` in `.flavor-grenade.toml` to match a specific subdirectory (e.g., `templates/**`). Place at least 5 markdown documents inside that subdirectory and at least 5 outside it. The server is initialised against the vault root with the ignore configuration active.

**Scripted steps:**

```gherkin
Given a vault with "ignore_patterns = ['templates/**']" in .flavor-grenade.toml
And at least 5 markdown documents exist under "templates/" and at least 5 under other directories
When completion is triggered at a "[[" position in an un-ignored document
Then no CompletionItem in the response references a file whose path matches "templates/**"
And when textDocument/definition is invoked on a "[[link]]" whose resolved path is inside "templates/"
Then the definition response is null or empty
And (requests with no ignored-file results / total requests tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `.flavor-grenade.toml` with:
   ```toml
   ignore_patterns = ["templates/**"]
   ```
3. Agent writes 5 markdown documents under `templates/` (e.g., `templates/daily.md`, `templates/meeting.md`, …).
4. Agent writes 5 markdown documents under `notes/` (e.g., `notes/alpha.md`, …).
5. Agent writes `notes/index.md` as the working document; also writes a `[[link]]` in it pointing to `templates/daily` (ignored file).
6. Agent spawns LSP server: `bun run start 2>/dev/null &`
7. Agent sends `initialize` + `initialized` JSON-RPC.
8. Agent sends `textDocument/didOpen` for `notes/index.md`; sends `textDocument/completion` at a `[[` position; collects all `CompletionItem` entries; asserts none reference a path under `templates/`.
9. Agent sends `textDocument/definition` for the range of `[[templates/daily]]`; asserts the response is `null` or an empty array.
10. Agent computes (requests with no ignored-file results / total requests tested) × 100.
11. Agent records measurement against Fail/Goal thresholds.
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 0 ignored-file entries in any completion or definition response.
**Fail criterion:** Any completion candidate or definition result whose resolved file path matches an active ignore pattern.
