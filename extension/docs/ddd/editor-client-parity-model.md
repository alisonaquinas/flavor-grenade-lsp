---
title: Editor Client Parity Model
tags: [extension/docs, ddd, editor-client, parity]
aliases: [Extension Client Parity Model]
---

# Editor Client Parity Model

This model extends the root Editor Client bounded context for VS Code parity.

## Components

| Component | Responsibility |
|---|---|
| ExtensionClient | Owns activation and LanguageClient lifecycle |
| BinaryResolver | Resolves custom, development, or bundled server command |
| StatusBarWidget | Displays server and vault state |
| MarkdownFlavorController | Resolves auto-detected and user-selected Markdown flavor state while preserving VS Code's `markdown` language mode |
| CommandBridgeRegistry | Registers VS Code commands that consume server payloads |
| MarketplaceEvidence | README screenshots and packaged visual assets |
| ExtensionHostTestHarness | Tests activation, commands, status, and failure states |

## CommandBridgeRegistry

The registry maps stable `flavorGrenade.*` command ids to VS Code API actions.
It validates payloads, shows user-visible errors for invalid payloads, and keeps
server-generated data out of VS Code-specific code until the bridge boundary.

## Invariants

- The extension does not import server-side TypeScript modules.
- Command bridge payloads are JSON-serializable.
- The server never imports VS Code APIs.
- Markdown flavor changes do not restart the LanguageClient.
- Restricted and virtual workspaces do not spawn the server.
