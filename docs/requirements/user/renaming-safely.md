---
title: Renaming Safely User Requirements
tags:
  - requirements/user/renaming-safely
aliases:
  - Renaming Safely
---

# Renaming Safely User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors rename notes and headings with confidence that all references are updated. Implementation details are in [[requirements/rename]].

---

**Tag:** User.Rename.RenameNoteEverywhere
**Gist:** Vault author renames a note and receives a `WorkspaceEdit` that updates every link to it across the entire vault in one operation.
**Ambition:** Rename is exhaustive — no link to the old name survives in any vault document — and every updated link conforms to the active link style, preserving custom display aliases untouched.
**Scale:** Percentage of existing links to the renamed note that are correctly updated in the returned `WorkspaceEdit`, across a test vault with at least 20 documents containing links to the renamed note.
**Meter:** Integration test suite: `bun test tests/integration/rename/` — counts all links to a note before rename, applies the `WorkspaceEdit`, counts surviving stale links, and checks that no display alias was corrupted.
**Fail:** Any stale link remaining after the edit is applied, or any display alias modified when it should have been preserved.
**Goal:** Rename a note and have all links updated automatically
**Need:** A vault author wants to rename a note and have every link to that note across the entire vault updated to the new name in a single operation, following the vault's configured link style. They expect not to have to search manually for all references to the old name, and they expect the rename to preserve any custom display aliases that other notes have used when linking to it.
**Maps to:** Rename.Refactoring.Completeness, Rename.StyleBinding.Consistency

---

**Tag:** User.Rename.RenameHeadingEverywhere
**Gist:** Vault author renames a heading and receives a `WorkspaceEdit` that updates every heading-link across the vault while preserving display aliases.
**Ambition:** Heading rename is as complete and safe as note rename — every `[[note#old-heading]]` reference is updated, display aliases are untouched, and ambiguous or invalid rename positions are rejected before a broken edit can be applied.
**Scale:** Percentage of existing heading-links that are correctly updated in the returned `WorkspaceEdit`, and percentage of invalid rename positions that are correctly rejected by `textDocument/prepareRename`.
**Meter:** Integration test suite: `bun test tests/integration/rename/` — creates a test vault with multiple documents referencing a heading, renames it, checks all heading-links are updated and display aliases preserved, and also tests that `textDocument/prepareRename` returns an error at disallowed positions.
**Fail:** Any heading-link not updated after the rename, any display alias modified by the edit, or any invalid rename position that is not rejected.
**Goal:** Rename a heading and have all links to it updated
**Need:** A vault author wants to rename a heading within a note and have every link that references that heading — across all notes in the vault — updated to the new heading text automatically. They expect links with custom display aliases to have their target updated but their display text preserved, and they expect the editor to prevent renaming in positions where a rename would be ambiguous or invalid.
**Maps to:** Rename.Refactoring.Completeness, Rename.Prepare.Rejection
