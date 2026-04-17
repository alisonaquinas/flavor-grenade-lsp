---
title: Renaming Safely User Requirements
tags:
  - requirements/user/renaming-safely
aliases:
  - Renaming Safely
---

# Renaming Safely User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors rename notes and headings with confidence that all references are updated. Implementation details are in [[rename]].

---

**Tag:** User.Rename.RenameNoteEverywhere
**Goal:** Rename a note and have all links updated automatically
**Need:** A vault author wants to rename a note and have every link to that note across the entire vault updated to the new name in a single operation, following the vault's configured link style. They expect not to have to search manually for all references to the old name, and they expect the rename to preserve any custom display aliases that other notes have used when linking to it.
**Maps to:** Rename.Refactoring.Completeness, Rename.StyleBinding.Consistency

---

**Tag:** User.Rename.RenameHeadingEverywhere
**Goal:** Rename a heading and have all links to it updated
**Need:** A vault author wants to rename a heading within a note and have every link that references that heading — across all notes in the vault — updated to the new heading text automatically. They expect links with custom display aliases to have their target updated but their display text preserved, and they expect the editor to prevent renaming in positions where a rename would be ambiguous or invalid.
**Maps to:** Rename.Refactoring.Completeness, Rename.Prepare.Rejection
