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
**Gist:** Vault author receives tag suggestions from across the entire vault as they type `#tag`, including Unicode and emoji tag names from both note bodies and YAML frontmatter.
**Ambition:** Tag completion is comprehensive — every tag in the vault appears as a candidate regardless of where it was declared — so authors stay consistent with their established vocabulary without any manual cross-referencing.
**Scale:** Percentage of vault-wide tags (body and frontmatter, including Unicode and emoji) that appear in the completion list when triggered at a `#` position in a test vault.
**Meter:** Integration test suite: `bun test tests/integration/tags/` — indexes a test vault containing tags with ASCII names, Unicode names, and emoji names in both note bodies and YAML frontmatter, triggers tag completion, and checks that 100% of known tags appear in the list.
**Fail:** Any tag present in the vault that is missing from the completion list, or a completion list that omits tags declared in YAML frontmatter while including body tags (or vice versa).
**Goal:** Get tag suggestions while typing `#tag`
**Need:** A vault author typing a tag wants the editor to suggest existing tags from across the vault so they stay consistent with their established vocabulary. They expect suggestions to appear as they type, to support Unicode characters and emoji in tag names, and to cover tags found anywhere in the vault — whether in note bodies or in YAML frontmatter.
**Maps to:** Tag.Index.Completeness, Tag.Completion.Unicode, Completion.Trigger.Coverage

---

**Tag:** User.Tags.FindTaggedNotes
**Gist:** Vault author retrieves a complete list of notes using a given tag, drawing equally from inline body tags and YAML frontmatter tags.
**Ambition:** Tag-based find-references is exhaustive and source-agnostic — inline and frontmatter occurrences are treated identically so no tagged note is ever hidden from the results.
**Scale:** Percentage of notes in a test vault that use a given tag (whether inline or in frontmatter) that appear in the `textDocument/references` response when the request is made on that tag.
**Meter:** Integration test suite: `bun test tests/integration/tags/` — creates a test vault with a known number of notes using a tag via inline syntax and via YAML frontmatter, calls `textDocument/references` on the tag, and computes (returned notes / known tagged notes) × 100.
**Fail:** < 100% of tagged notes returned, or results that differ based solely on whether the tag appears inline versus in frontmatter.
**Goal:** Find all notes sharing a tag across the vault
**Need:** A vault author wants to see every note in the vault that uses a given tag, whether the tag appears as an inline `#tag` in the body or as an entry in the note's YAML `tags:` property. They expect both sources to be treated equally — so searching for a tag returns the complete set of tagged notes, not just those using one syntax over the other.
**Maps to:** Tag.Hierarchy.Awareness, Tag.YAML.Equivalence

---

**Tag:** User.Tags.UseHierarchicalTags
**Gist:** Vault author queries a parent tag and receives results for all notes tagged with any descendant under that parent hierarchy.
**Ambition:** Hierarchical tag resolution is transparent — querying `#project` surfaces every `#project/*` variant so authors can navigate their taxonomy at any level of specificity without constructing manual wildcard searches.
**Scale:** Percentage of `#parent/*` descendant tags in a test vault whose host notes appear in the find-references response when querying the parent tag alone.
**Meter:** Integration test suite: `bun test tests/integration/tags/` — creates a test vault with a hierarchy of at least 3 parent tags each having at least 3 child or grandchild variants, queries each parent tag via `textDocument/references`, and checks that all descendant-tagged notes are included in the response.
**Fail:** Any note tagged with a `#parent/child` or deeper variant that is missing from the results when querying the parent tag.
**Goal:** Use `#parent/child` tags and query by parent
**Need:** A vault author using hierarchical tags such as `#project/active` or `#book/fiction/read` wants to be able to find or navigate to all notes tagged under a parent category by querying for the parent alone. They expect the editor to understand the slash-delimited parent–child relationship so that `#project` surfaces all `#project/*` variants, not just notes tagged `#project` exactly.
**Maps to:** Tag.Hierarchy.Awareness
