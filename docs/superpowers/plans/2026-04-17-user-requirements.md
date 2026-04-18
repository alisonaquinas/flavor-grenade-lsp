---
title: User Requirements Layer Implementation Plan
tags:
  - plans/user-requirements
aliases:
  - User Requirements Plan
status: completed
date: 2026-04-17
---

# User Requirements Layer Implementation Plan

> **NOTE:** All deliverables described in this plan (theme files, user requirements index, `User Req:` back-reference fields, and `requirements/index.md` link) were created and committed as part of commit `ed0c293`. The task checkboxes below reflect the pre-completion draft state. Do not attempt to re-create files that already exist.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a user requirements layer (`docs/requirements/user/`) with 23 implementation-agnostic user goals, each tracing bidirectionally to the existing Planguage functional requirements.

**Architecture:** Create `docs/requirements/user/` containing one theme file per user concern area and a master index. Update all end-user-facing functional requirement files to add `User Req:` back-reference fields. Update `requirements/index.md` to link to the new layer.

**Tech Stack:** Markdown, Obsidian wiki-link syntax, Planguage dot-notation tags. No code — documentation only.

---

## Spec

`docs/superpowers/specs/2026-04-17-user-requirements-design.md`

## FR Back-Reference Map (source of truth for all `User Req:` values)

| FR Tag | `User Req:` value to insert |
|--------|-----------------------------|
| Link.Wiki.StyleBinding | User.Navigate.JumpToNote, User.Author.CompleteWikiLink, User.Author.FollowLinkStyle, User.Config.CustomiseLinkStyle |
| Link.Wiki.AliasResolution | User.Navigate.JumpToNote |
| Link.Resolution.ModeScope | User.Diagnose.SpotBrokenLinks |
| Link.Inline.URLSkip | User.Diagnose.SpotBrokenLinks |
| Link.Resolution.IgnoreGlob | User.Author.CompleteWikiLink |
| Embed.Resolution.MarkdownTarget | User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent |
| Embed.Resolution.ImageTarget | User.Embed.DetectBrokenEmbed |
| Embed.HeadingEmbed.Resolution | User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent |
| Embed.BlockEmbed.Resolution | User.Embed.DetectBrokenEmbed |
| Tag.Index.Completeness | User.Tags.CompleteTag |
| Tag.Hierarchy.Awareness | User.Tags.FindTaggedNotes, User.Tags.UseHierarchicalTags |
| Tag.YAML.Equivalence | User.Tags.FindTaggedNotes |
| Tag.Completion.Unicode | User.Tags.CompleteTag |
| Block.Anchor.Indexing | User.Blocks.ReferenceSpecificText |
| Block.CrossRef.Diagnostic | User.Blocks.ReferenceSpecificText |
| Block.Completion.Offer | User.Blocks.CompleteBlockRef |
| Block.Anchor.Lineend | User.Blocks.CompleteBlockRef |
| Completion.Candidates.Cap | User.Author.CompleteWikiLink, User.Config.TuneCompletions |
| Completion.Trigger.Coverage | User.Author.CompleteWikiLink, User.Author.CompleteHeading, User.Author.CompleteCallout, User.Tags.CompleteTag |
| Completion.CalloutType.Coverage | User.Author.CompleteCallout |
| Completion.WikiStyle.Binding | User.Author.CompleteWikiLink, User.Author.FollowLinkStyle |
| Diagnostic.Severity.WikiLink | User.Diagnose.SpotBrokenLinks |
| Diagnostic.Severity.Embed | User.Diagnose.SpotBrokenEmbeds |
| Diagnostic.Code.Assignment | User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds |
| Diagnostic.Debounce.Latency | User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds |
| Diagnostic.Ambiguous.RelatedInfo | User.Diagnose.SpotAmbiguousLinks |
| Diagnostic.SingleFile.Suppression | User.Diagnose.SpotBrokenLinks |
| Navigation.Definition.AllLinkTypes | User.Navigate.JumpToNote, User.Blocks.ReferenceSpecificText |
| Navigation.References.Completeness | User.Navigate.FindAllReferences |
| Navigation.CodeLens.Count | User.Navigate.SeeReferenceCount |
| Rename.Refactoring.Completeness | User.Rename.RenameNoteEverywhere, User.Rename.RenameHeadingEverywhere |
| Rename.Prepare.Rejection | User.Rename.RenameHeadingEverywhere |
| Rename.StyleBinding.Consistency | User.Rename.RenameNoteEverywhere, User.Author.FollowLinkStyle |
| Workspace.VaultDetection.Primary | User.Vault.AutoDetectVault |
| Workspace.VaultDetection.Fallback | User.Vault.AutoDetectVault |
| Workspace.FileExtension.Filter | User.Vault.WorkAcrossEntireVault |
| Workspace.MultiFolder.Isolation | User.Vault.WorkAcrossEntireVault |
| Config.Precedence.Layering | User.Config.CustomiseLinkStyle |
| Config.Validation.Candidates | User.Config.TuneCompletions |

---

## Task 1: Create feature branch

**Files:** none

- [ ] **Step 1: Create and switch to branch**

```bash
cd /path/to/flavor-grenade-lsp
git checkout develop
git pull
git checkout -b feat/user-requirements
```

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `feat/user-requirements`

---

## Task 2: Create `docs/requirements/user/index.md`

**Files:**

- Create: `docs/requirements/user/index.md`

- [ ] **Step 1: Create the file with this exact content**

```markdown
---
title: User Requirements Index — flavor-grenade-lsp
tags:
  - requirements/user
aliases:
  - User Requirements
---

# User Requirements Index

This document is the master tag index for all user requirements in the `flavor-grenade-lsp` project. User requirements express what vault authors and LSP client users are trying to accomplish, independent of implementation. Each user requirement maps to one or more functional requirements in the Planguage layer in `docs/requirements/`.

## Format

Each user requirement uses the following fields:

| Field | Purpose |
|---|---|
| **Tag** | Stable dot-notation identifier in `User.Theme.Goal` form. Unique across the project. |
| **Goal** | Short verb phrase describing the user's objective from their perspective. No implementation terms. |
| **Need** | One paragraph in plain English describing what the user wants to do and why it matters. No LSP methods, JSON-RPC, NestJS, or TypeScript vocabulary. |
| **Maps to** | Comma-separated list of Planguage functional requirement tags. |

## Tag Table

| Tag | Goal | Theme file | Maps to (FR tags) |
|-----|------|------------|-------------------|
| User.Navigate.JumpToNote | Navigate to a linked note | [[navigating-notes]] | Navigation.Definition.AllLinkTypes, Link.Wiki.StyleBinding, Link.Wiki.AliasResolution |
| User.Navigate.FindAllReferences | See everywhere a note or heading is referenced | [[navigating-notes]] | Navigation.References.Completeness |
| User.Navigate.SeeReferenceCount | See at a glance how many notes link to a heading | [[navigating-notes]] | Navigation.CodeLens.Count |
| User.Author.CompleteWikiLink | Get suggestions when starting a `[[link` | [[authoring-links]] | Completion.Trigger.Coverage, Completion.WikiStyle.Binding, Completion.Candidates.Cap, Link.Resolution.IgnoreGlob |
| User.Author.CompleteHeading | Get heading suggestions after `[[note#` | [[authoring-links]] | Completion.Trigger.Coverage |
| User.Author.CompleteCallout | Get callout type suggestions when starting `> [!` | [[authoring-links]] | Completion.CalloutType.Coverage, Completion.Trigger.Coverage |
| User.Author.FollowLinkStyle | Have the server respect the vault's link style convention | [[authoring-links]] | Link.Wiki.StyleBinding, Completion.WikiStyle.Binding, Rename.StyleBinding.Consistency |
| User.Embed.DetectBrokenEmbed | Be told immediately when an embedded file is missing | [[embedding-content]] | Embed.Resolution.MarkdownTarget, Embed.Resolution.ImageTarget, Embed.HeadingEmbed.Resolution, Embed.BlockEmbed.Resolution |
| User.Embed.PreviewLinkedContent | Hover over an embed to preview the target | [[embedding-content]] | Embed.Resolution.MarkdownTarget, Embed.HeadingEmbed.Resolution |
| User.Tags.CompleteTag | Get tag suggestions while typing `#tag` | [[writing-with-tags]] | Tag.Index.Completeness, Tag.Completion.Unicode, Completion.Trigger.Coverage |
| User.Tags.FindTaggedNotes | Find all notes sharing a tag across the vault | [[writing-with-tags]] | Tag.Hierarchy.Awareness, Tag.YAML.Equivalence |
| User.Tags.UseHierarchicalTags | Use `#parent/child` tags and query by parent | [[writing-with-tags]] | Tag.Hierarchy.Awareness |
| User.Blocks.ReferenceSpecificText | Link to and jump to a specific block in another note | [[referencing-blocks]] | Block.Anchor.Indexing, Block.CrossRef.Diagnostic, Navigation.Definition.AllLinkTypes |
| User.Blocks.CompleteBlockRef | Get block ID suggestions when referencing a block | [[referencing-blocks]] | Block.Completion.Offer, Block.Anchor.Lineend |
| User.Diagnose.SpotBrokenLinks | See immediately which links point to non-existent notes | [[seeing-broken-links]] | Diagnostic.Severity.WikiLink, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression |
| User.Diagnose.SpotAmbiguousLinks | Be warned when a link could resolve to more than one note | [[seeing-broken-links]] | Diagnostic.Ambiguous.RelatedInfo |
| User.Diagnose.SpotBrokenEmbeds | Be warned when an embedded file is missing | [[seeing-broken-links]] | Diagnostic.Severity.Embed, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency |
| User.Rename.RenameNoteEverywhere | Rename a note and have all links updated automatically | [[renaming-safely]] | Rename.Refactoring.Completeness, Rename.StyleBinding.Consistency |
| User.Rename.RenameHeadingEverywhere | Rename a heading and have all links to it updated | [[renaming-safely]] | Rename.Refactoring.Completeness, Rename.Prepare.Rejection |
| User.Vault.AutoDetectVault | Have the server automatically find and use the vault root | [[vault-setup]] | Workspace.VaultDetection.Primary, Workspace.VaultDetection.Fallback |
| User.Vault.WorkAcrossEntireVault | Have links resolve across all notes in the vault | [[vault-setup]] | Workspace.FileExtension.Filter, Workspace.MultiFolder.Isolation |
| User.Config.CustomiseLinkStyle | Configure how links are written (stem, title, path) | [[configuring-behaviour]] | Config.Precedence.Layering, Link.Wiki.StyleBinding |
| User.Config.TuneCompletions | Control how many completion candidates are offered | [[configuring-behaviour]] | Config.Validation.Candidates, Completion.Candidates.Cap |

## Related Documents

- [[requirements/index]] — functional requirements index (Planguage layer)
- [[requirements/user/navigating-notes]] — navigation user requirements
- [[requirements/user/authoring-links]] — authoring and completion user requirements
- [[requirements/user/embedding-content]] — embed user requirements
- [[requirements/user/writing-with-tags]] — tag user requirements
- [[requirements/user/referencing-blocks]] — block reference user requirements
- [[requirements/user/seeing-broken-links]] — diagnostic user requirements
- [[requirements/user/renaming-safely]] — rename user requirements
- [[requirements/user/vault-setup]] — vault detection user requirements
- [[requirements/user/configuring-behaviour]] — configuration user requirements
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^\| User\.' docs/requirements/user/index.md
```

Expected: `23`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/index.md
git commit -m "docs(user-req): add user requirements index with 23 entries"
```

---

## Task 3: Create `navigating-notes.md`

**Files:**

- Create: `docs/requirements/user/navigating-notes.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Navigation User Requirements
tags:
  - requirements/user/navigating-notes
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
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/navigating-notes.md
```

Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/navigating-notes.md
git commit -m "docs(user-req): add navigating-notes theme (3 reqs)"
```

---

## Task 4: Create `authoring-links.md`

**Files:**

- Create: `docs/requirements/user/authoring-links.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Authoring Links User Requirements
tags:
  - requirements/user/authoring-links
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
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/authoring-links.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/authoring-links.md
git commit -m "docs(user-req): add authoring-links theme (4 reqs)"
```

---

## Task 5: Create `embedding-content.md`

**Files:**

- Create: `docs/requirements/user/embedding-content.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Embedding Content User Requirements
tags:
  - requirements/user/embedding-content
---

# Embedding Content User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors embed other files — notes, images, and other assets — and the feedback they receive when embeds are broken. Implementation details are in [[embed-resolution]].

---

**Tag:** User.Embed.DetectBrokenEmbed
**Goal:** Be told immediately when an embedded file is missing
**Need:** A vault author who has embedded another file using `![[embed]]` syntax wants to be told immediately if the embedded file no longer exists or was moved. They expect a visible warning in the editor so they can fix the broken embed before the rendered version of their vault shows a missing-file placeholder.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.Resolution.ImageTarget, Embed.HeadingEmbed.Resolution, Embed.BlockEmbed.Resolution

---

**Tag:** User.Embed.PreviewLinkedContent
**Goal:** Hover over an embed to preview the target
**Need:** A vault author hovering over an `![[embed]]` link wants to see a quick preview of the embedded content without switching to the target file. They expect to see enough context — the first lines of a note, or the image itself — to confirm they are embedding the right resource without interrupting their writing flow.
**Maps to:** Embed.Resolution.MarkdownTarget, Embed.HeadingEmbed.Resolution
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/embedding-content.md
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/embedding-content.md
git commit -m "docs(user-req): add embedding-content theme (2 reqs)"
```

---

## Task 6: Create `writing-with-tags.md`

**Files:**

- Create: `docs/requirements/user/writing-with-tags.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Writing With Tags User Requirements
tags:
  - requirements/user/writing-with-tags
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
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/writing-with-tags.md
```

Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/writing-with-tags.md
git commit -m "docs(user-req): add writing-with-tags theme (3 reqs)"
```

---

## Task 7: Create `referencing-blocks.md`

**Files:**

- Create: `docs/requirements/user/referencing-blocks.md`

- [ ] **Step 1: Create the file**

```markdown
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
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/referencing-blocks.md
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/referencing-blocks.md
git commit -m "docs(user-req): add referencing-blocks theme (2 reqs)"
```

---

## Task 8: Create `seeing-broken-links.md`

**Files:**

- Create: `docs/requirements/user/seeing-broken-links.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Seeing Broken Links User Requirements
tags:
  - requirements/user/seeing-broken-links
---

# Seeing Broken Links User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors learn about broken, ambiguous, or missing references in their vault. Implementation details are in [[diagnostics]], [[wiki-link-resolution]], and [[embed-resolution]].

---

**Tag:** User.Diagnose.SpotBrokenLinks
**Goal:** See immediately which links point to non-existent notes
**Need:** A vault author wants to know immediately when any of their `[[wiki-links]]` point to notes that do not exist in the vault. They expect broken links to appear as clearly marked errors in the editor, updated promptly after each change, so they can fix them before the vault becomes internally inconsistent. When working on a single file without a vault, they expect cross-file errors to be suppressed so as not to produce false alarms.
**Maps to:** Diagnostic.Severity.WikiLink, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression

---

**Tag:** User.Diagnose.SpotAmbiguousLinks
**Goal:** Be warned when a link could resolve to more than one note
**Need:** A vault author with notes spread across multiple folders sometimes uses short link names that match more than one file. They want to be warned when a link is ambiguous — meaning the vault contains multiple notes the link could refer to — so they can make the link more specific and avoid linking to the wrong note unintentionally.
**Maps to:** Diagnostic.Ambiguous.RelatedInfo

---

**Tag:** User.Diagnose.SpotBrokenEmbeds
**Goal:** Be warned when an embedded file is missing
**Need:** A vault author who has embedded files using `![[embed]]` syntax wants to be warned when an embedded file cannot be found in the vault. They expect a visible warning distinct from the broken-link error so they can identify and fix broken embeds separately from broken links, reflecting that the two issues have different causes and fixes.
**Maps to:** Diagnostic.Severity.Embed, Diagnostic.Code.Assignment, Diagnostic.Debounce.Latency
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/seeing-broken-links.md
```

Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/seeing-broken-links.md
git commit -m "docs(user-req): add seeing-broken-links theme (3 reqs)"
```

---

## Task 9: Create `renaming-safely.md`

**Files:**

- Create: `docs/requirements/user/renaming-safely.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Renaming Safely User Requirements
tags:
  - requirements/user/renaming-safely
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
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/renaming-safely.md
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/renaming-safely.md
git commit -m "docs(user-req): add renaming-safely theme (2 reqs)"
```

---

## Task 10: Create `vault-setup.md`

**Files:**

- Create: `docs/requirements/user/vault-setup.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Vault Setup User Requirements
tags:
  - requirements/user/vault-setup
---

# Vault Setup User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors expect the server to discover and work with their vault without manual configuration. Implementation details are in [[workspace]].

---

**Tag:** User.Vault.AutoDetectVault
**Goal:** Have the server automatically find and use the vault root
**Need:** A vault author opens their Obsidian vault folder in their editor and expects the language server to automatically recognise the vault root without any manual configuration. They expect detection to work for standard Obsidian vaults and for folders marked with the server's own configuration file, with no need to specify the vault path explicitly.
**Maps to:** Workspace.VaultDetection.Primary, Workspace.VaultDetection.Fallback

---

**Tag:** User.Vault.WorkAcrossEntireVault
**Goal:** Have links resolve across all notes in the vault
**Need:** A vault author working within a single vault expects all features — link resolution, completion, find-references — to work across every note in that vault. They expect notes to be indexed automatically on startup, and for the index to stay up to date as they create, edit, or delete notes, so that no feature silently falls back to stale data.
**Maps to:** Workspace.FileExtension.Filter, Workspace.MultiFolder.Isolation
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/vault-setup.md
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/vault-setup.md
git commit -m "docs(user-req): add vault-setup theme (2 reqs)"
```

---

## Task 11: Create `configuring-behaviour.md`

**Files:**

- Create: `docs/requirements/user/configuring-behaviour.md`

- [ ] **Step 1: Create the file**

```markdown
---
title: Configuring Behaviour User Requirements
tags:
  - requirements/user/configuring-behaviour
---

# Configuring Behaviour User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors tune the server's behaviour to match their workflow. Implementation details are in [[configuration]].

---

**Tag:** User.Config.CustomiseLinkStyle
**Goal:** Configure how links are written (stem, title, path)
**Need:** A vault author wants to control how the server writes link text when inserting or updating links — for example, using only the file's stem, using the full title from frontmatter, or using the vault-relative file path. They expect their choice to apply consistently across all features without needing per-feature configuration, and to take effect immediately without restarting the editor.
**Maps to:** Config.Precedence.Layering, Link.Wiki.StyleBinding

---

**Tag:** User.Config.TuneCompletions
**Goal:** Control how many completion candidates are offered
**Need:** A vault author with a large vault may find the default number of completion suggestions either too many (overwhelming) or too few (requiring too much typing to filter). They want to set a limit on how many candidates the editor offers at once and expect that limit to be respected consistently across all completion contexts — links, tags, block refs, and callout types.
**Maps to:** Config.Validation.Candidates, Completion.Candidates.Cap
```

- [ ] **Step 2: Verify tag count**

```bash
grep -c '^**Tag:** User\.' docs/requirements/user/configuring-behaviour.md
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/user/configuring-behaviour.md
git commit -m "docs(user-req): add configuring-behaviour theme (2 reqs)"
```

---

## Task 12: Update `wiki-link-resolution.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/wiki-link-resolution.md`

In this file, each requirement block starts with `**Tag:** <tag-name>`. Insert a `**User Req:**` line immediately after each `**Tag:**` line, using the values from the FR Back-Reference Map above.

- [ ] **Step 1: Read the file to understand exact content**

```bash
head -30 docs/requirements/wiki-link-resolution.md
```

- [ ] **Step 2: Add `User Req:` after each `**Tag:**` line**

For each of the 5 FR tags in this file, insert the corresponding `User Req:` line. The result for the first block should look like:

```markdown
**Tag:** Link.Wiki.StyleBinding
**User Req:** User.Navigate.JumpToNote, User.Author.CompleteWikiLink, User.Author.FollowLinkStyle, User.Config.CustomiseLinkStyle
**Gist:** Completion items and rename edits must conform to …
```

Apply the same pattern for all 5 tags:

- `Link.Wiki.AliasResolution` → `User.Navigate.JumpToNote`
- `Link.Resolution.ModeScope` → `User.Diagnose.SpotBrokenLinks`
- `Link.Inline.URLSkip` → `User.Diagnose.SpotBrokenLinks`
- `Link.Resolution.IgnoreGlob` → `User.Author.CompleteWikiLink`

- [ ] **Step 3: Verify all 5 `User Req:` lines are present**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/wiki-link-resolution.md
```

Expected: `5`

- [ ] **Step 4: Commit**

```bash
git add docs/requirements/wiki-link-resolution.md
git commit -m "docs(user-req): add User Req: back-refs to wiki-link-resolution"
```

---

## Task 13: Update `embed-resolution.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/embed-resolution.md`

FR tags in this file and their User Req values:

- `Embed.Resolution.MarkdownTarget` → `User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent`
- `Embed.Resolution.ImageTarget` → `User.Embed.DetectBrokenEmbed`
- `Embed.HeadingEmbed.Resolution` → `User.Embed.DetectBrokenEmbed, User.Embed.PreviewLinkedContent`
- `Embed.BlockEmbed.Resolution` → `User.Embed.DetectBrokenEmbed`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line** (same pattern as Task 12)

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/embed-resolution.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/embed-resolution.md
git commit -m "docs(user-req): add User Req: back-refs to embed-resolution"
```

---

## Task 14: Update `tag-indexing.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/tag-indexing.md`

FR tags and User Req values:

- `Tag.Index.Completeness` → `User.Tags.CompleteTag`
- `Tag.Hierarchy.Awareness` → `User.Tags.FindTaggedNotes, User.Tags.UseHierarchicalTags`
- `Tag.YAML.Equivalence` → `User.Tags.FindTaggedNotes`
- `Tag.Completion.Unicode` → `User.Tags.CompleteTag`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/tag-indexing.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/tag-indexing.md
git commit -m "docs(user-req): add User Req: back-refs to tag-indexing"
```

---

## Task 15: Update `block-references.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/block-references.md`

FR tags and User Req values:

- `Block.Anchor.Indexing` → `User.Blocks.ReferenceSpecificText`
- `Block.CrossRef.Diagnostic` → `User.Blocks.ReferenceSpecificText`
- `Block.Completion.Offer` → `User.Blocks.CompleteBlockRef`
- `Block.Anchor.Lineend` → `User.Blocks.CompleteBlockRef`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/block-references.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/block-references.md
git commit -m "docs(user-req): add User Req: back-refs to block-references"
```

---

## Task 16: Update `completions.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/completions.md`

FR tags and User Req values:

- `Completion.Candidates.Cap` → `User.Author.CompleteWikiLink, User.Config.TuneCompletions`
- `Completion.Trigger.Coverage` → `User.Author.CompleteWikiLink, User.Author.CompleteHeading, User.Author.CompleteCallout, User.Tags.CompleteTag`
- `Completion.CalloutType.Coverage` → `User.Author.CompleteCallout`
- `Completion.WikiStyle.Binding` → `User.Author.CompleteWikiLink, User.Author.FollowLinkStyle`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/completions.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/completions.md
git commit -m "docs(user-req): add User Req: back-refs to completions"
```

---

## Task 17: Update `diagnostics.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/diagnostics.md`

FR tags and User Req values:

- `Diagnostic.Severity.WikiLink` → `User.Diagnose.SpotBrokenLinks`
- `Diagnostic.Severity.Embed` → `User.Diagnose.SpotBrokenEmbeds`
- `Diagnostic.Code.Assignment` → `User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds`
- `Diagnostic.Debounce.Latency` → `User.Diagnose.SpotBrokenLinks, User.Diagnose.SpotBrokenEmbeds`
- `Diagnostic.Ambiguous.RelatedInfo` → `User.Diagnose.SpotAmbiguousLinks`
- `Diagnostic.SingleFile.Suppression` → `User.Diagnose.SpotBrokenLinks`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/diagnostics.md
```

Expected: `6`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/diagnostics.md
git commit -m "docs(user-req): add User Req: back-refs to diagnostics"
```

---

## Task 18: Update `navigation.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/navigation.md`

FR tags and User Req values:

- `Navigation.Definition.AllLinkTypes` → `User.Navigate.JumpToNote, User.Blocks.ReferenceSpecificText`
- `Navigation.References.Completeness` → `User.Navigate.FindAllReferences`
- `Navigation.CodeLens.Count` → `User.Navigate.SeeReferenceCount`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/navigation.md
```

Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/navigation.md
git commit -m "docs(user-req): add User Req: back-refs to navigation"
```

---

## Task 19: Update `rename.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/rename.md`

FR tags and User Req values:

- `Rename.Refactoring.Completeness` → `User.Rename.RenameNoteEverywhere, User.Rename.RenameHeadingEverywhere`
- `Rename.Prepare.Rejection` → `User.Rename.RenameHeadingEverywhere`
- `Rename.StyleBinding.Consistency` → `User.Rename.RenameNoteEverywhere, User.Author.FollowLinkStyle`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/rename.md
```

Expected: `3`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/rename.md
git commit -m "docs(user-req): add User Req: back-refs to rename"
```

---

## Task 20: Update `workspace.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/workspace.md`

FR tags and User Req values:

- `Workspace.VaultDetection.Primary` → `User.Vault.AutoDetectVault`
- `Workspace.VaultDetection.Fallback` → `User.Vault.AutoDetectVault`
- `Workspace.FileExtension.Filter` → `User.Vault.WorkAcrossEntireVault`
- `Workspace.MultiFolder.Isolation` → `User.Vault.WorkAcrossEntireVault`

- [ ] **Step 1: Insert `User Req:` after each `**Tag:**` line**

- [ ] **Step 2: Verify**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/workspace.md
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/workspace.md
git commit -m "docs(user-req): add User Req: back-refs to workspace"
```

---

## Task 21: Update `configuration.md` — add `User Req:` fields

**Files:**

- Modify: `docs/requirements/configuration.md`

FR tags and User Req values (only 2 of 4 FR tags in this file have user mappings):

- `Config.Precedence.Layering` → `User.Config.CustomiseLinkStyle`
- `Config.Validation.Candidates` → `User.Config.TuneCompletions`
- `Config.Fault.Isolation` — no user mapping (operational concern; do not add `User Req:`)
- `Config.TextSync.Default` — no user mapping (implementation detail; do not add `User Req:`)

- [ ] **Step 1: Insert `User Req:` after the `**Tag:**` lines for the two mapped FRs only**

- [ ] **Step 2: Verify exactly 2 added (not 4)**

```bash
grep -c '^\*\*User Req:\*\*' docs/requirements/configuration.md
```

Expected: `2`

- [ ] **Step 3: Confirm unmapped FRs have no `User Req:` field**

```bash
grep -A1 'Config\.Fault\.Isolation' docs/requirements/configuration.md | grep 'User Req'
```

Expected: no output (empty)

- [ ] **Step 4: Commit**

```bash
git add docs/requirements/configuration.md
git commit -m "docs(user-req): add User Req: back-refs to configuration (2 of 4 FRs)"
```

---

## Task 22: Update `requirements/index.md` — link to user layer

**Files:**

- Modify: `docs/requirements/index.md`

- [ ] **Step 1: Read the current Related Documents section**

```bash
tail -10 docs/requirements/index.md
```

- [ ] **Step 2: Add User Requirements section before Related Documents**

Insert the following block immediately before the `## Related Documents` section:

```markdown
## User Requirements

The user requirements layer lives in [[requirements/user/index]]. It contains 23 implementation-agnostic user goals across 9 themes, each mapping to one or more functional requirements in this index. Every functional requirement that has a user-level mapping carries a `User Req:` field directly below its `Tag` field.
```

- [ ] **Step 3: Verify the section was added**

```bash
grep -c 'User Requirements' docs/requirements/index.md
```

Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add docs/requirements/index.md
git commit -m "docs(user-req): link user requirements layer from requirements/index"
```

---

## Task 23: Validate bidirectionality

- [ ] **Step 1: Count total `User Req:` fields across all updated FR files**

```bash
grep -r '^\*\*User Req:\*\*' docs/requirements/*.md | wc -l
```

Expected: `39` (sum of Tasks 12–21: 5+4+4+4+4+6+3+3+4+2)

- [ ] **Step 2: Count total UR tags across all user/ theme files**

```bash
grep -rh '^**Tag:** User\.' docs/requirements/user/*.md | grep -v index | wc -l
```

Expected: `23`

- [ ] **Step 3: Verify every UR tag in user/index.md appears in exactly one theme file**

```bash
grep '^\| User\.' docs/requirements/user/index.md | awk -F'|' '{print $2}' | tr -d ' ' | sort > /tmp/index-tags.txt
grep -rh '^**Tag:** User\.' docs/requirements/user/*.md | grep -v index | awk '{print $2}' | sort > /tmp/theme-tags.txt
diff /tmp/index-tags.txt /tmp/theme-tags.txt
```

Expected: no diff output

- [ ] **Step 4: Verify all `Maps to:` FR tags in theme files exist as `**Tag:**` entries in FR files**

```bash
grep -rh '^\*\*Maps to:\*\*' docs/requirements/user/*.md \
  | sed 's/\*\*Maps to:\*\* //' \
  | tr ',' '\n' \
  | tr -d ' ' \
  | sort -u \
  | while read tag; do
      grep -ql "^\*\*Tag:\*\* $tag" docs/requirements/*.md \
        || echo "MISSING FR TAG: $tag"
    done
```

Expected: no output (all FR tags found)

- [ ] **Step 5: Fix any issues found by validation, then commit**

```bash
git add -A
git commit -m "docs(user-req): fix any bidirectionality issues found by validation"
```

(Skip this step if Step 4 produced no output.)

---

## Task 24: Open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/user-requirements
```

- [ ] **Step 2: Open PR targeting `develop`**

```bash
gh pr create \
  --base develop \
  --title "docs: add user requirements layer (23 reqs, 9 themes)" \
  --body "Adds docs/requirements/user/ with 23 implementation-agnostic user requirements across 9 themes. Bidirectional traceability to 39 functional requirement entries. Spec: docs/superpowers/specs/2026-04-17-user-requirements-design.md"
```

- [ ] **Step 3: Verify CI passes**

Check GitHub Actions on the PR. The `CICD.Markdown.DocsFolderLinting` gate will lint all new markdown files. Fix any lint errors before merging.
