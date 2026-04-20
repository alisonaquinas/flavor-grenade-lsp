---
title: Referencing Blocks User Requirements
tags:
  - requirements/user/referencing-blocks
aliases:
  - Referencing Blocks
---

# Referencing Blocks User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors create and use block-level references to link to specific paragraphs or items within a note. Implementation details are in [[requirements/block-references]].

---

**Tag:** User.Blocks.ReferenceSpecificText
**Gist:** Vault author creates a block reference, navigates directly to the target block, and is warned when the referenced block no longer exists.
**Ambition:** Block-level navigation is as reliable as note-level navigation — go-to-definition always lands on the correct block, and a diagnostic is raised immediately whenever a referenced block anchor is removed from its host note.
**Scale:** Percentage of `textDocument/definition` requests on block-reference tokens that navigate to the correct block position, and percentage of orphaned block references that produce a diagnostic within 500 ms of the anchor being deleted.
**Meter:** Integration test suite: `bun test tests/integration/block-references/` — creates notes with labelled blocks, issues definition requests on block-reference links, verifies target positions, then removes anchors and checks that diagnostics appear within the latency threshold.
**Fail:** Any definition request that fails to land on the correct block, or any orphaned block reference that does not produce a diagnostic within 500 ms.
**Goal:** Link to and jump to a specific block in another note
**Need:** A vault author wants to create a link that points to a specific paragraph, list item, or block within another note — not just to the note as a whole. They expect to be able to navigate directly to that block from any reference to it, and to be warned if the referenced block no longer exists in the target note so they can fix the reference.
**Maps to:** Block.Anchor.Indexing, Block.CrossRef.Diagnostic, Navigation.Definition.AllLinkTypes

---

**Tag:** User.Blocks.CompleteBlockRef
**Gist:** Vault author receives a list of all known block anchors in the target note upon typing `[[note#^`.
**Ambition:** Every block anchor present in the target note at the time of the request appears in the completion list, so authors never have to open the target note to hunt for anchor IDs.
**Scale:** Percentage of `[[note#^` trigger events that return a completion list containing all block anchors currently present in the target note.
**Meter:** Integration test suite: `bun test tests/integration/block-references/` — creates a test note with at least 5 distinct block anchors, triggers block-ref completion, and checks that all anchor IDs appear in the returned `CompletionItem` list.
**Fail:** Any block anchor present in the target note that is missing from the completion list, or a completion list that is empty when anchors exist.
**Goal:** Get block ID suggestions when referencing a block
**Need:** A vault author typing a block reference (`[[note#^`) wants the editor to offer a list of the known block anchors in the target note as completion candidates. They expect to pick the right anchor from a list rather than having to open the target note to find its anchor IDs manually.
**Maps to:** Block.Completion.Offer, Block.Anchor.Lineend
