---
title: User Requirements Layer — Design Spec
date: 2026-04-17
tags: [spec, requirements, user-requirements]
status: approved
---

# User Requirements Layer — Design Spec

## Context

`flavor-grenade-lsp` has a well-established functional requirements layer in `docs/requirements/` using Planguage format (Tag / Gist / Ambition / Scale / Meter / Fail / Goal). Those requirements are implementation-aware and measurable. This spec describes a new **user requirements layer** that sits above the functional layer, expressing what vault authors and LSP client users are trying to accomplish — independent of implementation detail.

---

## Decisions

| Question | Decision |
|----------|----------|
| Format | Option C — goal-oriented: `Tag` + `Goal` (short title) + `Need` (one paragraph) + `Maps to` (FR tags) |
| Location | `docs/requirements/user/` — one file per theme |
| Cross-reference | Bidirectional — user req files list FR tags; FR files gain a `User Req:` field |
| Tag scheme | Dot-notation: `User.Theme.Goal` (e.g., `User.Navigate.JumpToNote`) |
| User index | Dedicated `docs/requirements/user/index.md` with master tag table |
| Scope | End-user-facing features only — CI/CD, code-quality, and development-process FR files are not updated |

---

## File Structure

```
docs/requirements/
├── index.md                      ← gains a link to user/index.md
├── user/
│   ├── index.md                  ← master UR tag table + cross-ref
│   ├── navigating-notes.md       ← 3 user reqs
│   ├── authoring-links.md        ← 3 user reqs
│   ├── embedding-content.md      ← 2 user reqs
│   ├── writing-with-tags.md      ← 3 user reqs
│   ├── referencing-blocks.md     ← 2 user reqs
│   ├── seeing-broken-links.md    ← 3 user reqs
│   ├── renaming-safely.md        ← 2 user reqs
│   ├── vault-setup.md            ← 2 user reqs
│   └── configuring-behaviour.md  ← 2 user reqs
├── wiki-link-resolution.md       ← gains `User Req:` fields
├── embed-resolution.md           ← gains `User Req:` fields
├── tag-indexing.md               ← gains `User Req:` fields
├── block-references.md           ← gains `User Req:` fields
├── completions.md                ← gains `User Req:` fields
├── diagnostics.md                ← gains `User Req:` fields
├── navigation.md                 ← gains `User Req:` fields
├── rename.md                     ← gains `User Req:` fields
├── workspace.md                  ← gains `User Req:` fields
└── configuration.md              ← gains `User Req:` fields
```

---

## User Requirement Entry Format

Each entry in a theme file:

```markdown
**Tag:** User.Navigate.JumpToNote
**Goal:** Navigate to a linked note
**Need:** A vault author clicks on or invokes go-to-definition on a `[[wiki-link]]`
and expects to be taken directly to the target note, regardless of where in the
vault that note lives or how the link is written.
**Maps to:** Link.Wiki.StyleBinding, Link.Wiki.AliasResolution,
             Navigation.Definition.AllLinkTypes
```

Rules:
- **Tag** — `User.Theme.Goal` dot-notation, unique across the project
- **Goal** — verb phrase from the user's perspective; no implementation terms
- **Need** — one paragraph, plain English; no mention of LSP methods, JSON-RPC, NestJS, or TypeScript
- **Maps to** — comma-separated list of Planguage FR tags

---

## Functional Requirement Back-Reference Format

Each affected FR entry gains one new field, inserted directly below `**Tag:**`:

```markdown
**Tag:** Navigation.Definition.AllLinkTypes
**User Req:** User.Navigate.JumpToNote, User.Blocks.ReferenceSpecificText
**Gist:** Go-to-definition must work for wiki-links …
```

---

## `user/index.md` Structure

```markdown
---
title: User Requirements Index — flavor-grenade-lsp
tags: [requirements/user]
---

# User Requirements Index

…preamble…

## Tag Table

| Tag | Goal | Theme file | Maps to (FR tags) |
|-----|------|------------|-------------------|
| User.Navigate.JumpToNote | … | navigating-notes | … |
…
```

The main `requirements/index.md` gains a brief section under **Related Documents**:

```markdown
## User Requirements

The user requirements layer lives in [[requirements/user/index]].
Each functional requirement that has a user-level mapping carries a `User Req:` field.
```

---

## Complete User Requirement Inventory

22 user requirements across 9 themes.

### navigating-notes (3)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Navigate.JumpToNote | Navigate to a linked note | Navigation.Definition.AllLinkTypes, Link.Wiki.StyleBinding, Link.Wiki.AliasResolution |
| User.Navigate.FindAllReferences | See everywhere a note or heading is referenced | Navigation.References.Completeness |
| User.Navigate.SeeReferenceCount | See at a glance how many notes link to a heading | Navigation.CodeLens.Count |

### authoring-links (3)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Author.CompleteWikiLink | Get suggestions when starting a `[[link` | Completion.Trigger.Coverage, Completion.WikiStyle.Binding, Completion.Candidates.Cap, Link.Resolution.IgnoreGlob |
| User.Author.CompleteHeading | Get heading suggestions after `[[note#` | Completion.Trigger.Coverage |
| User.Author.FollowLinkStyle | Have the server respect the vault's link style convention | Link.Wiki.StyleBinding, Completion.WikiStyle.Binding, Rename.StyleBinding.Consistency |

### embedding-content (2)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Embed.DetectBrokenEmbed | Be told immediately when an embedded file is missing | Embed.Resolution.MarkdownTarget, Embed.Resolution.ImageTarget, Embed.HeadingEmbed.Resolution, Embed.BlockEmbed.Resolution |
| User.Embed.PreviewLinkedContent | Hover over an embed to preview the target | Embed.Resolution.MarkdownTarget, Embed.HeadingEmbed.Resolution |

### writing-with-tags (3)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Tags.CompleteTag | Get tag suggestions while typing `#tag` | Tag.Index.Completeness, Tag.Completion.Unicode, Completion.Trigger.Coverage |
| User.Tags.FindTaggedNotes | Find all notes sharing a tag across the vault | Tag.Hierarchy.Awareness, Tag.YAML.Equivalence |
| User.Tags.UseHierarchicalTags | Use `#parent/child` tags and query by parent | Tag.Hierarchy.Awareness |

### referencing-blocks (2)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Blocks.ReferenceSpecificText | Link to and jump to a specific block in another note | Block.Anchor.Indexing, Block.CrossRef.Diagnostic, Navigation.Definition.AllLinkTypes |
| User.Blocks.CompleteBlockRef | Get block ID suggestions when referencing a block | Block.Completion.Offer, Block.Anchor.Lineend |

### seeing-broken-links (3)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Diagnose.SpotBrokenLinks | See immediately which links point to non-existent notes | Diagnostic.Severity.WikiLink, Diagnostic.Debounce.Latency, Diagnostic.SingleFile.Suppression |
| User.Diagnose.SpotAmbiguousLinks | Be warned when a link could resolve to more than one note | Diagnostic.Ambiguous.RelatedInfo |
| User.Diagnose.SpotBrokenEmbeds | Be warned when an embedded file is missing | Diagnostic.Severity.Embed, Diagnostic.Debounce.Latency |

### renaming-safely (2)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Rename.RenameNoteEverywhere | Rename a note and have all links updated automatically | Rename.Refactoring.Completeness, Rename.StyleBinding.Consistency |
| User.Rename.RenameHeadingEverywhere | Rename a heading and have all links to it updated | Rename.Refactoring.Completeness, Rename.Prepare.Rejection |

### vault-setup (2)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Vault.AutoDetectVault | Have the server automatically find and use the vault root | Workspace.VaultDetection.Primary, Workspace.VaultDetection.Fallback |
| User.Vault.WorkAcrossEntireVault | Have links resolve across all notes in the vault | Workspace.FileExtension.Filter, Workspace.MultiFolder.Isolation |

### configuring-behaviour (2)

| Tag | Goal | Maps to |
|-----|------|---------|
| User.Config.CustomiseLinkStyle | Configure how links are written (stem, title, path) | Config.Precedence.Layering, Link.Wiki.StyleBinding |
| User.Config.TuneCompletions | Control how many completion candidates are offered | Config.Validation.Candidates, Completion.Candidates.Cap |

---

## FR Back-Reference Map

Which `User Req:` values each functional requirement file gains:

| FR Tag | User Req values added |
|--------|-----------------------|
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
| Completion.Trigger.Coverage | User.Author.CompleteWikiLink, User.Author.CompleteHeading, User.Tags.CompleteTag |
| Completion.CalloutType.Coverage | User.Author.CompleteWikiLink |
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
| Config.Fault.Isolation | — (no end-user mapping; operational concern) |
| Config.TextSync.Default | — (no end-user mapping; operational concern) |

---

## Out of Scope

- CI/CD, code-quality, and development-process FR files — no `User Req:` fields added
- `Config.Fault.Isolation` and `Config.TextSync.Default` — operational/implementation concerns with no direct user goal
- No new ADRs required
- No changes to BDD feature files (traceability from BDD to UR is via FR tags, already cross-referenced)
