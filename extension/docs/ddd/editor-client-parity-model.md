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
| ServerResolver | Resolves custom, development, or bundled server command |
| StatusBarWidget | Displays server and vault state only |
| MarkdownFlavorController | Owns visible selector state and sends `MarkdownFlavorSelection` inputs while preserving VS Code's `markdown` language mode |
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
- MarkdownFlavorController owns selector state only; server BC4 owns authoritative effective flavor state. StatusBarWidget owns server and vault state. Shared status bar placement does not merge the state machines.
- LanguageClient `clientOptions.documentSelector` is file-backed `markdown` only for current flavor behavior; `ofmarkdown` must not remain in the current selector.
- Non-`markdown` editor language ids such as `mdx` are outside current selector behavior; the extension must not steal them for Markdown flavor analysis.
- Restricted and virtual workspaces do not spawn the server.

## Auto-Detection Contract

MarkdownFlavorController follows the root
[Markdown flavor auto-detection algorithm](../../../docs/design/markdown-flavor-auto-detection.md)
for selector display, override scope, and server propagation. The extension
owns UI and settings writes; it does not compute server-authoritative parser
semantics beyond sending validated, resource-specific selector/effective flavor
state.
