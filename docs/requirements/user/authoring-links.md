---
title: Authoring Links User Requirements
tags:
  - requirements/user/authoring-links
aliases:
  - Authoring Links
---

# Authoring Links User Requirements

> [!NOTE] Scope
> These user requirements cover the experience of writing links, callouts, and other vault constructs with editor assistance. Implementation details are in [[requirements/completions]], [[wiki-link-resolution]], and [[requirements/rename]].

---

**Tag:** User.Author.CompleteWikiLink
**Gist:** Vault author receives a filtered list of note candidates immediately upon typing `[[`.
**Ambition:** Completion activates without delay for any vault size, narrows correctly as the author types, and every item conforms to the active link style so the vault never needs manual correction.
**Scale:** Percentage of `[[` trigger events in a test vault that produce a non-empty, correctly-styled completion list within 200 ms.
**Meter:** Integration test suite: `bun test tests/integration/authoring/` — opens a test vault of at least 50 notes, triggers completion at a `[[` position, measures time-to-first-result, and validates each `CompletionItem.insertText` against the active `wiki.style` setting.
**Fail:** < 95% of trigger events yield a styled list within 200 ms, or any item fails style validation.
**Goal:** Get suggestions when starting a `[[link`
**Need:** A vault author typing `[[` to create a link to another note wants the editor to immediately offer a filtered list of all notes in the vault as candidates. They expect to find the right note quickly by typing part of its name, to see the list narrow as they type, and to have the inserted link text conform to the vault's configured link style — without having to remember the exact filename or folder path.
**Maps to:** Completion.Trigger.Coverage, Completion.WikiStyle.Binding, Completion.Candidates.Cap, Link.Resolution.IgnoreGlob

---

**Tag:** User.Author.CompleteHeading
**Gist:** Vault author receives heading suggestions for the target note immediately upon typing `[[note#`.
**Ambition:** Every heading currently present in the target note appears as a candidate, reflecting any unsaved edits, so the author never has to open the target note just to copy a heading anchor.
**Scale:** Percentage of `[[note#` trigger events that return a completion list containing all headings present in the target note at the time of the request.
**Meter:** Integration test suite: `bun test tests/integration/authoring/` — creates a test note with at least 5 headings, triggers heading completion at a `[[note#` position, and checks that all heading texts appear in the returned `CompletionItem` list.
**Fail:** < 100% of known headings appear in the completion list, or the list is empty when headings exist.
**Goal:** Get heading suggestions after `[[note#`
**Need:** A vault author creating a link to a specific section within a note (e.g., `[[note#`) wants the editor to offer the available headings in the target note as completion candidates. They expect not to have to open the target note separately to copy the heading text, and they expect the list to reflect the current headings in the target note.
**Maps to:** Completion.Trigger.Coverage

---

**Tag:** User.Author.CompleteCallout
**Gist:** Vault author receives callout-type suggestions immediately upon typing `> [!`.
**Ambition:** All standard OFM callout types are offered instantly so the author never needs to consult external documentation for exact spelling or casing.
**Scale:** Percentage of `> [!` trigger events that return a completion list containing all recognised callout types (NOTE, WARNING, TIP, DANGER, and any others defined in the OFM spec).
**Meter:** Integration test suite: `bun test tests/integration/authoring/` — opens a document, triggers completion at a `> [!` position, and checks the returned list against the canonical callout-type registry defined in [[ofm-spec/callouts]].
**Fail:** Any recognised callout type missing from the completion list, or the list is empty.
**Goal:** Get callout type suggestions when starting `> [!`
**Need:** A vault author typing a callout block (`> [!`) wants the editor to offer the recognized callout type names as suggestions. They expect to choose from the standard set of types — NOTE, WARNING, TIP, DANGER, and others — without having to remember exact spelling or refer to external documentation.
**Maps to:** Completion.CalloutType.Coverage, Completion.Trigger.Coverage

---

**Tag:** User.Author.FollowLinkStyle
**Gist:** Every link the server inserts or modifies conforms to the vault's configured link-writing convention.
**Ambition:** Style compliance is total — no feature (completion, rename, code action) ever produces a link that deviates from the active convention, preserving vault-wide consistency without any manual correction by the author.
**Scale:** Percentage of link text strings produced by completion, rename, and code-action operations in a given test session that conform to the active `wiki.style` setting.
**Meter:** Integration test suite: `bun test tests/integration/authoring/` — configures the test vault with each of the three `wiki.style` values in turn (`file-stem`, `title-slug`, `file-path-stem`), triggers completion, rename, and code-action operations, and validates each produced link text against the expected format using the style-normalisation function in [[design/domain-layer]].
**Fail:** Any single produced link text that does not conform to the active style setting.
**Goal:** Have the server respect the vault's link style convention
**Need:** A vault author has configured their vault to use a specific link-writing convention — for example, using the file's stem, its full title, or its vault-relative path. They expect every link the editor inserts or modifies — whether through completion, rename, or a code action — to follow that same convention automatically, so the vault remains internally consistent without any manual correction.
**Maps to:** Link.Wiki.StyleBinding, Completion.WikiStyle.Binding, Rename.StyleBinding.Consistency
