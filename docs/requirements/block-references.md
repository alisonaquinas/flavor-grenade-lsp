---
title: Block Reference Requirements
tags:
  - requirements/block-references
aliases:
  - Block Anchor Requirements
  - FG Block References
---

# Block Reference Requirements

> [!NOTE] Scope
> These requirements govern the indexing, diagnostic emission, completion, and syntactic parsing rules for Obsidian block-anchor (`^blockid`) references. A block anchor is a `^` character followed by an alphanumeric identifier placed at the end of a block-level line, either after whitespace or at the start of a standalone anchor line. Block embed resolution is a related but separate concern covered in [[embed-resolution#Embed.BlockEmbed.Resolution]]. Cross-reference diagnostics in single-file mode suppression are governed by [[docs/requirements/diagnostics#Diagnostic.SingleFile.Suppression]].

---

## Block.Anchor.Indexing

**Tag:** Block.Anchor.Indexing
**User Req:** User.Blocks.ReferenceSpecificText
**Gist:** All valid `^blockid` anchors present in a document must be discovered during indexing and registered in OFMIndex.blockAnchors for that document.
**Ambition:** Block anchors are the mechanism Obsidian uses for precise transclusion and deep linking. An index that misses anchors produces silent gaps: users believe their block can be linked, create a `[[doc#^anchor]]` reference, and see no FG005 diagnostic — but the reference resolves to nothing at render time. Complete indexing is the prerequisite for every other block-reference feature (completion, diagnostics, go-to-definition).
**Scale:** Percentage of actual `^blockid` anchor definitions present in a document that appear in OFMIndex.blockAnchors for that document after indexing. Scope: all documents in the test vault; only line-end or standalone anchors outside opaque regions.
**Meter:**

1. Create a test vault with at least 5 documents. Each document must contain:
   - At least 5 end-of-line `^blockid` anchors across paragraphs, list items, headings, and table rows
   - At least 1 standalone `^blockid` anchor line
   - At least 2 occurrences of `^id` mid-sentence (these should not be indexed as anchors)
   - At least 1 `^blockid` inside a fenced code block (should not be indexed)
2. Run VaultIndex / OFMIndex build.
3. Use the test harness to enumerate expected anchors (line-end and standalone occurrences only).
4. Query OFMIndex.blockAnchors for each document; compare the returned set to the expected set.
5. Verify mid-sentence and code-block `^id` occurrences are absent from the index.
6. Compute: (indexed anchors / expected anchors) × 100.
**Fail:** Any expected valid `^blockid` absent from OFMIndex.blockAnchors (i.e., < 100%).
**Goal:** 100% of expected anchors indexed; 0 false-positive anchors indexed.
**Stakeholders:** Vault authors using block transclusion, evergreen note practitioners.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/ofm-spec/block-references]], [[docs/design/domain-layer]], [[embed-resolution]].

---

## Block.CrossRef.Diagnostic

**Tag:** Block.CrossRef.Diagnostic
**User Req:** User.Blocks.ReferenceSpecificText
**Gist:** A `[[doc#^nonexistent]]` wiki-link referencing a block anchor that does not exist in OFMIndex.blockAnchors for the target document must produce one FG005 (BrokenBlockRef) diagnostic; this diagnostic must be suppressed when the server is in single-file mode.
**Ambition:** Block cross-references are unforgiving: a misspelled or stale anchor ID produces a broken link that renders without any visual indication in most Obsidian themes. Early, precise diagnostics allow authors to correct the reference before it propagates through transclusion chains. The single-file suppression rule mirrors the behaviour required for all cross-file diagnostics and is a safety property of the single-file mode contract.
**Scale:** Percentage of `[[doc#^nonexistent]]` references in a test vault that produce exactly one FG005 diagnostic in multi-file mode, and zero diagnostics of code FG005 in single-file mode. Scope covers both the positive case (broken anchor) and the negative case (valid anchor, no diagnostic).
**Meter:**

1. In multi-file mode: create a vault with at least 3 documents. Author a document with:
   - 3 `[[doc#^validanchor]]` links (targets exist in OFMIndex)
   - 3 `[[doc#^missinganchor]]` links (targets do not exist)
2. Open all documents; wait for diagnostics.
3. Verify each valid anchor link produces zero FG005 diagnostics.
4. Verify each missing anchor link produces exactly one FG005 diagnostic.
5. In single-file mode: open only the document with broken anchor links (no workspace root); verify zero FG005 diagnostics are emitted.
6. Compute: (correctly diagnosed links / total links tested) × 100 for both modes.
**Fail:** Any valid anchor link producing FG005, or any broken anchor link failing to produce FG005 in multi-file mode, or any FG005 appearing in single-file mode.
**Goal:** 100% correct diagnostic behaviour in both modes.
**Stakeholders:** Vault authors using block cross-references, transclusion chain maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/ofm-spec/block-references]], [[docs/requirements/diagnostics]], [[docs/requirements/diagnostics#Diagnostic.SingleFile.Suppression]], [[docs/design/api-layer]].

---

## Block.Completion.Offer

**Tag:** Block.Completion.Offer
**User Req:** User.Blocks.CompleteBlockRef
**Gist:** When the cursor is positioned after `[[doc#^` in a wiki-link, the completion response must offer all `^blockid` values registered in OFMIndex.blockAnchors for the resolved target document.
**Ambition:** Block anchor identifiers are opaque strings with no predictable structure — authors cannot guess them without consulting the source document. Completion at the `[[doc#^` position transforms an otherwise unguessable string into a discoverable, typo-free selection. Without this completion, block cross-referencing requires the author to context-switch to the source document, memorise or copy the anchor ID, and manually type it — a friction that discourages use of the feature entirely.
**Scale:** Percentage of `^blockid` values registered in OFMIndex.blockAnchors for a resolved target document that appear as completion candidates when the cursor is at the `[[targetDoc#^` trigger position. Scope: all documents in the test vault that contain at least one block anchor.
**Meter:**

1. Create a test vault with at least 5 documents, each containing at least 4 named block anchors.
2. In a new document, type `[[targetDoc#^` for each target document.
3. Issue `textDocument/completion` at the cursor position immediately after `^`.
4. Collect the `insertText` or `label` of each returned `CompletionItem`.
5. Compare the returned set against OFMIndex.blockAnchors for `targetDoc`.
6. Compute: (anchor IDs in completion list / total anchor IDs in OFMIndex for that document) × 100.
**Fail:** Any anchor ID registered in OFMIndex.blockAnchors absent from the completion list for the corresponding document.
**Goal:** 100% of known block anchors appear in the completion list.
**Stakeholders:** Vault authors composing transclusion networks, evergreen note systems users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/ofm-spec/block-references]], [[docs/requirements/completions]], [[docs/design/api-layer]], [[docs/design/domain-layer]].

---

## Block.Anchor.Lineend

**Tag:** Block.Anchor.Lineend
**User Req:** User.Blocks.CompleteBlockRef
**Gist:** Only `^id` patterns at the end of a block-level line, or on a standalone anchor line, are treated as block anchor definitions; `^id` patterns occurring mid-sentence or inside opaque regions must not be indexed as block anchors.
**Ambition:** Obsidian's block anchor specification is unambiguous: an anchor is a `^` immediately followed by an alphanumeric identifier at the end of a line, optionally preceded by whitespace. Mid-sentence `^id` occurrences (common in mathematical notation, e.g., `x^2`, or in text like "refer to section^note") are not block anchors. Incorrectly indexing them pollutes OFMIndex.blockAnchors with phantom entries, causing false-positive completion candidates and corrupting the block reference graph.
**Scale:** Binary pass/fail per syntactic position tested. A position is a `^id`-like token in document text. The scale is the percentage of positions correctly classified: valid line-end or standalone positions indexed as anchors, all other positions not indexed.
**Meter:**

1. Create a document with the following occurrences, each on a separate line or within a line:
   - 5 end-of-line anchors: `paragraph text ^anchor-a`, `- list item ^anchor-b`, `## Heading ^anchor-c`
   - 1 standalone anchor line: `^anchor-d`
   - 3 mid-sentence occurrences: `x^2 is quadratic`, `the value ^temp is`, `note^1`
   - 2 inside a fenced code block: `code ^anchor-x`
2. Run OFMIndex build.
3. Query OFMIndex.blockAnchors for the document.
4. Verify anchors `anchor-a`, `anchor-b`, `anchor-c`, and `anchor-d` are present.
5. Verify no other tokens appear in blockAnchors.
6. Compute: (correctly classified positions / total positions tested) × 100.
**Fail:** Any mid-sentence or opaque-region `^id` token present in OFMIndex.blockAnchors, or any valid line-end or standalone `^id` absent from OFMIndex.blockAnchors.
**Goal:** 100% correct classification.
**Stakeholders:** All vault authors; particularly those using mathematical notation or footnote-style markers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/ofm-spec/block-references]], [[docs/design/domain-layer]], `Block.Anchor.Indexing`.
