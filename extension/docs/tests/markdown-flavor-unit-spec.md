---
title: Extension Markdown Flavor Unit Test Specification
tags: [extension/docs, tests, unit, markdown-flavor]
aliases: [Extension Markdown Flavor Unit Tests]
---

# Extension Markdown Flavor Unit Test Specification

Target file: `extension/src/markdown-flavor.test.ts`.

Auto-detection resolver cases follow the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md).

## Core Unit Cases

| Spec ID | Unit target | Requirement tags | Assertions |
|---|---|---|---|
| EXT-MF-U-001 | Flavor constants | `Extension.MarkdownFlavor.RequiredCoverage` | Exported flavor list includes `auto` and every required explicit flavor id in stable display order. |
| EXT-MF-U-002 | Selector labels | `Extension.MarkdownFlavor.Selector` | Quick-pick labels and status labels match requirements for all flavors. |
| EXT-MF-U-003 | Language preservation | `Extension.MarkdownLanguage.PreserveDefault` | Refresh logic never calls `setTextDocumentLanguage` for flavor selection. |
| EXT-MF-U-004 | Auto-detection resolver | `Extension.MarkdownFlavor.AutoDetection` | The root auto-detection truth table is covered: workspace-folder/workspace/user scope, `.obsidian/`, `.flavor-grenade.toml`, project config, server membership, invalid values, and CommonMark fallback. |
| EXT-MF-U-005 | Membership fallback | `Extension.MarkdownFlavor.AutoDetection` | Server membership response can resolve Obsidian/Flavor Grenade vault state after startup. |
| EXT-MF-U-006 | Workspace override target | `Extension.MarkdownFlavor.OverridePersistence` | Folder-backed active document writes `flavorGrenade.markdownFlavor` to workspace-folder or workspace scope. |
| EXT-MF-U-007 | Standalone override target | `Extension.MarkdownFlavor.OverridePersistence` | Standalone Markdown file writes override to user scope. |
| EXT-MF-U-008 | Auto clearing | `Extension.MarkdownFlavor.OverridePersistence` | Selecting `Auto Detect` clears or resets the override at the active scope. |
| EXT-MF-U-009 | Server propagation | `Extension.MarkdownFlavor.ServerPropagation`, `Security.Input.FlavorPropagationPayload` | Changing flavor sends configuration or metadata refresh with the exact effective flavor id for every required explicit flavor, including standalone `original`; oversized maps, unsafe resource keys, dangerous object keys, stale resources, and restricted/virtual/untrusted contexts do not propagate. |
| EXT-MF-U-010 | Refresh triggers | `Extension.MarkdownFlavor.Refresh` | Server ready, index rebuild, workspace folder changes, visible editor changes, file-open events, selector changes, and `.flavor-grenade.toml` appear/disappear/change events recompute effective flavor. |
| EXT-MF-U-011 | Manual language safety | `Extension.MarkdownFlavor.ManualLanguageSafety` | Documents with `plaintext`, `mdx`, or any non-`markdown` language id are ignored by flavor application and do not receive server propagation/reanalysis until their language id returns to `markdown`. |
| EXT-MF-U-012 | MDX distinction | `Extension.MarkdownFlavor.ManualLanguageSafety`, `Extension.MarkdownFlavor.RequiredCoverage` | `mdx` can be selected as a flavor only when the document language id remains `markdown`; a VS Code `mdx` language document is not modified. |
| EXT-MF-U-013 | Flavor contract parity | `Extension.MarkdownFlavor.RequiredCoverage` | Extension constants, package schema enum, quick-pick ids, and server accepted ids are identical. |
| EXT-MF-U-014 | Document selector and activation manifest guard | `Extension.Activation.MarkerEvents`, `Extension.MarkdownLanguage.PreserveDefault`, `Extension.MarkdownFlavor.Refresh` | `package.json` activation events and `LanguageClient.clientOptions.documentSelector` include file-backed `markdown` coverage and reject stale `ofmarkdown` selectors or `onLanguage:ofmarkdown` activation. |

## Contribution Unit Cases

Target files: `extension/test/contributions/*.test.ts`.

| Spec ID | Target | Assertions |
|---|---|---|
| EXT-MF-C-001 | Snippets | Flavor-specific snippets are gated by context keys or commands, not by an `ofmarkdown` language contribution. |
| EXT-MF-C-002 | Keybindings | Flavor-specific keybindings require explicit flavor/context preconditions and do not affect generic Markdown unintentionally. |
| EXT-MF-C-003 | Language configuration | Any language configuration changes apply to built-in Markdown safely or are removed; no custom Markdown language id is required. |
| EXT-MF-C-004 | Isolation | Generic Markdown with `auto` resolving to CommonMark does not receive Obsidian-only affordances. |
| EXT-MF-C-005 | Commands | Flavor-specific commands require selector/context preconditions and do not become active solely because a document has VS Code language id `markdown`. |
| EXT-MF-C-006 | Optional theme/example contributions | Optional theme examples or visual proof contributions are flavor-scoped or explicitly marked not applicable; no custom `ofmarkdown` language contribution is introduced. |
