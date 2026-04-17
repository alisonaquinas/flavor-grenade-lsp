---
title: Referencing Blocks User Requirements
tags:
  - requirements/user/referencing-blocks
---

# Referencing Blocks User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors create and use block-level references to link to specific paragraphs or items within a note. Implementation details are in [[block-references]].

---

**Tag:** User.Blocks.ReferenceSpecificText
**Goal:** Link to and jump to a specific block in another note
**Need:** A vault author wants to create a link that points to a specific paragraph, list item, or block within another note — not just to the note as a whole. They expect to be able to navigate directly to that block from any reference to it, and to be warned if the referenced block no longer exists in the target note so they can fix the reference.
**Maps to:** Block.Anchor.Indexing, Block.CrossRef.Diagnostic, Navigation.Definition.AllLinkTypes

---

**Tag:** User.Blocks.CompleteBlockRef
**Goal:** Get block ID suggestions when referencing a block
**Need:** A vault author typing a block reference (`[[note#^`) wants the editor to offer a list of the known block anchors in the target note as completion candidates. They expect to pick the right anchor from a list rather than having to open the target note to find its anchor IDs manually.
**Maps to:** Block.Completion.Offer, Block.Anchor.Lineend
