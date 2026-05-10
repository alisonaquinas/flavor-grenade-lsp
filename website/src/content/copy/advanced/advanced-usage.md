---
title: "Advanced Usage | Flavor Grenade LSP"
description: "Advanced configuration, indexing, confinement, parser, and direct-LSP integration notes."
h1: "Advanced Usage"
summary: "Advanced usage covers direct LSP behavior, compatibility, and configuration details."
related: ["advancedConfigurationModel","advancedVaultSingleFileMode","advancedDirectLspIntegration"]
---

# Advanced Usage

Advanced usage covers direct LSP behavior, compatibility, and configuration details.

## Advanced topics

Configuration model, Vault mode and single-file mode, Indexing and performance, Unsupported URI schemes, Opaque regions, and direct LSP compatibility each have a focused article.

These pages are written for people who are maintaining the tool, integrating the server outside VS Code, or asking an LLM to modify a Karpathy-style LLM wiki without inventing behavior. Each article starts from the actual boundary the server depends on, then shows a small example that can be checked in a vault.

- [Configuration Model](/advanced-usage/configuration-model/) - Understand VS Code settings, vault markers, document extensions, and server options.
- [Vault Mode and Single-file Mode](/advanced-usage/vault-mode-and-single-file-mode/) - Compare vault-wide behavior with the conservative single-file fallback mode.
- [Indexing and Performance](/advanced-usage/indexing-and-performance/) - Learn how scanning, parsing, ignore rules, watchers, and rebuilds affect vault features.
- [Unsupported URI Schemes and Confinement](/advanced-usage/unsupported-uri-schemes-and-confinement/) - See how local vault targets are separated from external URLs, schemes, and outside paths.
- [Parser Boundaries and Opaque Regions](/advanced-usage/parser-boundaries-and-opaque-regions/) - Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.
- [Compatibility and Direct LSP Integration](/advanced-usage/compatibility-and-direct-lsp-integration/) - Use the supported VS Code extension path first; direct LSP clients own advanced setup.

## Current behavior and planned behavior

Current behavior is strongest in the VS Code extension and local LSP server. Planned behavior includes richer static website delivery and broader public docs, not unsupported editor claims.

When a page describes direct LSP clients, read it as integration guidance rather than a promise that every editor works out of the box. The server speaks LSP, but non-VS-Code clients still own launch, root selection, transport, and file watching details.

- Current behavior: VS Code extension, direct server, vault-aware OFM features.
- Planned behavior: deeper public docs and deployment automation.
