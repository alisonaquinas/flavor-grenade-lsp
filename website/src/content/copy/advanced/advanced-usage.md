---
title: "Advanced Usage | Flavor Grenade LSP"
description: "Advanced configuration, indexing, confinement, parser, and direct-LSP integration notes."
h1: "Advanced Usage"
summary: "Advanced pages explain the boundaries you may need when configuring, integrating, or troubleshooting Flavor Grenade."
related: ["advancedConfigurationModel","advancedVaultSingleFileMode","advancedDirectLspIntegration"]
---

# Advanced Usage

Advanced pages explain the boundaries you may need when configuring, integrating, or troubleshooting Flavor Grenade.

## Where to go next

These pages are for readers who need more than the happy path: Configuration model details, Vault mode and single-file mode, Indexing and performance, Unsupported URI schemes, Opaque regions, and direct language-server integration.

Each article explains the boundary in plain English first, then gives a small example you can check in a vault.

- [Configuration Model](/advanced-usage/configuration-model/) - Understand VS Code settings, vault markers, document extensions, and server options.
- [Vault Mode and Single-file Mode](/advanced-usage/vault-mode-and-single-file-mode/) - Compare vault-wide behavior with the conservative single-file fallback mode.
- [Indexing and Performance](/advanced-usage/indexing-and-performance/) - Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.
- [Unsupported URI Schemes and Confinement](/advanced-usage/unsupported-uri-schemes-and-confinement/) - See how local vault targets are separated from external URLs, schemes, and outside paths.
- [Parser Boundaries and Opaque Regions](/advanced-usage/parser-boundaries-and-opaque-regions/) - Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.
- [Compatibility and Direct LSP Integration](/advanced-usage/compatibility-and-direct-lsp-integration/) - Use the supported VS Code extension path first; direct LSP clients own advanced setup.

## Current behavior and planned behavior

Current behavior is strongest in the VS Code extension and local language server. Planned behavior includes richer website delivery and broader public docs, not promises that every editor works out of the box.

When a page describes direct LSP clients, read it as integration guidance. The server speaks LSP, but non-VS-Code clients still own launch, root selection, transport, and file watching.

- Current behavior: VS Code extension, direct server use, and vault-aware Markdown features.
- Planned behavior: deeper public docs and deployment automation.
