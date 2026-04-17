---
title: "BC5 — LSP Protocol Domain Model"
tags:
  - ddd/domain-model
  - ddd/bc5
  - ddd/lsp-protocol
  - architecture
aliases:
  - LSP protocol domain model
  - BC5 domain model
  - LspServer model
---

# BC5 — LSP Protocol Domain Model

This document is the authoritative domain model for **Bounded Context 5: LSP Protocol**. BC5 is a Generic subdomain. It does not contain original business logic — it is a conformist adapter to the Language Server Protocol 3.17 specification. Its primary artefact is `LspServer`, an application service that maps JSON-RPC method calls to BC4 workspace mutations and BC3 query services.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[vault/domain-model]], [[reference-resolution/domain-model]], [[document-lifecycle/domain-model]].

> [!NOTE]
> BC5 is a **Conformist** to the LSP 3.17 specification. Do not invent protocol deviations. Custom extensions are scoped to the `flavorGrenade/` namespace. Everything else must conform to the spec verbatim.

---

## Subdomain Classification

| Attribute | Value |
|-----------|-------|
| Type | Generic subdomain |
| Integration pattern | Conformist (to LSP 3.17 spec) + Open Host Service (to editor clients) |
| Primary artefact | `LspServer` application service |
| Custom extensions | `flavorGrenade/status` notification only |
| Transport | JSON-RPC 2.0 over stdio |

---

## Key Types

### LspRequest

A parsed, typed JSON-RPC 2.0 request object. Constructed from raw stdio bytes by the `JsonRpcHandler`.

```typescript
interface LspRequest<P = unknown> {
  jsonrpc: '2.0'
  id:      number | string
  method:  string
  params:  P
}
```

### LspResponse

A typed JSON-RPC 2.0 response. Either carries a result or an error — never both.

```typescript
interface LspResponse<R = unknown> {
  jsonrpc: '2.0'
  id:      number | string
  result?: R
  error?:  { code: number; message: string; data?: unknown }
}
```

**Standard LSP error codes used:**

| Code | Name | When |
|------|------|------|
| `-32700` | ParseError | Malformed JSON received |
| `-32600` | InvalidRequest | Valid JSON but not a valid request |
| `-32601` | MethodNotFound | Unrecognised method |
| `-32602` | InvalidParams | Params failed schema validation |
| `-32603` | InternalError | Unhandled exception in server logic |
| `-32099` | ServerNotInitialized | Request received before `initialize` completes |

### LspNotification

A JSON-RPC 2.0 notification — no `id`, no response expected.

```typescript
interface LspNotification<P = unknown> {
  jsonrpc: '2.0'
  method:  string
  params:  P
}
```

### Capability

A server capability declared in the `InitializeResult`. The `LspServer` builds this object during capability negotiation.

```typescript
interface ServerCapabilities {
  textDocumentSync:    TextDocumentSyncOptions
  completionProvider:  CompletionOptions
  definitionProvider:  boolean
  referencesProvider:  boolean
  diagnosticProvider:  DiagnosticOptions
  codeActionProvider:  CodeActionOptions
  renameProvider:      boolean
  workspaceSymbolProvider: boolean
}
```

---

## LspServer — Application Service Facade

`LspServer` is the single entry point for all JSON-RPC traffic. It is an **application service**, not a domain object — it contains no business logic of its own. Its responsibilities are:

1. Validate incoming request shapes.
2. Route to the correct BC4 or BC3 application service.
3. Await the result.
4. Format and emit the JSON-RPC response.

### Lifecycle

```
stdio
  │
  ▼
JsonRpcHandler
  │  parse bytes → LspRequest | LspNotification
  ▼
LspServer.dispatch(msg)
  │
  ├── 'initialize'            → LspServer.handleInitialize
  ├── 'initialized'           → no-op (capabilities already sent)
  ├── 'shutdown'              → LspServer.handleShutdown
  ├── 'exit'                  → process.exit(0)
  ├── 'textDocument/*'        → LspServer.handleTextDocument*
  ├── 'workspace/*'           → LspServer.handleWorkspace*
  └── '$/' prefix             → LspServer.handleMeta*
```

---

## Method-to-Command Mapping

### `initialize`

```
LspRequest<InitializeParams>
  │
  ├─ Read clientCapabilities
  ├─ Read workspaceFolders (if provided)
  ├─ Load user config via ConfigCascadeService
  ├─ For each workspaceFolder:
  │    VaultDetector.detect(folder.uri)
  │    → VaultDetected? → Workspace.withFolder(new VaultFolder)
  │    → None?          → ready for SingleFileMode
  ├─ Build ServerCapabilities from FlavorConfig
  │    text_sync = 'full'        → TextDocumentSyncKind.Full
  │    text_sync = 'incremental' → TextDocumentSyncKind.Incremental
  └─ Send InitializeResult { capabilities, serverInfo }
```

**Completion trigger characters:** `[`, `#`, `(`

**File watching glob registered with client:** `**/*.md`

**Advertised capabilities (always on):**

| Capability | Notes |
|-----------|-------|
| `textDocumentSync` | Full or Incremental (from config) |
| `completionProvider` | Trigger chars: `[`, `#`, `(` |
| `definitionProvider` | `true` |
| `referencesProvider` | `true` |
| `diagnosticProvider` | Pull-model (`identifier: 'flavor-grenade'`) |
| `codeActionProvider` | Kinds: `quickfix`, `source` |
| `renameProvider` | `true` (renames propagate across vault) |
| `workspaceSymbolProvider` | `true` |

---

### `textDocument/didOpen`

```
LspNotification<DidOpenTextDocumentParams>
  │
  ├─ Extract TextDocumentItem { uri, languageId, version, text }
  ├─ OFMDocFactory.fromLsp(item) → OFMDoc
  ├─ Workspace.updateDoc(ws, docId, doc) → new Workspace
  │    → routes to VaultFolder.withDoc (if vault found)
  │    → or Workspace.withSingleFile (if no vault)
  └─ Emit flavorGrenade/status (async, non-blocking)
```

---

### `textDocument/didChange`

```
LspNotification<DidChangeTextDocumentParams>
  │
  ├─ Extract { textDocument: { uri, version }, contentChanges }
  ├─ Lookup existing OFMDoc via Workspace
  ├─ OFMDoc.applyLspChange(doc, params) → updatedDoc
  │    full sync:        replace entire text, re-parse
  │    incremental sync: apply range edits, re-parse
  ├─ Workspace.updateDoc(ws, docId, updatedDoc) → new Workspace
  │    → VaultFolder.withDoc triggers RefGraph.update
  └─ Emit flavorGrenade/status (async, non-blocking)
```

> [!NOTE]
> For incremental sync, `OFMDoc.applyLspChange` applies all `contentChanges` in order. LSP specifies that incremental changes are applied sequentially and ranges refer to the document state *before* this change set, so each change must be applied in a fresh position context. The implementation uses tree-sitter's incremental re-parse for performance.

---

### `textDocument/didClose`

```
LspNotification<DidCloseTextDocumentParams>
  │
  ├─ Lookup VaultFolder containing the URI
  ├─ VaultFolder.closeDoc(folder, docId) → folder with doc.version = null
  │    (reverts to disk-state OFMDoc; re-reads from disk asynchronously)
  └─ If SingleFileMode: Workspace.withoutSingleFile(ws, uri)
```

---

### `textDocument/completion`

```
LspRequest<CompletionParams>
  │
  ├─ Extract { textDocument.uri, position, context }
  ├─ Resolve OFMDoc from Workspace
  ├─ Determine trigger:
  │    context.triggerCharacter = '['  → wikilink completion
  │    context.triggerCharacter = '#'  → heading / tag completion
  │    context.triggerCharacter = '('  → block anchor completion
  ├─ CompletionService.provide(doc, position, trigger, vaultFolder)
  │    → returns CompletionItem[] (max = FlavorConfig.completion.candidates)
  └─ Send CompletionList { isIncomplete, items }
```

**Completion item kinds generated:**

| Trigger | Item kind | Source |
|---------|-----------|--------|
| `[[` | `File` | VaultFolder document titles / stems |
| `[[#` | `Reference` | Current doc headings |
| `[[target#` | `Reference` | Target doc headings (cross-doc) |
| `[[#^` | `Value` | Current doc block anchors |
| `#` | `Keyword` | Tag registry across vault |
| `(` after block ref | `Value` | Block anchor ids |

---

### `textDocument/definition`

```
LspRequest<DefinitionParams>
  │
  ├─ Extract { textDocument.uri, position }
  ├─ Resolve OFMDoc and VaultFolder
  ├─ ReferenceService.findDef(doc, position, refGraph)
  │    → Ref at cursor → Dest { doc: DocId, def: Def }
  ├─ Convert Dest to LSP Location { uri, range }
  └─ Send Location | Location[] | null
```

---

### `textDocument/references`

```
LspRequest<ReferenceParams>
  │
  ├─ Extract { textDocument.uri, position, context.includeDeclaration }
  ├─ ReferenceService.findBacklinks(doc, position, refGraph)
  │    → Def at cursor → all Ref[] pointing to this Def
  └─ Send Location[]
```

---

### `textDocument/diagnostic` (pull model)

```
LspRequest<DocumentDiagnosticParams>
  │
  ├─ Resolve OFMDoc and VaultFolder
  ├─ DiagnosticService.compute(doc, refGraph, config)
  │    Checks enabled by FlavorConfig.diagnostics:
  │      block_ref.enabled → broken BlockRef → error
  │      embed.enabled     → broken EmbedRef → warning
  │      (wikilinks: always on)
  └─ Send DocumentDiagnosticReport { kind: 'full', items: Diagnostic[] }
```

---

### `workspace/didChangeWatchedFiles`

```
LspNotification<DidChangeWatchedFilesParams>
  │
  ├─ For each FileEvent in changes:
  │    created: OFMDocFactory.tryLoad(path) → Workspace.updateDoc
  │    changed: OFMDocFactory.tryLoad(path) → Workspace.updateDoc (if not editor-open)
  │    deleted: Workspace.updateDoc with removal
  └─ Push diagnostic refresh notifications if diagnosticProvider pull is not supported
```

> [!NOTE]
> Client-side file watching (via `workspace/didChangeWatchedFiles`) supplements the server-side `FileWatcher`. The server's `FileWatcher` is authoritative for vaults opened via `initialize` workspace folders. Client notifications handle editors that do not emit `didSave` for files changed outside the editor.

---

## Custom Notification: `flavorGrenade/status`

The only server-to-client extension notification. Uses the `flavorGrenade/` namespace to avoid collisions with the LSP spec.

**Direction:** Server → Client (push)

**When emitted:**
- After every `didOpen` / `didChange` / `didClose`
- After vault detection events
- After config reload

**Payload:**

```typescript
interface FlavorGrenadeStatusParams {
  vaults: Array<{
    root:      string          // VaultRoot as string
    docCount:  number          // total indexed documents
    state:     'ready' | 'indexing' | 'error'
  }>
  singleFileUris: string[]     // URIs tracked in SingleFileMode
  serverVersion:  string       // semver
}
```

**Client handling:** Purely informational. Editors may display doc counts in a status bar. No required action.

---

## Text Sync Modes

| Mode | Config value | Behaviour |
|------|-------------|-----------|
| **Full** | `text_sync = "full"` | Each `didChange` carries the entire document text. Simpler. Used by default. |
| **Incremental** | `text_sync = "incremental"` | Each `didChange` carries `TextDocumentContentChangeEvent[]` with ranges. More efficient for large files. Requires tree-sitter incremental re-parse. |

> [!TIP]
> Start with Full sync during development. Switch to Incremental only after the parse pipeline is stable and benchmarked. Incremental sync bugs are harder to debug because the editor and server can silently diverge.

---

## File Watching Glob

The glob registered with the client during `initialize`:

```json
{
  "globPattern": "**/*.md"
}
```

This covers all Markdown files in the workspace. The `core.markdown.file_extensions` config key may extend this to include `.mdx`, `.markdown`, etc. in a future version.

---

## Sequencing Guarantee

BC5 does not respond to an LSP request until all BC4 mutations triggered by that request have completed. This means:

1. `didChange` handling awaits `VaultFolder.withDoc` (which includes `RefGraph.update`).
2. Subsequent `completion` or `definition` requests see a fully consistent state.

This guarantee is maintained by the `WorkspaceService` in BC4, which holds a lock (or uses a serialised update queue via Bun's single-threaded event loop) over the `Workspace` value during mutations.

> [!NOTE]
> Because Bun uses a single-threaded event loop, and all domain commands are synchronous pure functions, there is no shared-mutable-state concurrency problem for in-memory state. The sequencing guarantee is automatically satisfied as long as async I/O (disk reads) is awaited before the domain command is called, and responses are sent only after the command completes.
