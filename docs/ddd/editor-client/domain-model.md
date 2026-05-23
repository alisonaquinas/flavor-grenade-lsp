---
title: "BC6 — Editor Client Domain Model"
tags:
  - ddd/domain-model
  - ddd/bc6
  - ddd/editor-client
  - architecture
aliases:
  - Editor Client domain model
  - BC6 domain model
  - ExtensionClient model
---

# BC6 — Editor Client Domain Model

This document is the authoritative domain model for **Bounded Context 6: Editor Client**. BC6 is a Generic Support subdomain. It contains no language intelligence or domain logic of its own — it is a thin wrapper that resolves the server command, manages the `LanguageClient` lifecycle, wires up status bar widgets and Command Palette commands, and maps server vault/index membership plus user settings to a Markdown flavor selector. All Markdown flavor intelligence lives in the server (BC2–BC5).

See also: [[bounded-contexts]], [[ubiquitous-language]], [[docs/ddd/lsp-protocol/domain-model]], [[docs/design/api-layer]], [[docs/superpowers/specs/2026-04-21-vscode-extension-design]].

> [!NOTE]
> BC6 is a **Conformist** to the LSP 3.17 specification (client side). It communicates with BC5 exclusively via JSON-RPC over stdio. It does not import any server-side types, aggregates, or domain events. The `flavorGrenade/status` custom notification and `flavorGrenade.rebuildIndex` command are the only non-standard protocol extensions consumed or sent.

---

## Subdomain Classification

| Attribute | Value |
|-----------|-------|
| Type | Generic Support subdomain |
| Integration pattern | Conformist (to LSP 3.17 spec, client side) |
| Primary artefact | `ExtensionClient` (the `activate()` / `deactivate()` entry points in `extension.ts`) |
| Custom extensions consumed | `flavorGrenade/status` notification (server → client) |
| Custom extensions queried | `flavorGrenade/documentMembership` request (client → server) |
| Custom extensions sent | `flavorGrenade.rebuildIndex` via `workspace/executeCommand`; command bridge payloads via `flavorGrenade.*` VS Code commands |
| Transport | JSON-RPC 2.0 over stdio (spawned child process) |
| Package | Separate npm package in `extension/` directory, not part of the NestJS server |
| Language | TypeScript, `vscode-languageclient@9.x`, VS Code Extension API |

---

## Aggregate: ExtensionClient

`ExtensionClient` is the main orchestrator in `extension.ts`. It is the single aggregate in BC6. Its responsibilities are:

1. Resolve the server command via `ServerResolver`.
2. Construct and start a `LanguageClient` with `Executable` server options over stdio.
3. Wire the `StatusBarWidget` to listen for `flavorGrenade/status` notifications.
4. Register Command Palette commands (`restartServer`, `rebuildIndex`, `showOutput`).
5. Register `MarkdownFlavorController` so Markdown documents keep VS Code's built-in `markdown` language id while sending a `MarkdownFlavorSelection` to the server.
6. Push all disposables to `context.subscriptions` for automatic cleanup.

### Lifecycle

```text
VS Code activates extension (onLanguage:markdown)
  │
  ▼
activate(context: ExtensionContext)
  │
  ├─ ServerResolver.resolveServerCommand(context)
  │    → user/machine setting flavorGrenade.server.path (if set)
  │    → ignores workspace and workspace-folder server.path values
  │    → development mode: node ../dist/main.js
  │    → packaged mode: node server/main.js
  │    → ERROR if the resolved command cannot start
  │
  ├─ Create LanguageClient
  │    serverOptions: { run: command, debug: command }
  │    clientOptions: {
  │      documentSelector: [
  │        { scheme: 'file', language: 'markdown' }
  │      ]
  │    }
  │
  ├─ client.start()
  │    → spawns server command as child process
  │    → JSON-RPC handshake (initialize / initialized)
  │
  ├─ Wire StatusBarWidget
  │    client.onNotification('flavorGrenade/status', handler)
  │
  ├─ Register commands
  │    flavorGrenade.restartServer  → client.restart()
  │    flavorGrenade.rebuildIndex   → client.sendRequest('workspace/executeCommand', ...)
  │    flavorGrenade.showOutput     → client.outputChannel.show()
  │
  ├─ Register MarkdownFlavorController
  │    early check: ancestor .obsidian/ exists
  │    server check: flavorGrenade/documentMembership
  │    selector: Auto Detect plus supported Markdown flavor ids
  │    persistence: workspace-folder setting for folder documents, user setting for standalone files
  │    propagation: refresh server analysis with effective Markdown flavor
  │
  └─ Push to context.subscriptions: [client, statusBarItem, ...commands]


VS Code deactivates extension (window close / extension disable)
  │
  ▼
deactivate(): void
  │
  └─ No-op (empty body)
       → LanguageClient pushed to context.subscriptions implements Disposable
       → VS Code host calls dispose() on all subscriptions during deactivation
       → LanguageClient.dispose() internally calls stop() → shutdown + exit
```

---

## Value Objects

### ServerResolver

A pure function (`resolveServerCommand`) that implements the supported startup
strategy for the server process.

```typescript
function resolveServerCommand(context: ExtensionContext): ServerCommand
```

**Resolution order:**

1. **User or machine setting** — `flavorGrenade.server.path` from VS Code configuration. Workspace and workspace-folder values are ignored so a repository cannot cause VS Code to execute an arbitrary server command. The setting remains an escape hatch for developers building the server from source.
2. **Development mode** — root `dist/main.js` started via `node`, so a local extension development host can use freshly compiled server output.
3. **Packaged mode** — bundled `server/main.js` started via `node`. This is the default for Marketplace users.

**No PATH fallback. No environment variable. No download.** The VSIX packages
the JavaScript server module and verifies it during release.

**Error handling:** If the resolved command cannot start, activation fails with
a user-visible error message and diagnostic details in the output channel.

### StatusBarWidget

A VS Code `StatusBarItem` that reflects the server's current indexing state. Driven entirely by `flavorGrenade/status` notifications from the server.

`StatusBarWidget` does not own Markdown flavor selector state. If the flavor
selector shares status bar real estate, it still remains a separate UI surface
backed by `MarkdownFlavorController`; server/vault lifecycle state and
Markdown flavor state use separate state machines.

**State transitions:**

| Server State | Status Bar Display | Icon |
|-------------|-------------------|------|
| `initializing` | `FG: Starting...` | `$(loading~spin)` |
| `indexing` | `FG: Indexing...` | `$(loading~spin)` |
| `ready` | `FG: Ready` | `$(check)` |
| `error` | `FG: Error` | `$(error)` |

**Behaviour:**

- Clicking the status bar item opens the output channel (`client.outputChannel.show()`).
- On client restart, the widget resets to `initializing` state.
- The widget is disposed automatically via `context.subscriptions`.

### CommandRegistration

Commands registered in `package.json` `contributes.commands` and wired in `activate()`:

| Command ID | Palette Label | Action |
|------------|--------------|--------|
| `flavorGrenade.restartServer` | Flavor Grenade: Restart Server | `client.restart()` — stops and restarts the server process |
| `flavorGrenade.rebuildIndex` | Flavor Grenade: Rebuild Index | Sends `workspace/executeCommand` with command `flavorGrenade.rebuildIndex` to the server |
| `flavorGrenade.showOutput` | Flavor Grenade: Show Output | `client.outputChannel.show()` — opens the LSP trace output panel |

### CommandBridge

`CommandBridge` is the VS Code-side adapter for server-provided payloads that
should open native VS Code UI rather than return raw LSP data. Command bridges
belong in BC6 because they depend on VS Code APIs and command names.

Candidate command bridges:

| Command ID | VS Code behavior |
|------------|------------------|
| `flavorGrenade.showReferences` | Calls `editor.action.showReferences` with source and target locations |
| `flavorGrenade.followLink` | Opens one or more resolved target locations through VS Code location UI |
| `flavorGrenade.openEmbedTarget` | Opens the file targeted by an OFM embed or Markdown image link |
| `flavorGrenade.showBacklinks` | Displays inbound references for the current document |
| `flavorGrenade.showOutlinks` | Displays outgoing references for the current document |
| `flavorGrenade.revealVaultRoot` | Reveals the active vault root in the file explorer |
| `flavorGrenade.copyDiagnosticInfo` | Copies extension/server/vault diagnostic info to the clipboard |

Bridge payloads must be JSON-serializable. The server may suggest a command and
payload in code lens, code action, or a custom request response, but it must not
import VS Code concepts.

### ExtensionHostTest

Extension-host tests verify BC6 behavior inside VS Code itself. They cover
activation, command registration, status bar updates, Markdown flavor selection,
custom server path failures, and command bridge payload validation.

### MarkdownFlavorController

The VS Code component that owns selector display state. It watches visible editors, opened documents, active editor changes, workspace folder changes, server readiness, and relevant configuration changes.

**Language invariant:** file-backed Markdown documents remain in VS Code's built-in `markdown` language mode. The controller must not call `setTextDocumentLanguage` for Flavor Grenade flavor selection.

**Selector invariant:** `MarkdownFlavorController` owns selector display state,
persisted selector values, and refresh decisions. It may expose that state through
a command, status bar item, or another VS Code UI surface, but the
`StatusBarWidget` remains limited to server and vault status.

**Auto-detection hint rule:** a file-backed `markdown` document displays an
Obsidian hint when either:

1. A `.obsidian/` directory is found in one of its ancestor directories.
2. The server returns `isOfMarkdown: true` from `flavorGrenade/documentMembership`.

Without a vault/config signal, the selector remains `auto`. BC4 resolves that
selector to the authoritative `EffectiveMarkdownFlavor`, commonly
`commonmark` for generic Markdown. The full precedence algorithm is specified
in [[docs/design/markdown-flavor-auto-detection]].

**Explicit override rule:** the selector can set `flavorGrenade.markdownFlavor`
to any supported Markdown flavor id. Folder-backed documents write the override
to the owning workspace folder or workspace setting. Standalone files write the
override to the user setting.

**Safety rules:**

- Never apply Markdown flavor behavior to a document whose language id is not `markdown`.
- Do not use VS Code language mode as flavor state.
- Do not restart the LanguageClient solely because the selector changed.
- Propagate selector changes through `workspace/didChangeConfiguration` with
  `flavorGrenade.markdownFlavor`; the server resolves the authoritative
  `EffectiveMarkdownFlavor`.
- If a document language id is `mdx`, `r`, `quarto`, or any non-`markdown`
  language id, the selector is disabled for that editor. Dedicated language
  tooling may own that editor experience.

### MarkdownFlavorSelection

The user-visible selector state for a Markdown document.

```typescript
type MarkdownFlavor =
  | 'auto'
  | 'original'
  | 'commonmark'
  | 'obsidian'
  | 'gfm'
  | 'glfm'
  | 'pandoc'
  | 'multimarkdown'
  | 'mdx'
  | 'kramdown'
  | 'markdown-extra'
  | 'r-markdown'
  | 'reddit'
  | 'stack-overflow';
```

`MarkdownFlavorSelection` is not a VS Code language id and is not server-authoritative effective state. The normal language id remains `markdown`; flavor selection tells Flavor Grenade which profile input to send to BC4. The server then resolves an explicit `EffectiveMarkdownFlavor`.

---

## Domain Events / Notifications Consumed

### `flavorGrenade/status` (server → client)

The only custom notification consumed by BC6. Published by the server (BC5) after state changes.

**Payload (as received by the client):**

```typescript
interface FlavorGrenadeStatusParams {
  state:       'initializing' | 'indexing' | 'ready' | 'error'
  vaultCount:  number
  docCount:    number
  message?:    string
}
```

**Consumed by:** `StatusBarWidget` — updates display text and icon based on `state` and `docCount`.

**Timing:** Received after server startup, vault detection, index rebuild, and on unrecoverable errors.

### `flavorGrenade/documentMembership` (client → server)

Custom request sent by `MarkdownFlavorController` when client-side `.obsidian/` detection is insufficient or when the server reports readiness after indexing.

```typescript
interface DocumentMembershipParams {
  uri: string;
}

interface DocumentMembershipResult {
  isOfMarkdown: boolean;
  indexed: boolean;
  vaultRoot?: string;
  reason: 'obsidian-vault' | 'flavor-config-vault' | 'single-file' | 'not-indexed';
}
```

The server-side answer is authoritative for `.flavor-grenade.toml` vaults and any document already present in the index. It is a membership hint, not a flavor computation result; BC6 must not infer the final effective flavor from it except to keep the selector UI coherent.

---

## Commands Sent

### `flavorGrenade.rebuildIndex` via `workspace/executeCommand`

Sent when the user invokes **Flavor Grenade: Rebuild Index** from the Command Palette.

```typescript
client.sendRequest('workspace/executeCommand', {
  command: 'flavorGrenade.rebuildIndex',
  arguments: [],
});
```

The server handles this by forcing a full `RefGraph.mk` rebuild for all vault folders.

---

## Integration Points with BC5 (LSP Protocol)

BC6 communicates with BC5 exclusively through the LSP wire protocol. There is no shared code, no imported types, no direct function calls.

| Direction | Mechanism | Examples |
|-----------|-----------|---------|
| Client → Server | Standard LSP requests/notifications | `initialize`, `textDocument/didOpen`, `textDocument/didChange`, `textDocument/completion`, `textDocument/definition` |
| Client → Server | Custom request | `flavorGrenade/documentMembership` |
| Client → Server | `workspace/executeCommand` | `flavorGrenade.rebuildIndex` |
| Server → Client | Standard LSP responses | Completion lists, definition locations, diagnostics |
| Server → Client | Custom notification | `flavorGrenade/status` |
| Server → Client | Standard notification | `textDocument/publishDiagnostics` |
| Server → Client | Command payload | `flavorGrenade.*` command identifiers and JSON payloads returned in LSP structures |

**Transport:** JSON-RPC 2.0 over stdio. `LanguageClient` spawns the resolved
server command as a child process and communicates via stdin/stdout pipes.

**Crash recovery:** `LanguageClient` uses its default error handler, which restarts the server up to 4 times within 3 minutes. No custom handler is needed.

**Config propagation:** Markdown flavor selector changes are sent through `workspace/didChangeConfiguration` and must not restart the LanguageClient. Other startup-only settings may still flow through `initializationOptions` when the implementation requires it.

---

## Invariants

1. **Server command must be resolved before LanguageClient starts.** `resolveServerCommand()` is called before `LanguageClient` construction. If the command cannot be resolved or started, `activate()` fails with a user-visible error and the extension writes diagnostic detail to the output channel.

2. **Status bar must reflect current server state (no stale display after restart).** When the client restarts (via `flavorGrenade.restartServer` or crash recovery), the `StatusBarWidget` resets to `initializing` state immediately. Subsequent `flavorGrenade/status` notifications drive it through the normal state progression.

3. **Client disposal handles server shutdown (no orphaned processes).** All disposables — `LanguageClient`, `StatusBarItem`, command registrations — are pushed to `context.subscriptions`. VS Code disposes these on extension deactivation, which triggers `client.stop()`, which sends LSP `shutdown` + `exit` to the server process. If the server does not exit cleanly, the child process is killed.

4. **Markdown language mode is stable.** `MarkdownFlavorController` must keep `.md` documents in VS Code's built-in `markdown` language mode and must not apply Markdown flavor behavior to user-selected non-Markdown language modes.

5. **Markdown flavor selector state is scoped.** Folder-backed overrides are written to workspace-folder or workspace settings; standalone-file overrides are written to user settings. The server owns effective flavor state after receiving the selector.

6. **LanguageClient document selector is Markdown-only for current flavor behavior.** `clientOptions.documentSelector` must include file-backed `markdown` documents and must not include `ofmarkdown`. Any `ofmarkdown` selector entry is historical E6/E12 behavior superseded by ADR020 and must fail current E15/E16 parity tests.

---

## VSIX Distribution Model

Each extension release produces one Marketplace VSIX. The package contains the
esbuild-bundled client JavaScript at `dist/extension.js` and the compiled
server JavaScript module at `server/main.js`.

Release gates verify the package shape before publish:

- `npm run compile` builds the client and server module.
- `npm test` covers resolver, status, command bridge, language-mode, and
  selector behavior.
- `npm run verify:marketplace-assets` checks Marketplace README assets and VSIX
  asset inclusion.
- `npm run verify:package-targets` rejects missing, duplicate, nested, or native
  executable server payloads.
- `npm run test:host` starts the extension in VS Code's extension host.
- The release workflow packages the VSIX, inspects it for `server/main.js`,
  generates checksums, attests provenance, and smoke-tests the bundled server
  module with Node.js.

This model keeps install-time behavior deterministic: no runtime download, no
PATH search, no environment-variable discovery, and no workspace-controlled
server command.

---

## Cross-References

- [[bounded-contexts]] — Context map and integration styles
- [[ubiquitous-language]] — Editor Client Terms section
- [[docs/ddd/lsp-protocol/domain-model]] — BC5 server-side counterpart
- [[docs/design/api-layer]] — Server capabilities and `flavorGrenade/status` notification
- [[docs/features/ofmarkdown-language-mode]] — Markdown flavor selection behavior
- [[docs/adr/ADR020-markdown-flavor-selection]] — Markdown flavor selector decision
- [[docs/superpowers/specs/2026-04-21-vscode-extension-design]] — Full extension design spec
