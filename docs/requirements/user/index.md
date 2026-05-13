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
| User.Config.CustomizeLinkStyle | Configure how links are written (stem, title, path) | [[configuring-behavior]] | Config.Precedence.Layering, Link.Wiki.StyleBinding |
| User.Config.TuneCompletions | Control how many completion candidates are offered | [[configuring-behavior]] | Config.Validation.Candidates, Completion.Candidates.Cap |
| User.Extension.PreserveMarkdownLanguage | Keep `.md` files in VS Code's normal Markdown mode | [[vscode-language-mode]] | Extension.MarkdownLanguage.PreserveDefault |
| User.Extension.SelectMarkdownFlavor | Choose any supported researched Markdown flavor | [[vscode-language-mode]] | Extension.MarkdownFlavor.Selector, Extension.MarkdownFlavor.RequiredCoverage |
| User.Extension.AutoDetectFlavor | Let VS Code infer the Markdown flavor from vault context | [[vscode-language-mode]] | Extension.MarkdownFlavor.AutoDetection |
| User.Extension.OverrideMarkdownFlavor | Persist manual flavor choices at the right scope | [[vscode-language-mode]] | Extension.MarkdownFlavor.OverridePersistence |
| User.Extension.TrustFlavorBehavior | Make selected flavors affect server analysis | [[vscode-language-mode]] | Extension.MarkdownFlavor.ServerPropagation, Extension.MarkdownFlavor.DialectProfiles |
| User.Extension.PreserveManualMode | Preserve manual non-Markdown language choices | [[vscode-language-mode]] | Extension.MarkdownFlavor.ManualLanguageSafety |
| User.Author.UseStandardMarkdownLinks | Use standard Markdown links safely | [[docs/requirements/user/ofmarkdown-parity]] | Parity.MarkdownLinks.LocalResolution, Parity.MarkdownLinks.ParseCoverage, Parity.MarkdownLinks.TargetClassification, Parity.MarkdownLinks.ReferenceGraph, Parity.MarkdownLinks.Completion |
| User.Diagnose.SpotAmbiguousHeadingAnchors | Detect ambiguous heading links | [[docs/requirements/user/ofmarkdown-parity]] | Parity.HeadingAmbiguity.Diagnostics, Parity.MarkdownLinks.SameDocumentAnchor |
| User.Rename.MoveNotesSafely | Move notes without breaking links | [[docs/requirements/user/ofmarkdown-parity]] | Parity.FileOperations.AtomicRefactor, Parity.FileOperations.CapabilityRegistration, Parity.FileOperations.MovePlannerConfinement, Parity.FileOperations.ReferenceRewrite, Parity.FileOperations.SkippedAmbiguousReporting, Parity.FileOperations.AtomicValidation, Parity.FileOperations.IndexRefresh |
| User.Embed.ManageAttachments | Manage attachments with editor help | [[docs/requirements/user/ofmarkdown-parity]] | Parity.Attachments.Intelligence, Parity.Attachments.IndexCoverage, Parity.Attachments.Completion, Parity.Attachments.Diagnostics, Parity.Attachments.NavigationHover, Parity.Attachments.ConfigHints |
| User.Navigate.UseEditorStructure | Use editor structure tools in OFMarkdown | [[docs/requirements/user/ofmarkdown-parity]] | Parity.StructuralLSP.Coverage, Parity.StructuralLSP.CapabilityRegistration, Parity.StructuralLSP.DocumentLinks, Parity.StructuralLSP.FoldingRanges, Parity.StructuralLSP.SelectionRanges |
| User.Extension.StartOnlyForVaults | Start automatically for vaults without invading generic Markdown | [[docs/requirements/user/vscode-extension-parity]] | Extension.Activation.VaultPrecision, Extension.Activation.MarkerEvents, Extension.MarkdownFlavor.Refresh |
| User.Extension.UseNativeVSCodeActions | Use native VS Code actions for vault navigation | [[docs/requirements/user/vscode-extension-parity]] | Extension.CommandBridges.NativeUI, Extension.CommandBridges.PayloadValidation, Extension.CommandBridges.GraphActions, Extension.Contributions.FlavorScoped |
| User.Extension.TrustExtensionBehavior | Trust extension behavior across updates | [[docs/requirements/user/vscode-extension-parity]] | Extension.Tests.HostCoverage, Extension.MarkdownFlavor.Refresh, Extension.Workspace.EnvironmentModes |
| User.Extension.EvaluateBeforeInstall | Understand the extension before installing | [[docs/requirements/user/vscode-extension-parity]] | Extension.Marketplace.OFMProof, Extension.Marketplace.AssetPackaging |
| User.Extension.UnderstandServerState | Understand server state at a glance | [[docs/requirements/user/vscode-extension-parity]] | Extension.Status.Diagnostics, Extension.Status.QuickActions, Extension.Workspace.EnvironmentModes |

## Related Documents

- [[docs/requirements/index]] — functional requirements index (Planguage layer)
- [[docs/requirements/user/navigating-notes]] — navigation user requirements
- [[docs/requirements/user/authoring-links]] — authoring and completion user requirements
- [[docs/requirements/user/embedding-content]] — embed user requirements
- [[docs/requirements/user/writing-with-tags]] — tag user requirements
- [[docs/requirements/user/referencing-blocks]] — block reference user requirements
- [[docs/requirements/user/seeing-broken-links]] — diagnostic user requirements
- [[docs/requirements/user/renaming-safely]] — rename user requirements
- [[docs/requirements/user/vault-setup]] — vault detection user requirements
- [[docs/requirements/user/configuring-behavior]] — configuration user requirements
- [[docs/requirements/user/vscode-language-mode]] — VS Code OFMarkdown language mode user requirements
- [[docs/requirements/user/ofmarkdown-parity]] — OFMarkdown parity user requirements
- [[docs/requirements/user/vscode-extension-parity]] — VS Code extension parity user requirements
