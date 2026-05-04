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

This document is the authoritative domain model for **Bounded Context 6: Editor Client**. BC6 is a Generic Support subdomain. It contains no language intelligence or domain logic of its own — it is a thin wrapper that resolves the server binary, manages the `LanguageClient` lifecycle, wires up a status bar widget and Command Palette commands, and maps server vault/index membership to VS Code's `ofmarkdown` language mode. All Obsidian Flavored Markdown intelligence lives in the server (BC2–BC5).

See also: [[bounded-contexts]], [[ubiquitous-language]], [[ddd/lsp-protocol/domain-model]], [[design/api-layer]], [[superpowers/specs/2026-04-21-vscode-extension-design]].

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
| Custom extensions sent | `flavorGrenade.rebuildIndex` via `workspace/executeCommand` |
| Transport | JSON-RPC 2.0 over stdio (spawned child process) |
| Package | Separate npm package in `extension/` directory, not part of the NestJS server |
| Language | TypeScript, `vscode-languageclient@9.x`, VS Code Extension API |

---

## Aggregate: ExtensionClient

`ExtensionClient` is the main orchestrator in `extension.ts`. It is the single aggregate in BC6. Its responsibilities are:

1. Resolve the server binary path via `BinaryResolver`.
2. Construct and start a `LanguageClient` with `Executable` server options (stdio transport).
3. Wire the `StatusBarWidget` to listen for `flavorGrenade/status` notifications.
4. Register Command Palette commands (`restartServer`, `rebuildIndex`, `showOutput`).
5. Register `LanguageModeController` so qualifying Markdown documents are promoted to `OFMarkdownLanguageMode`.
6. Push all disposables to `context.subscriptions` for automatic cleanup.

### Lifecycle

```text
VS Code activates extension (onLanguage:markdown or onLanguage:ofmarkdown)
  │
  ▼
activate(context: ExtensionContext)
  │
  ├─ BinaryResolver.resolveServerPath(context)
  │    → user setting flavorGrenade.server.path (if set)
  │    → bundled server/flavor-grenade-lsp[.exe] (default)
  │    → ERROR if binary not found at resolved path
  │
  ├─ Create LanguageClient
  │    serverOptions: { run: { command: serverPath }, debug: { command: serverPath } }
  │    clientOptions: {
  │      documentSelector: [
  │        { scheme: 'file', language: 'markdown' },
  │        { scheme: 'file', language: 'ofmarkdown' }
  │      ]
  │    }
  │
  ├─ client.start()
  │    → spawns server binary as child process
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
  ├─ Register LanguageModeController
  │    early check: ancestor .obsidian/ exists
  │    server check: flavorGrenade/documentMembership
  │    assignment: markdown → ofmarkdown with URI in-flight guard
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

### BinaryResolver

A pure function (`resolveServerPath`) that implements the 2-tier resolution strategy for locating the server binary.

```typescript
function resolveServerPath(context: ExtensionContext): string
```

**Resolution order:**

1. **User setting** — `flavorGrenade.server.path` from VS Code configuration. Escape hatch for developers building the server from source.
2. **Bundled binary** — `server/flavor-grenade-lsp[.exe]` relative to `context.extensionUri`. Default for all normal users. Platform-specific VSIXs guarantee this binary is present.

**No PATH fallback. No environment variable. No download.** The platform-specific VSIX distribution model ensures the binary is always bundled.

**Error handling:** If the resolved path does not point to an existing file, activation fails with a user-visible error message.

### StatusBarWidget

A VS Code `StatusBarItem` that reflects the server's current indexing state. Driven entirely by `flavorGrenade/status` notifications from the server.

**State transitions:**

| Server State | Status Bar Display | Icon |
|-------------|-------------------|------|
| `initializing` | `FG: Starting...` | `$(loading~spin)` |
| `indexing` | `FG: Indexing... (N docs)` | `$(loading~spin)` |
| `ready` | `FG: N docs` | `$(check)` |
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

### LanguageModeController

The VS Code component that owns dynamic language id assignment. It watches visible editors, opened documents, active editor changes, workspace folder changes, and server readiness. It is the only BC6 component allowed to call VS Code's language assignment API.

**Promotion rule:** a file-backed `markdown` document becomes `ofmarkdown` when either:

1. A `.obsidian/` directory is found in one of its ancestor directories.
2. The server returns `isOfMarkdown: true` from `flavorGrenade/documentMembership`.

**Safety rules:**

- Never change a document whose language id is neither `markdown` nor `ofmarkdown`.
- Track in-flight assignments by URI because VS Code reopens the document after `setTextDocumentLanguage`.
- Do not restart the LanguageClient because of a language id transition.
- Keep the LanguageClient `documentSelector` registered for both `markdown` and `ofmarkdown`.

### OFMarkdownLanguageMode

The VS Code language id `ofmarkdown`, displayed as **OFMarkdown**. It is contributed by the extension manifest without an `.md` extension binding. Assignment is dynamic and document-specific.

`OFMarkdownLanguageMode` is not a new server parser mode. The server already parses OFM; the language id exists so VS Code users can target settings, keybindings, snippets, and future grammar/theme contributions at recognized vault documents.

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

Custom request sent by `LanguageModeController` when client-side `.obsidian/` detection is insufficient or when the server reports readiness after indexing.

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

The server-side answer is authoritative for `.flavor-grenade.toml` vaults and any document already present in the index.

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

**Transport:** JSON-RPC 2.0 over stdio. `LanguageClient` spawns the server binary as a child process and communicates via stdin/stdout pipes.

**Crash recovery:** `LanguageClient` uses its default error handler, which restarts the server up to 4 times within 3 minutes. No custom handler is needed.

**Config propagation:** User settings (`linkStyle`, `completion.candidates`, `diagnostics.suppress`) are passed to the server via `initializationOptions` at startup. Changes to these settings trigger a client restart, which re-sends `initializationOptions` with updated values.

---

## Invariants

1. **Binary must exist at resolved path before LanguageClient starts.** `resolveServerPath()` is called before `LanguageClient` construction. If the binary is not found, `activate()` fails with a user-visible error and the extension does not start. This prevents confusing ENOENT errors from the language client.

2. **Status bar must reflect current server state (no stale display after restart).** When the client restarts (via `flavorGrenade.restartServer` or crash recovery), the `StatusBarWidget` resets to `initializing` state immediately. Subsequent `flavorGrenade/status` notifications drive it through the normal state progression.

3. **Client disposal handles server shutdown (no orphaned processes).** All disposables — `LanguageClient`, `StatusBarItem`, command registrations — are pushed to `context.subscriptions`. VS Code disposes these on extension deactivation, which triggers `client.stop()`, which sends LSP `shutdown` + `exit` to the server process. If the server does not exit cleanly, the child process is killed.

4. **Language mode assignment is precise and loop-safe.** `LanguageModeController` may promote `markdown` to `ofmarkdown` only for file documents with a positive vault/index membership signal. It must not override user-selected non-Markdown modes and must not repeatedly assign the same URI after VS Code reopens the document.

---

## PlatformVSIX — Distribution Model

Each release produces 7 platform-specific `.vsix` packages. Each VSIX contains the same esbuild-bundled client JS (`dist/extension.js`, ~50KB) and one Bun-compiled server binary for the target platform.

| VS Code Target | Bun `--target` | Binary Name |
|---------------|---------------|-------------|
| `linux-x64` | `bun-linux-x64` | `flavor-grenade-lsp` |
| `linux-arm64` | `bun-linux-arm64` | `flavor-grenade-lsp` |
| `alpine-x64` | `bun-linux-x64-musl` | `flavor-grenade-lsp` |
| `darwin-x64` | `bun-darwin-x64` | `flavor-grenade-lsp` |
| `darwin-arm64` | `bun-darwin-arm64` | `flavor-grenade-lsp` |
| `win32-x64` | `bun-windows-x64` | `flavor-grenade-lsp.exe` |
| `win32-arm64` | `bun-windows-arm64` | `flavor-grenade-lsp.exe` |

All cross-compiled on `ubuntu-latest` in CI. The platform-specific VSIX model guarantees that the binary is always present — no runtime download, no PATH resolution, no environment variable lookup.

---

## Cross-References

- [[bounded-contexts]] — Context map and integration styles
- [[ubiquitous-language]] — Editor Client Terms section
- [[ddd/lsp-protocol/domain-model]] — BC5 server-side counterpart
- [[design/api-layer]] — Server capabilities and `flavorGrenade/status` notification
- [[features/ofmarkdown-language-mode]] — Dynamic VS Code language mode behavior
- [[adr/ADR016-ofmarkdown-language-mode]] — OFMarkdown language mode decision
- [[superpowers/specs/2026-04-21-vscode-extension-design]] — Full extension design spec
