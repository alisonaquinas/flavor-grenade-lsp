---
title: Verification — Block References
tags: [test/verification, "requirements/block-references"]
aliases: [Verify Block References]
---

# Verification — Block References

## Purpose

This document defines the scripted and agent-driven verification test cases for the Block Reference
Requirements of flavor-grenade-lsp. Each test case is derived directly from the Planguage `Meter`
field of its corresponding requirement and references the BDD scenarios in
[[bdd/features/block-references]] where coverage exists. These tests are the authoritative
verification record for block anchor indexing, cross-reference diagnostics, completion at the
`[[doc#^` trigger position, and the end-of-line anchor classification rule.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Block.Anchor.Indexing` | All end-of-line `^blockid` anchors in body text are registered in `OFMIndex.blockAnchors` | Phase 1 |
| `Block.CrossRef.Diagnostic` | `[[doc#^nonexistent]]` produces exactly one FG005 in multi-file mode; suppressed in single-file mode | Phase 1 |
| `Block.Completion.Offer` | Completion at `[[doc#^` offers all `^blockid` values from `OFMIndex.blockAnchors` for the target doc | Phase 1 |
| `Block.Anchor.Lineend` | Only end-of-line body-text `^id` patterns are indexed; mid-sentence, code-block, and heading positions are excluded | Phase 1 |

---

## Test Cases

### TC-VER-BLOK-001 — Block.Anchor.Indexing

**Planguage Tag:** `Block.Anchor.Indexing`
**Gist:** All `^blockid` anchors present in a document's body text must be discovered during indexing and registered in `OFMIndex.blockAnchors` for that document.
**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Block anchor is indexed and go-to-definition navigates to it`, `Block anchor with alphanumeric ID only is valid`
**Phase:** Phase 1

**Setup:**
- A vault with at least 5 documents. Each document contains:
  - At least 5 end-of-line `^blockid` anchors in body text paragraphs and list items.
  - At least 2 mid-sentence `^id` occurrences (e.g., `x^2 is quadratic`, `value ^temp is`).
  - At least 1 `^blockid` inside a fenced code block.
- An `.obsidian/` marker directory at the vault root.

**Scripted steps:**

```gherkin
Given a vault with at least 5 documents, each containing:
  | anchor type            | example                                  | expected in index |
  | end-of-line body para  | "A paragraph. ^anchor-p1"                | yes               |
  | end-of-line list item  | "- A list item ^anchor-l1"               | yes               |
  | mid-sentence (math)    | "x^2 is quadratic"                       | no                |
  | mid-sentence (prose)   | "the value ^temp is used"                | no                |
  | inside fenced code     | "``` ^anchor-c1 ```"                     | no                |

When the VaultIndex / OFMIndex build is run (triggered by textDocument/didOpen for all docs)

Then OFMIndex.blockAnchors for each document contains all and only the end-of-line body-text anchors
And mid-sentence and code-block ^id tokens are absent from OFMIndex.blockAnchors
And (indexed anchors / expected anchors) × 100 = 100
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 5 documents (`notes/doc-a.md` through `notes/doc-e.md`). Each document contains exactly:
   - Lines ending with `^anchor-01` through `^anchor-05` (in body paragraphs and list items).
   - Lines containing `x^2`, `y^3`, mid-sentence `^mid-token` (not at line end).
   - A fenced code block with `^code-anchor` inside it.
3. Agent spawns server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for all 5 documents.
6. Agent uses the server's index inspection mechanism (or a dedicated test endpoint if available) to query `OFMIndex.blockAnchors` for each document. If no direct inspection is available, agent verifies via `textDocument/completion` at `[[doc-a#^` position to enumerate indexed anchors.
7. Agent enumerates the expected anchor set per document from fixture content (only end-of-line body-text occurrences).
8. Agent compares returned set against expected set per document; asserts (indexed / expected) × 100 = 100% per document.
9. Agent asserts no mid-sentence or code-block `^id` token appears in any `blockAnchors` result.
10. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of expected end-of-line body-text `^blockid` anchors indexed; 0 false-positive anchors indexed.
**Fail criterion:** Any expected end-of-line body-text `^blockid` absent from `OFMIndex.blockAnchors`, or any mid-sentence or code-block token present.

---

### TC-VER-BLOK-002 — Block.CrossRef.Diagnostic

**Planguage Tag:** `Block.CrossRef.Diagnostic`
**Gist:** A `[[doc#^nonexistent]]` wiki-link referencing a block anchor that does not exist in `OFMIndex.blockAnchors` for the target document must produce one FG005 (BrokenBlockRef) diagnostic; this diagnostic must be suppressed when the server is in single-file mode.
**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Broken block reference reports FG005`, `Block anchor mid-sentence is NOT treated as a block anchor`
**Phase:** Phase 1

**Setup:**
- **Multi-file mode setup:** A vault with at least 3 documents. One document (`notes/checker.md`) contains:
  - 3 `[[source#^validanchor]]` links (target anchors exist in the indexed source document).
  - 3 `[[source#^missinganchor]]` links (target anchors do not exist in any document).
- **Single-file mode setup:** The same `notes/checker.md` opened without a vault root (no `rootUri` in `initialize`).

**Scripted steps:**

```gherkin
# Multi-file mode
Given the server is initialised with a vault rootUri
And "notes/source.md" contains end-of-line anchors ^validanchor-1, ^validanchor-2, ^validanchor-3
And "notes/checker.md" contains:
  | link                            | anchor exists | expected diagnostics |
  | [[source#^validanchor-1]]       | yes           | 0 FG005              |
  | [[source#^validanchor-2]]       | yes           | 0 FG005              |
  | [[source#^validanchor-3]]       | yes           | 0 FG005              |
  | [[source#^missinganchor-1]]     | no            | 1 FG005              |
  | [[source#^missinganchor-2]]     | no            | 1 FG005              |
  | [[source#^missinganchor-3]]     | no            | 1 FG005              |

When textDocument/didOpen is processed for all documents in multi-file mode
Then each valid anchor link produces zero FG005 diagnostics
And each missing anchor link produces exactly one FG005 diagnostic
And (correctly diagnosed links / 6 total links) × 100 = 100

# Single-file mode
Given the server is initialised without a vault rootUri (single-file mode)
And "notes/checker.md" is opened directly

When textDocument/didOpen is processed for "notes/checker.md"
Then zero FG005 diagnostics are emitted for any link in "notes/checker.md"
```

**Agent-driven steps (multi-file mode):**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/source.md` with body lines ending in `^validanchor-1`, `^validanchor-2`, `^validanchor-3`.
3. Agent writes `notes/checker.md` with the 6 links described in the setup table.
4. Agent writes a third unrelated document for vault size.
5. Agent spawns server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` (with `rootUri`) + `initialized`.
7. Agent sends `textDocument/didOpen` for `notes/source.md` then `notes/checker.md`.
8. Agent collects `textDocument/publishDiagnostics` notifications for `notes/checker.md`.
9. Agent asserts: 3 links to valid anchors produce 0 FG005 each; 3 links to missing anchors produce exactly 1 FG005 each.
10. Agent sends `shutdown` + `exit`.

**Agent-driven steps (single-file mode):**
11. Agent spawns server fresh: `bun run start 2>/dev/null &`
12. Agent sends `initialize` WITHOUT `rootUri` (single-file mode) + `initialized`.
13. Agent sends `textDocument/didOpen` for `notes/checker.md` only.
14. Agent collects `textDocument/publishDiagnostics` for `notes/checker.md`.
15. Agent asserts zero FG005 diagnostics in the published set.
16. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct diagnostic behaviour in both multi-file mode (FG005 emitted for broken anchors) and single-file mode (FG005 suppressed).
**Fail criterion:** Any valid anchor link producing FG005; any broken anchor link failing to produce FG005 in multi-file mode; any FG005 appearing in single-file mode.

---

### TC-VER-BLOK-003 — Block.Completion.Offer

**Planguage Tag:** `Block.Completion.Offer`
**Gist:** When the cursor is positioned after `[[doc#^` in a wiki-link, the completion response must offer all `^blockid` values registered in `OFMIndex.blockAnchors` for the resolved target document.
**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Completion offers block anchor values after [[doc#^ trigger`
**Phase:** Phase 1

**Setup:**
- A vault with at least 5 documents, each containing at least 4 named end-of-line block anchors.
- A new scratch document `notes/index.md` used for issuing completion requests.
- Cursor positions in `notes/index.md` set to immediately after `[[targetDoc#^` for each target document.

**Scripted steps:**

```gherkin
Given "notes/doc-a.md" has been indexed with anchors: ^ref-a1, ^ref-a2, ^ref-a3, ^ref-a4
And "notes/doc-b.md" has been indexed with anchors: ^ref-b1, ^ref-b2, ^ref-b3, ^ref-b4

When a textDocument/completion request is made in "notes/index.md"
  at the cursor position immediately after "[[doc-a#^"
Then the completion list includes "ref-a1"
And the completion list includes "ref-a2"
And the completion list includes "ref-a3"
And the completion list includes "ref-a4"
And (anchor IDs in completion list / total anchors in OFMIndex for doc-a) × 100 = 100

When a textDocument/completion request is made at the cursor position immediately after "[[doc-b#^"
Then the completion list includes "ref-b1"
And the completion list includes "ref-b2"
And no anchors from "doc-a" appear in the list
And (anchor IDs in completion list / total anchors in OFMIndex for doc-b) × 100 = 100
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes 5 documents (`notes/doc-a.md` through `notes/doc-e.md`), each with exactly 4 body lines ending in named `^block-*` anchors.
3. Agent writes `notes/index.md` with lines for each target:
   ```
   [[doc-a#^
   [[doc-b#^
   [[doc-c#^
   [[doc-d#^
   [[doc-e#^
   ```
   Each line is on its own row (0-indexed line 0 through 4); cursor column is set to the character position immediately after `^` (column 9 for `[[doc-a#^`).
4. Agent spawns server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` + `initialized`.
6. Agent sends `textDocument/didOpen` for all documents.
7. For each target document, agent sends `textDocument/completion` at the cursor position immediately after `[[docName#^`.
8. Agent collects `CompletionItem.label` and `insertText` values from each response.
9. Agent compares returned set against the known anchor IDs from each document's fixture content.
10. Agent computes (anchor IDs in completion list / total anchor IDs in OFMIndex) × 100 per target document; asserts 100% for each.
11. Agent verifies no cross-document anchor leakage (anchors from doc-b do not appear in doc-a completion, etc.).
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% of known block anchors for each target document appear in the completion list at the `[[docName#^` position; no cross-document anchor leakage.
**Fail criterion:** Any anchor ID registered in `OFMIndex.blockAnchors` absent from the completion list for the corresponding document.

---

### TC-VER-BLOK-004 — Block.Anchor.Lineend

**Planguage Tag:** `Block.Anchor.Lineend`
**Gist:** Only `^id` patterns that appear at the end of a line of body text are treated as block anchor definitions; `^id` patterns occurring mid-sentence or inside code blocks must not be indexed as block anchors.
**Type:** Both
**BDD Reference:** [[bdd/features/block-references]] — `Block anchor must be at end of line to be valid`, `Block anchor mid-sentence is NOT treated as a block anchor`
**Phase:** Phase 1

**Setup:**
- A single fixture document `notes/classification-test.md` containing precisely the following, one per separate line or within a line as noted:
  - 5 valid end-of-line anchors: `paragraph text ^anchor-a`, `- list item ^anchor-b`, `Another sentence. ^anchor-c`, `- nested list ^anchor-d`, `Final body line ^anchor-e`.
  - 3 mid-sentence occurrences: `x^2 is quadratic` (math notation), `the value ^temp is used here` (not at line end), `note^1 reference` (footnote-style).
  - 2 inside a fenced code block: a line `code example ^anchor-x` and `another ^anchor-y` within the code fence.
  - 1 at end of a heading line: `## Heading ^anchor-h` (heading anchor — Obsidian does not support anchors on headings).

**Scripted steps:**

```gherkin
Given "notes/classification-test.md" contains the tokens listed in Setup

When OFMIndex build runs (textDocument/didOpen for "notes/classification-test.md")

Then OFMIndex.blockAnchors for "notes/classification-test.md" contains "anchor-a"
And OFMIndex.blockAnchors contains "anchor-b"
And OFMIndex.blockAnchors contains "anchor-c"
And OFMIndex.blockAnchors contains "anchor-d"
And OFMIndex.blockAnchors contains "anchor-e"
And OFMIndex.blockAnchors does NOT contain "2" (from x^2)
And OFMIndex.blockAnchors does NOT contain "temp" (from ^temp mid-sentence)
And OFMIndex.blockAnchors does NOT contain "1" (from note^1)
And OFMIndex.blockAnchors does NOT contain "anchor-x" (inside code block)
And OFMIndex.blockAnchors does NOT contain "anchor-y" (inside code block)
And OFMIndex.blockAnchors does NOT contain "anchor-h" (on heading line)
And (correctly classified positions / 11 total positions) × 100 = 100
```

**Agent-driven steps:**
1. Agent creates vault with `.obsidian/` marker directory.
2. Agent writes `notes/classification-test.md` with the following exact content:
   ```markdown
   # Classification Test

   ## Heading ^anchor-h

   paragraph text ^anchor-a
   - list item ^anchor-b
   Another sentence. ^anchor-c
   - nested list ^anchor-d
   Final body line ^anchor-e

   x^2 is quadratic
   the value ^temp is used here
   note^1 reference

   ```python
   code example ^anchor-x
   another ^anchor-y
   ```
   ```
3. Agent spawns server: `bun run start 2>/dev/null &`
4. Agent sends `initialize` + `initialized`.
5. Agent sends `textDocument/didOpen` for `notes/classification-test.md`.
6. Agent enumerates indexed anchors via `textDocument/completion` at `[[classification-test#^` in a scratch document (cursor immediately after `^`), or via the test inspection endpoint if available.
7. Agent verifies the returned anchor set equals exactly `{anchor-a, anchor-b, anchor-c, anchor-d, anchor-e}`.
8. Agent verifies the returned set does NOT contain `2`, `temp`, `1`, `anchor-x`, `anchor-y`, or `anchor-h`.
9. Agent computes (correctly classified positions / 11) × 100; asserts 100%.
10. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct classification — exactly the 5 end-of-line body-text anchors indexed; all 6 other tokens excluded.
**Fail criterion:** Any mid-sentence, code-block, or heading `^id` token present in `OFMIndex.blockAnchors`, or any end-of-line body-text `^id` absent from `OFMIndex.blockAnchors`.
