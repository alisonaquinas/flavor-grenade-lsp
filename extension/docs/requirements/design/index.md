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
