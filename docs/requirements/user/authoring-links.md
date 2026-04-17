---
title: Authoring Links User Requirements
tags:
  - requirements/user/authoring-links
aliases:
  - Authoring Links
---

# Authoring Links User Requirements

> [!NOTE] Scope
> These user requirements cover the experience of writing links, callouts, and other vault constructs with editor assistance. Implementation details are in [[completions]], [[wiki-link-resolution]], and [[rename]].

---

**Tag:** User.Author.CompleteWikiLink
**Goal:** Get suggestions when starting a `[[link`
**Need:** A vault author typing `[[` to create a link to another note wants the editor to immediately offer a filtered list of all notes in the vault as candidates. They expect to find the right note quickly by typing part of its name, to see the list narrow as they type, and to have the inserted link text conform to the vault's configured link style — without having to remember the exact filename or folder path.
**Maps to:** Completion.Trigger.Coverage, Completion.WikiStyle.Binding, Completion.Candidates.Cap, Link.Resolution.IgnoreGlob

---

**Tag:** User.Author.CompleteHeading
**Goal:** Get heading suggestions after `[[note#`
**Need:** A vault author creating a link to a specific section within a note (e.g., `[[note#`) wants the editor to offer the available headings in the target note as completion candidates. They expect not to have to open the target note separately to copy the heading text, and they expect the list to reflect the current headings in the target note.
**Maps to:** Completion.Trigger.Coverage

---

**Tag:** User.Author.CompleteCallout
**Goal:** Get callout type suggestions when starting `> [!`
**Need:** A vault author typing a callout block (`> [!`) wants the editor to offer the recognized callout type names as suggestions. They expect to choose from the standard set of types — NOTE, WARNING, TIP, DANGER, and others — without having to remember exact spelling or refer to external documentation.
**Maps to:** Completion.CalloutType.Coverage, Completion.Trigger.Coverage

---

**Tag:** User.Author.FollowLinkStyle
**Goal:** Have the server respect the vault's link style convention
**Need:** A vault author has configured their vault to use a specific link-writing convention — for example, using the file's stem, its full title, or its vault-relative path. They expect every link the editor inserts or modifies — whether through completion, rename, or a code action — to follow that same convention automatically, so the vault remains internally consistent without any manual correction.
**Maps to:** Link.Wiki.StyleBinding, Completion.WikiStyle.Binding, Rename.StyleBinding.Consistency
