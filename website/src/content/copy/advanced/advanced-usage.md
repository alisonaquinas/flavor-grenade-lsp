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

- [Configuration Model](/advanced-usage/configuration-model/) - Understand Auto Detect, `.mdfignore`, `.mdfattributes`, VS Code extension behavior, and direct-client configuration.
- [Vault Mode and Single-file Mode](/advanced-usage/vault-mode-and-single-file-mode/) - Compare vault-wide behavior with the CommonMark single-file fallback.
- [Indexing and Performance](/advanced-usage/indexing-and-performance/) - Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.
- [Unsupported URI Schemes and Confinement](/advanced-usage/unsupported-uri-schemes-and-confinement/) - See how local file targets are separated from external URLs, app schemes, and outside paths.
- [Parser Boundaries and Opaque Regions](/advanced-usage/parser-boundaries-and-opaque-regions/) - Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.
- [Compatibility and Direct LSP Integration](/advanced-usage/compatibility-and-direct-lsp-integration/) - Use the VS Code extension's bundled server first; direct LSP clients own launch and initialization.

## Current behavior and planned behavior

Current behavior is strongest in the VS Code extension and local language server. The extension ships a bundled JavaScript server module, opens local file-system workspaces, writes selected file or directory flavor choices to `.mdfattributes`, and refreshes when `.mdfignore` or `.mdfattributes` changes. Auto Detect runs independently when no concrete `.mdfattributes` flavor applies, then uses Obsidian markers, strong syntax evidence, and CommonMark fallback.

When a page describes direct LSP clients, read it as integration guidance. The server speaks LSP over stdio, but non-VS-Code clients still own launch, root selection, transport, configuration payloads, and file watching.

- Current behavior: VS Code extension, direct server use, vault-aware Markdown features, flavor-aware parsing, path and URI confinement, and CommonMark fallback for generic Markdown.
- Planned behavior: deeper public docs and website publishing automation, including S3/OIDC-backed delivery where the project uses it.
