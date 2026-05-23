---
title: Extension Design Requirements
tags:
  - extension/docs
  - requirements/design
aliases:
  - Extension Design Requirements
---

# Extension Design Requirements

Extension design requirements cover client UX shape: status presentation,
Markdown flavor selection, native VS Code command affordances, and Marketplace
proof. Detailed measurable behavior remains in
[extension functional requirements](../functional/vscode-extension-parity.md).

## Scope

The extension should feel like a VS Code-native productivity tool, not a custom
application embedded inside the editor. Status and flavor controls belong in the
status bar and command palette. Commands should use native VS Code pickers,
notifications, editor navigation, and file-opening behavior unless a documented
extension-host limitation requires a different surface.

## Design Principles

- Keep primary state visible without crowding the status bar.
- Prefer native VS Code affordances over custom webviews for command selection,
  diagnostics, and navigation.
- Separate server health from Markdown flavor selection so users can understand
  both the language server state and the active Markdown profile.
- Do not show raw absolute vault paths in routine UI; use document names,
  workspace-relative paths, or sanitized diagnostics.
- Ensure Marketplace assets prove the actual extension experience rather than
  relying on generic product copy.

## Design Surfaces

| Surface | Requirement Source |
|---|---|
| Markdown flavor selector | [Extension.MarkdownFlavor.Selector](../functional/vscode-extension-parity.md#extensionmarkdownflavorselector) |
| Status and quick actions | [Extension.Status.Diagnostics](../functional/vscode-extension-parity.md#extensionstatusdiagnostics) and [Extension.Status.QuickActions](../functional/vscode-extension-parity.md#extensionstatusquickactions) |
| Native command bridges | [Extension.CommandBridges.NativeUI](../functional/vscode-extension-parity.md#extensioncommandbridgesnativeui) |
| Marketplace proof | [Extension.Marketplace.OFMProof](../functional/vscode-extension-parity.md#extensionmarketplaceofmproof) and [Extension.Marketplace.AssetPackaging](../functional/vscode-extension-parity.md#extensionmarketplaceassetpackaging) |

## Related Design Context

- [VS Code extension parity feature](../../features/vscode-extension-parity.md)
- [Editor client parity model](../../ddd/editor-client-parity-model.md)
- [Troubleshooting UX](../../troubleshooting.md)
