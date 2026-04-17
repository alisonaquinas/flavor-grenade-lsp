---
title: "BC4 — Vault & Workspace Domain Model"
tags:
  - ddd/domain-model
  - ddd/bc4
  - ddd/vault
  - architecture
aliases:
  - vault domain model
  - BC4 domain model
  - workspace domain model
---

# BC4 — Vault & Workspace Domain Model

This document is the authoritative domain model for **Bounded Context 4: Vault & Workspace**. BC4 is a Supporting subdomain that owns the top-level state of the server: which vaults are known, which documents are loaded, and how those documents are indexed for reference resolution.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[document-lifecycle/domain-model]], [[reference-resolution/domain-model]], [[config/domain-model]].

> [!NOTE]
> BC4 is the customer of BC2 (Document Lifecycle) and BC3 (Reference Resolution). It calls their published APIs but does not import their internals. BC5 (LSP Protocol) is the customer of BC4.

---

## Aggregate: VaultFolder

`VaultFolder` is the consistency boundary for a single detected vault. All document mutations within a vault — additions, removals, text changes — must pass through `VaultFolder` commands. After each mutation, the `RefGraph` is updated before the new `VaultFolder` is stored.

### State

```
VaultFolder
├── root:       VaultRoot               — identity; immutable after construction
├── docs:       Map<DocId, OFMDoc>       — all indexed documents
├── refGraph:   RefGraph                 — current reference graph for this vault
├── config:     FlavorConfig             — merged config for this vault
├── lookup:     FolderLookup             — stem/title/alias → DocId[] index
└── gitIgnore:  GitIgnore                — parsed .gitignore rules (may be empty)
```

### State Diagram

```
                    ┌─────────────────────────────────────────┐
                    │              VaultFolder                 │
                    │                                         │
  VaultDetected ──► │  root: VaultRoot  (identity, immutable) │
                    │                                         │
  DocumentAdded ──► │  docs: Map<DocId, OFMDoc>               │
 DocumentRemoved    │                                         │
 DocumentChanged    │  refGraph: RefGraph ◄── rebuilt/updated  │
                    │                         after each cmd  │
                    │  config: FlavorConfig                   │
                    │                                         │
                    │  lookup: FolderLookup                   │
                    │  gitIgnore: GitIgnore                   │
                    └─────────────────────────────────────────┘
```

### Invariants

| # | Invariant |
|---|-----------|
| I1 | `root` never changes after `VaultFolder` is constructed. A new vault root is a new `VaultFolder`. |
| I2 | Every `DocId` key in `docs` has its `path` relative to `root`. |
| I3 | `refGraph` is always consistent with the current `docs` contents. It is never partially updated — the full or incremental `RefGraph` command completes before the new `VaultFolder` is stored. |
| I4 | `lookup` mirrors `docs` exactly: every `OFMDoc` in `docs` has entries in `lookup`; removed docs have no entries. |
| I5 | Documents whose `VaultPath` matches a `gitIgnore` rule are never added to `docs`. |
| I6 | If a document is open in the editor (`doc.version !== null`), the version in `docs` reflects the editor state, not disk state. |

### Commands

All commands are pure functions returning a new `VaultFolder`. They do not perform I/O.

| Command | Signature | Description |
|---------|-----------|-------------|
| `VaultFolder.mk` | `(root: VaultRoot, config: FlavorConfig) → VaultFolder` | Construct an empty vault folder. No docs, empty ref graph. |
| `VaultFolder.withDoc` | `(folder: VaultFolder, doc: OFMDoc, oracle: Oracle) → VaultFolder` | Add or replace a document. Updates `lookup` and triggers `RefGraph.update`. Emits `DocumentAdded` or `DocumentChanged`. |
| `VaultFolder.withoutDoc` | `(folder: VaultFolder, id: DocId, oracle: Oracle) → VaultFolder` | Remove a document. Updates `lookup` and triggers `RefGraph.update`. Emits `DocumentRemoved`. |
| `VaultFolder.withConfig` | `(folder: VaultFolder, config: FlavorConfig) → VaultFolder` | Replace the merged config. Does not re-parse documents. |
| `VaultFolder.openDoc` | `(folder: VaultFolder, id: DocId, version: number) → VaultFolder` | Mark a document as editor-open. Sets `doc.version`. |
| `VaultFolder.closeDoc` | `(folder: VaultFolder, id: DocId) → VaultFolder` | Revert editor-open document to disk version (`doc.version = null`). |

---

## Aggregate: Workspace

`Workspace` is the top-level aggregate — one instance per server process. It owns all `VaultFolder` instances and mediates the `SingleFileMode` / multi-file lifecycle.

### State

```
Workspace
├── folders:    Map<VaultRoot, VaultFolder>  — all known vaults
├── singleFile: Map<string, OFMDoc>          — URI → OFMDoc (SingleFileMode docs)
└── userConfig: FlavorConfig                 — user-level config (cascade layer 2)
```

### State Diagram

```
          initialize
              │
              ▼
        ┌──────────┐
        │Workspace  │◄──── VaultDetected event
        │(empty)    │
        └─────┬─────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
VaultFolder          SingleFile
(multi-file)         (no vault)
    │                    │
    │  VaultDetected     │
    │  encloses singleFile doc
    │                    │
    └────────────────────┘
         │
         ▼
  SingleFile EVICTED
  doc absorbed into VaultFolder
```

### Invariants

| # | Invariant |
|---|-----------|
| I1 | There is exactly one `Workspace` per server process. It is constructed during `initialize` and lives until server shutdown. |
| I2 | A URI is tracked in at most one of `folders` or `singleFile` at any time — never both. |
| I3 | When a `VaultFolder` is added whose `root` encloses a URI in `singleFile`, the single-file entry is evicted (removed from `singleFile`) and the document is added to the new `VaultFolder` via `VaultFolder.withDoc`. |
| I4 | `VaultFolder` roots are disjoint — no vault root is a subdirectory of another vault root. If a nested vault is detected, the outer vault takes precedence. |
| I5 | `userConfig` is loaded once at startup and refreshed on `flavorGrenade/reloadConfig` notification. |

### Commands

| Command | Signature | Description |
|---------|-----------|-------------|
| `Workspace.withFolder` | `(ws: Workspace, folder: VaultFolder) → Workspace` | Add or replace a `VaultFolder`. Triggers SingleFileMode eviction if applicable. Emits `VaultDetected`. |
| `Workspace.withoutFolder` | `(ws: Workspace, root: VaultRoot) → Workspace` | Remove a `VaultFolder` (e.g., vault directory deleted). |
| `Workspace.withSingleFile` | `(ws: Workspace, doc: OFMDoc) → Workspace` | Track a document in `SingleFileMode`. No-op if a vault already encloses the URI. |
| `Workspace.withoutSingleFile` | `(ws: Workspace, uri: string) → Workspace` | Remove a single-file entry (e.g., document closed). |
| `Workspace.updateDoc` | `(ws: Workspace, id: DocId, doc: OFMDoc) → Workspace` | Route a document update to the correct `VaultFolder` (or single-file slot). |

---

## Value Objects

### VaultPath

```
VaultPath (branded string)
├── Relative to a VaultRoot
├── Forward slashes only
├── No leading slash
└── Example: "notes/2024-04-16-standup.md"
```

- Constructed via `vaultPath(absPath, root)` from BC1.
- Two `VaultPath` values are equal iff their strings are equal (case-sensitive on Linux/Mac, case-normalised on Windows).
- Never stored without its accompanying `VaultRoot`.

### VaultRoot

```
VaultRoot (branded string)
├── Absolute filesystem path
├── No trailing separator
└── Example: "/home/user/notes"
```

- Constructed by `VaultDetector` when it confirms a vault directory.
- Immutable — if the vault root moves, it's a new `VaultRoot` and a new `VaultFolder`.

### DocId

```
DocId
├── uri:  string      — file:// URI (LSP-compatible)
└── path: VaultPath   — vault-relative path
```

- Constructed by BC1 `docId(uri, root)`.
- Identity comparison uses `path` only (see BC1 invariants).
- The `uri` field is kept for round-trip compatibility with LSP `TextDocumentIdentifier`.

---

## Domain Services

### VaultDetector

The `VaultDetector` service determines whether a given directory is a vault and what kind.

```
VaultDetector.detect(dir: AbsPath, config: FlavorConfig): VaultDetectionResult

VaultDetectionResult
  | { kind: 'obsidian'; root: VaultRoot }    — .obsidian/ found
  | { kind: 'toml'; root: VaultRoot }        — .flavor-grenade.toml found
  | { kind: 'none' }                          — neither found → SingleFileMode
```

**Detection algorithm:**

```
1. Check for {dir}/.obsidian/ directory
   → if found AND config.core.vault_detection ∈ ['obsidian', 'both']: return obsidian
2. Check for {dir}/.flavor-grenade.toml file
   → if found AND config.core.vault_detection ∈ ['toml-only', 'both']: return toml
3. Walk up to parent directory (repeat until filesystem root)
4. If no match found: return none (SingleFileMode)
```

> [!NOTE]
> The `vault_detection` config key controls which detection signals are respected. Default is `"obsidian"` — only `.obsidian/` triggers vault mode. Set to `"both"` in non-Obsidian editors that use `.flavor-grenade.toml`.

### FileWatcher

The `FileWatcher` service wraps OS filesystem events and normalises them into domain events.

```
FileWatcher.watch(root: VaultRoot, gitIgnore: GitIgnore): AsyncIterable<FileEvent>

FileEvent
  | { kind: 'created'; path: AbsPath }
  | { kind: 'changed'; path: AbsPath }
  | { kind: 'deleted'; path: AbsPath }
```

**Behaviour:**

- Monitors `**/*.md` within `root` (glob filter applied before event emission).
- Events matching `gitIgnore` rules are suppressed.
- Debounces rapid file-save events with a 50 ms window.
- On Linux: uses `inotify` via Bun's `fs.watch` with `recursive: true`.
- On macOS: uses FSEvents.
- On Windows: uses ReadDirectoryChangesW.
- A single `FileWatcher` instance is shared per `VaultFolder` — disposed when the folder is removed from `Workspace`.

> [!TIP]
> `FileWatcher` is the only place in BC4 that performs raw I/O. Everything else is pure. When testing BC4 logic, inject a fake `FileWatcher` that yields a predetermined sequence of events.

---

## Domain Events

| Event | Payload | Emitted By |
|-------|---------|-----------|
| `VaultDetected` | `{ root: VaultRoot; kind: 'obsidian' \| 'toml' }` | `Workspace.withFolder` |
| `DocumentAdded` | `{ folderId: VaultRoot; id: DocId; version: number \| null }` | `VaultFolder.withDoc` (new doc) |
| `DocumentChanged` | `{ folderId: VaultRoot; id: DocId; oldVersion: number \| null; newVersion: number \| null }` | `VaultFolder.withDoc` (existing doc) |
| `DocumentRemoved` | `{ folderId: VaultRoot; id: DocId }` | `VaultFolder.withoutDoc` |
| `SingleFileModeEntered` | `{ uri: string }` | `Workspace.withSingleFile` |
| `SingleFileModeEvicted` | `{ uri: string; absorbedInto: VaultRoot }` | `Workspace.withFolder` (enclosure detected) |

---

## Interaction with Other BCs

```
BC5 LspServer
     │
     │  textDocument/didOpen
     │  textDocument/didChange
     │  textDocument/didClose
     ▼
BC4 WorkspaceService  ──── calls ────►  BC2 OFMDocFactory
     │                                  (construct / update OFMDoc)
     │
     │  VaultFolder.withDoc(doc, oracle)
     ▼
BC3 RefGraph.update(oracle, symDiff)
     │
     │  oracle calls back into BC4
     │  VaultIndex / FolderLookup
     ▼
  resolution complete; new VaultFolder stored
```

> [!NOTE]
> BC4 implements the `Oracle` interface (defined in BC3) using its `FolderLookup`. This is the seam where the anti-corruption layer lives: `OracleAdapterService` in NestJS translates `FolderLookup` queries into `Scope[]` / `Def[]` answers that BC3 understands, without BC3 ever seeing `VaultIndex` or `FolderLookup` types.
