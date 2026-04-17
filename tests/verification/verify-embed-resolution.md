---
title: Verification — Embed Resolution
tags: [test/verification, "requirements/embed-resolution"]
aliases: [Verify Embed Resolution]
---

# Verification — Embed Resolution

## Purpose

This file defines scripted and agent-driven verification test cases for the four Planguage requirements in the embed resolution domain. Each test case maps directly to one Planguage tag defined in [[requirements/embed-resolution]] and validates the server's diagnostic behaviour against the Fail and Goal thresholds stated there. The tests cover correct FG004 emission for missing markdown embed targets, correct diagnostic code assignment (FG004 not FG001) for image embeds, two-level validation for heading-scoped embeds, and two-level validation for block-anchor embeds.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Embed.Resolution.MarkdownTarget` | `![[file.md]]` embeds must resolve against VaultIndex; FG004 emitted when the target is absent. | Phase 1 |
| `Embed.Resolution.ImageTarget` | `![[image.png]]` embeds must never produce FG001; FG004 applies only when the image file is absent. | Phase 1 |
| `Embed.HeadingEmbed.Resolution` | `![[doc#Heading]]` embeds must validate both the document and the named heading; FG004 with distinct messages for each failure case. | Phase 1 |
| `Embed.BlockEmbed.Resolution` | `![[doc#^blockid]]` embeds must validate both the document and the block anchor; FG004 when either is absent. | Phase 1 |

## Test Cases

### TC-VER-EMBD-001 — Embed.Resolution.MarkdownTarget

**Planguage Tag:** `Embed.Resolution.MarkdownTarget`
**Gist:** `![[file.md]]` embed syntax must resolve to documents present in VaultIndex, and must produce FG004 (BrokenEmbed) when the target document cannot be found.
**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Valid markdown embed passes without diagnostic` and `Broken embed reports FG004 with Warning severity`
**Phase:** Phase 1

**Setup:**
Construct a test vault with at least 10 documents and at least 5 `![[target.md]]` embed links: at least 3 pointing to existing documents and at least 2 pointing to non-existent documents. All documents are opened and `textDocument/publishDiagnostics` is allowed to settle.

**Scripted steps:**

```gherkin
Given a vault with at least 10 documents
And a document "test-embeds.md" containing:
  "![[existing-a]]" and "![[existing-b]]" and "![[existing-c]]" pointing to present documents
  "![[missing-x]]" and "![[missing-y]]" pointing to absent documents
When the LSP processes textDocument/didOpen for "test-embeds.md"
Then no diagnostics of any kind are published for "![[existing-a]]", "![[existing-b]]", or "![[existing-c]]"
And exactly one FG004 diagnostic is published for "![[missing-x]]" with its range covering the full embed target token
And exactly one FG004 diagnostic is published for "![[missing-y]]" with its range covering the full embed target token
And (correctly classified embeds / total embed links tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes 10 fixture markdown documents: `notes/alpha.md`, `notes/beta.md`, `notes/gamma.md`, and 7 others.
3. Agent writes `notes/test-embeds.md` with content:
   ```
   ![[alpha]]
   ![[beta]]
   ![[gamma]]
   ![[missing-x]]
   ![[missing-y]]
   ```
4. Agent spawns LSP server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` (with vault `rootUri`) + `initialized` JSON-RPC.
6. Agent sends `textDocument/didOpen` for `notes/test-embeds.md`; waits for `publishDiagnostics` to settle (no further notifications for 200 ms).
7. Agent collects all diagnostics for `notes/test-embeds.md`.
8. Agent asserts no diagnostic of any code is associated with the ranges of `![[alpha]]`, `![[beta]]`, or `![[gamma]]`.
9. Agent asserts exactly one diagnostic with code `FG004` is associated with `![[missing-x]]`; asserts its range covers the full embed target token.
10. Agent asserts exactly one diagnostic with code `FG004` is associated with `![[missing-y]]`; asserts its range covers the full embed target token.
11. Agent computes (correctly classified embeds / total embed links tested) × 100; records against Fail/Goal thresholds.
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct classification — existing-target embeds produce zero diagnostics; missing-target embeds produce exactly one FG004 each.
**Fail criterion:** Any existing-target embed producing FG004, or any missing-target embed failing to produce FG004.

---

### TC-VER-EMBD-002 — Embed.Resolution.ImageTarget

**Planguage Tag:** `Embed.Resolution.ImageTarget`
**Gist:** `![[image.png]]` embed links pointing to image files must not produce FG001 (BrokenWikiLink); only FG004 (BrokenEmbed) applies when the image file is absent.
**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Image embed for missing image reports FG004 not FG001`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 6 image embed links: 3 pointing to image files that exist in the vault (`png`, `jpg`, `svg`), and 3 pointing to image files that do not exist. All documents are opened and `textDocument/publishDiagnostics` is awaited.

**Scripted steps:**

```gherkin
Given a vault containing "assets/present.png", "assets/present.jpg", "assets/present.svg"
And a document "notes/image-test.md" containing:
  "![[present.png]]", "![[present.jpg]]", "![[present.svg]]" (present files)
  "![[missing-a.png]]", "![[missing-b.jpg]]", "![[missing-c.svg]]" (absent files)
When the LSP processes textDocument/didOpen for "notes/image-test.md"
Then no FG001 diagnostic appears on any image embed link regardless of file existence
And no FG004 diagnostic is produced for "![[present.png]]", "![[present.jpg]]", or "![[present.svg]]"
And exactly one FG004 diagnostic is produced for each of "![[missing-a.png]]", "![[missing-b.jpg]]", "![[missing-c.svg]]"
And (correctly handled image embeds / total image embed links tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker and `assets/` subdirectory.
2. Agent writes binary placeholder files `assets/present.png`, `assets/present.jpg`, `assets/present.svg` (any non-empty content suffices; the agent writes a 1-byte placeholder).
3. Agent writes `notes/image-test.md` with content:
   ```
   ![[present.png]]
   ![[present.jpg]]
   ![[present.svg]]
   ![[missing-a.png]]
   ![[missing-b.jpg]]
   ![[missing-c.svg]]
   ```
4. Agent spawns LSP server: `bun run start 2>/dev/null &`
5. Agent sends `initialize` + `initialized` JSON-RPC.
6. Agent sends `textDocument/didOpen` for `notes/image-test.md`; waits for `publishDiagnostics` to settle.
7. Agent collects all diagnostics; filters to those with code `FG001`; asserts the filtered set is empty.
8. Agent asserts no `FG004` diagnostic is associated with the ranges of the three present-image embeds.
9. Agent asserts exactly one `FG004` diagnostic is associated with each of the three absent-image embeds.
10. Agent computes (correctly handled image embeds / total image embed links tested) × 100; records against Fail/Goal thresholds.
11. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct diagnostic assignment — no FG001 on any image embed; FG004 only for absent image files; zero diagnostics for present image files.
**Fail criterion:** Any FG001 on any image embed link, or any present-image embed producing FG004.

---

### TC-VER-EMBD-003 — Embed.HeadingEmbed.Resolution

**Planguage Tag:** `Embed.HeadingEmbed.Resolution`
**Gist:** `![[doc#Heading]]` section embed syntax must validate that both the target document exists in VaultIndex and that the named heading exists within that document, producing appropriate diagnostics when either is absent.
**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Heading embed validates both doc and heading exist` and `Heading embed with nonexistent heading reports FG004`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 3 documents each containing at least 3 headings. Author a fourth document with 6 heading embed links: 2 valid (document and heading both exist), 2 with a non-existent document, and 2 with an existing document but a non-existent heading.

**Scripted steps:**

```gherkin
Given a vault with documents "notes/doc-a.md" (headings: "## Alpha", "## Beta", "## Gamma"),
  "notes/doc-b.md", "notes/doc-c.md" (each with 3 headings)
And a document "notes/heading-test.md" containing:
  "![[doc-a#Alpha]]" and "![[doc-a#Beta]]" (valid — document and heading exist)
  "![[nonexistent-doc#Any Heading]]" and "![[also-missing#Heading]]" (missing document)
  "![[doc-a#NoSuchHeading]]" and "![[doc-b#NoSuchHeading]]" (existing doc, missing heading)
When the LSP processes textDocument/didOpen for "notes/heading-test.md"
Then the 2 valid embeds produce zero diagnostics
And the 2 missing-document embeds each produce FG004 with a message referencing the document name
And the 2 missing-heading embeds each produce FG004 with a message referencing the heading name
And (correctly diagnosed embeds / total embeds tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `notes/doc-a.md`:
   ```
   # Doc A
   ## Alpha
   Content under alpha.
   ## Beta
   Content under beta.
   ## Gamma
   Content under gamma.
   ```
3. Agent writes `notes/doc-b.md` and `notes/doc-c.md` each with 3 headings (different names).
4. Agent writes `notes/heading-test.md`:
   ```
   ![[doc-a#Alpha]]
   ![[doc-a#Beta]]
   ![[nonexistent-doc#Any Heading]]
   ![[also-missing#Heading]]
   ![[doc-a#NoSuchHeading]]
   ![[doc-b#NoSuchHeading]]
   ```
5. Agent spawns LSP server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized` JSON-RPC.
7. Agent sends `textDocument/didOpen` for `notes/heading-test.md`; waits for `publishDiagnostics` to settle.
8. Agent collects diagnostics for `notes/heading-test.md`.
9. Agent asserts no diagnostic is associated with the ranges of `![[doc-a#Alpha]]` or `![[doc-a#Beta]]`.
10. Agent asserts the 2 missing-document embeds each produce exactly one FG004 whose `message` field contains the document name (`nonexistent-doc` or `also-missing`).
11. Agent asserts the 2 missing-heading embeds each produce exactly one FG004 whose `message` field contains the heading name (`NoSuchHeading`).
12. Agent computes (correctly diagnosed embeds / total embeds tested) × 100; records against Fail/Goal thresholds.
13. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct diagnosis across all three cases — valid embeds produce no diagnostic, missing-document embeds produce FG004 referencing the document name, missing-heading embeds produce FG004 referencing the heading name.
**Fail criterion:** Any valid heading embed producing a diagnostic, or any broken heading embed failing to produce FG004.

---

### TC-VER-EMBD-004 — Embed.BlockEmbed.Resolution

**Planguage Tag:** `Embed.BlockEmbed.Resolution`
**Gist:** `![[doc#^blockid]]` block embed syntax must validate that the target document exists and that the referenced `^blockid` anchor is present in that document, producing FG004 when either condition is unmet.
**Type:** Both
**BDD Reference:** [[bdd/features/embeds]] — `Block embed validates block anchor exists in target document` and `Block embed with nonexistent block anchor reports FG004`
**Phase:** Phase 1

**Setup:**
Create a test vault with at least 3 documents each containing at least 3 block-anchor definitions (e.g., `paragraph text ^anchor-id`). Author a document with 6 block embed links: 2 valid (document and block anchor both exist), 2 referencing a non-existent document, and 2 referencing an existing document with a non-existent block anchor.

**Scripted steps:**

```gherkin
Given a vault with "notes/source.md" containing block anchors "^anchor-one", "^anchor-two", "^anchor-three"
And documents "notes/source-b.md" and "notes/source-c.md" each with 3 block anchors
And a document "notes/block-test.md" containing:
  "![[source#^anchor-one]]" and "![[source#^anchor-two]]" (valid)
  "![[missing-doc#^anchor-one]]" and "![[also-missing#^any-anchor]]" (missing document)
  "![[source#^no-such-anchor]]" and "![[source-b#^no-such-anchor]]" (existing doc, missing anchor)
When the LSP processes textDocument/didOpen for "notes/block-test.md"
Then the 2 valid block embeds produce zero diagnostics
And all 4 broken block embeds each produce exactly one FG004
And (correctly diagnosed embeds / total embeds tested) × 100 equals 100
```

**Agent-driven steps:**

1. Agent creates temp vault directory with `.obsidian/` marker.
2. Agent writes `notes/source.md`:
   ```
   # Source Document

   First paragraph. ^anchor-one

   Second paragraph. ^anchor-two

   Third paragraph. ^anchor-three
   ```
3. Agent writes `notes/source-b.md` and `notes/source-c.md` each with 3 block anchor definitions using different anchor IDs.
4. Agent writes `notes/block-test.md`:
   ```
   ![[source#^anchor-one]]
   ![[source#^anchor-two]]
   ![[missing-doc#^anchor-one]]
   ![[also-missing#^any-anchor]]
   ![[source#^no-such-anchor]]
   ![[source-b#^no-such-anchor]]
   ```
5. Agent spawns LSP server: `bun run start 2>/dev/null &`
6. Agent sends `initialize` + `initialized` JSON-RPC.
7. Agent sends `textDocument/didOpen` for `notes/block-test.md`; waits for `publishDiagnostics` to settle.
8. Agent collects all diagnostics for `notes/block-test.md`.
9. Agent asserts no diagnostic is associated with the ranges of `![[source#^anchor-one]]` or `![[source#^anchor-two]]`.
10. Agent asserts each of the 4 broken embed lines produces exactly one diagnostic with code `FG004`.
11. Agent computes (correctly diagnosed embeds / total embeds tested) × 100; records against Fail/Goal thresholds.
12. Agent sends `shutdown` + `exit`.

**Pass criterion:** 100% correct diagnosis — valid block embeds produce no diagnostic; each broken block embed produces exactly one FG004.
**Fail criterion:** Any valid block embed producing FG004, or any broken block embed failing to produce FG004.
