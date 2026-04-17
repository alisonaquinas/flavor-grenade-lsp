---
title: Navigation User Requirements
tags:
  - requirements/user/navigating-notes
aliases:
  - Navigating Notes
---

# Navigation User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors move between notes, discover connections, and understand the structure of their knowledge graph. Implementation details are in [[navigation]], [[wiki-link-resolution]], and [[block-references]].

---

**Tag:** User.Navigate.JumpToNote
**Goal:** Navigate to a linked note
**Need:** A vault author reading a document containing a `[[wiki-link]]` wants to open the linked note without manually navigating the file tree. They expect to place their cursor on any link — whether a wiki-link, an aliased link, or a heading link — and jump directly to the target note or section in a single action, regardless of how deeply nested the target is or how the link was written.
**Maps to:** Navigation.Definition.AllLinkTypes, Link.Wiki.StyleBinding, Link.Wiki.AliasResolution

---

**Tag:** User.Navigate.FindAllReferences
**Goal:** See everywhere a note or heading is referenced
**Need:** A vault author who has written or is considering renaming a note or heading wants to know every other note that links to it before making changes. They expect their editor to list all occurrences across the entire vault in a single action, so they can understand the impact of a change without performing a manual text search.
**Maps to:** Navigation.References.Completeness

---

**Tag:** User.Navigate.SeeReferenceCount
**Goal:** See at a glance how many notes link to a heading
**Need:** A vault author wants to understand how connected a particular heading or section is within their vault without running an explicit search. They expect to see an inline count of references displayed directly above each heading in the editor, updated automatically as the vault changes, so they can identify high-value sections at a glance.
**Maps to:** Navigation.CodeLens.Count
