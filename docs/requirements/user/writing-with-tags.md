---
title: Writing With Tags User Requirements
tags:
  - requirements/user/writing-with-tags
aliases:
  - Writing With Tags
---

# Writing With Tags User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors use tags to organise and discover notes. Implementation details are in [[tag-indexing]] and [[completions]].

---

**Tag:** User.Tags.CompleteTag
**Goal:** Get tag suggestions while typing `#tag`
**Need:** A vault author typing a tag wants the editor to suggest existing tags from across the vault so they stay consistent with their established vocabulary. They expect suggestions to appear as they type, to support Unicode characters and emoji in tag names, and to cover tags found anywhere in the vault — whether in note bodies or in YAML frontmatter.
**Maps to:** Tag.Index.Completeness, Tag.Completion.Unicode, Completion.Trigger.Coverage

---

**Tag:** User.Tags.FindTaggedNotes
**Goal:** Find all notes sharing a tag across the vault
**Need:** A vault author wants to see every note in the vault that uses a given tag, whether the tag appears as an inline `#tag` in the body or as an entry in the note's YAML `tags:` property. They expect both sources to be treated equally — so searching for a tag returns the complete set of tagged notes, not just those using one syntax over the other.
**Maps to:** Tag.Hierarchy.Awareness, Tag.YAML.Equivalence

---

**Tag:** User.Tags.UseHierarchicalTags
**Goal:** Use `#parent/child` tags and query by parent
**Need:** A vault author using hierarchical tags such as `#project/active` or `#book/fiction/read` wants to be able to find or navigate to all notes tagged under a parent category by querying for the parent alone. They expect the editor to understand the slash-delimited parent–child relationship so that `#project` surfaces all `#project/*` variants, not just notes tagged `#project` exactly.
**Maps to:** Tag.Hierarchy.Awareness
