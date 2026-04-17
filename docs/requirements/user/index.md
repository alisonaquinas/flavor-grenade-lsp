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
