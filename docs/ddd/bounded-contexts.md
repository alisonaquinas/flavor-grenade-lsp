---
title: "Bounded Contexts — flavor-grenade-lsp"
tags:
  - ddd/bounded-contexts
  - ddd/context-map
  - architecture
aliases:
  - context map
  - BC overview
---

# Bounded Contexts — flavor-grenade-lsp

This document is the canonical context map for `flavor-grenade-lsp`. It describes the five bounded contexts (BCs), their ownership, integration styles, and public interfaces. Read this before touching any module boundary.

See also: [[ubiquitous-language]], [[vault/domain-model]], [[lsp-protocol/domain-model]], [[reference-resolution/domain-model]], [[document-lifecycle/domain-model]], [[config/domain-model]].

---

## Context Map Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        flavor-grenade-lsp  —  Context Map                        │
└──────────────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────┐   Shared Kernel    ┌────────────────────────────────────┐
  │  BC1               │◄───────────────────►│  BC2                               │
  │  Path & Identity   │                     │  Document Lifecycle                │
  │  (Generic Support) │◄───────────────────►│  (Supporting Subdomain)            │
  └────────────────────┘   Shared Kernel    └──────────────┬─────────────────────┘
           ▲                                               │
           │ Shared Kernel                                 │ Customer-Supplier
           │ (pure value types                             │ (BC4 consumes OFMDoc
           │  flow into all BCs)                           │  events & commands)
           │                                               ▼
  ┌────────┴───────────┐                    ┌────────────────────────────────────┐
  │  BC1               │   Shared Kernel    │  BC4                               │
  │  Path & Identity   │◄───────────────────►│  Vault & Workspace                 │
  │                    │                     │  (Supporting Subdomain)            │
  └────────────────────┘                    └──────────────┬─────────────────────┘
           ▲                                               │
           │ Shared Kernel                                 │ Customer-Supplier
           │                                               │ (BC4 owns RefGraph,
           │                                               │  delegates to BC3)
           │                                               ▼
  ┌────────┴───────────┐   ACL              ┌────────────────────────────────────┐
  │  BC1               │◄──────────────────►│  BC3                               │
  │  Path & Identity   │                     │  Reference Resolution              │
  │                    │   Oracle pattern    │  (Core Subdomain ★)                │
  └────────────────────┘   isolates BC3     └──────────────▲─────────────────────┘
                           from BC4 names                  │
                                                           │ ACL  (Oracle wraps
                                            ┌──────────────┴─────┐  VaultIndex)
                                            │  BC5               │
                                            │  LSP Protocol      │
                                            │  (Generic)         │
                                            │                    │
                                            │  Conformist to     │
                                            │  LSP 3.17 spec     │
                                            └────────────────────┘
                                               │        ▲
                                     Open Host │        │ Conformist
                                     Service   │        │ (BC5 maps
                                               ▼        │  JSON-RPC →
                                          JSON-RPC       │  BC4 mutations)
                                          over stdio     │
                                          (LSP wire)     │
                                       ◄─────────────────┘
                                         editor / client
```

**Legend**

| Symbol | Meaning |
|--------|---------|
| `★` | Core subdomain — primary differentiator |
| `◄───►` | Shared Kernel — types flow both ways with no translation |
| `───►` | Upstream (supplier) → downstream (customer) |
| `ACL` | Anti-Corruption Layer — translation at the boundary |
| `OHS` | Open Host Service — published protocol, many consumers |

---

## Integration Styles Table

| Upstream BC | Downstream BC | Style | Notes |
|-------------|--------------|-------|-------|
| BC1 Path & Identity | BC2 Document Lifecycle | Shared Kernel | `DocId`, `VaultPath`, `VaultRoot` are pure value types imported directly. No translation needed. |
| BC1 Path & Identity | BC3 Reference Resolution | Shared Kernel | `DocId`, `VaultPath` flow into ref/def value objects without wrapping. |
| BC1 Path & Identity | BC4 Vault & Workspace | Shared Kernel | `VaultRoot`, `VaultPath` are the identity types for both aggregates. |
| BC1 Path & Identity | BC5 LSP Protocol | Shared Kernel | URI ↔ `DocId` conversion lives in BC1 and is called by BC5 directly. |
| BC2 Document Lifecycle | BC4 Vault & Workspace | Customer-Supplier | BC4 is the customer. BC2 publishes `OFMDoc` and commands; BC4 stores docs in `VaultFolder` and calls `OFMDoc.applyLspChange`. |
| BC3 Reference Resolution | BC4 Vault & Workspace | Customer-Supplier + ACL | BC4 owns `RefGraph`. `Oracle` is the ACL: it bridges `VaultIndex` (BC4's name) to `Scope`/`Def` (BC3's language) without leaking BC4 types into BC3. |
| BC4 Vault & Workspace | BC5 LSP Protocol | Customer-Supplier | BC5 is the customer. `LspServer` calls BC4 workspace mutations. BC4 never imports BC5 types. |
| LSP 3.17 spec | BC5 LSP Protocol | Conformist | BC5 conforms entirely to the external LSP specification. No deviation, no translation. |
| BC5 LSP Protocol | editor client | Open Host Service | JSON-RPC over stdio — the published protocol. Any LSP-compliant editor can connect. |

---

## BC1 — Path & Identity

**Subdomain type:** Generic Support  
**NestJS module:** `PathModule` (re-exported from every other module; zero dependencies of its own)

### Language

Pure TypeScript branded types and value-object functions. No classes, no state, no I/O.

### Owns

| Type | Description |
|------|-------------|
| `VaultPath` | Vault-relative path string, e.g. `notes/2024/foo.md` |
| `DocId` | Stable document identity: `{ uri: string; path: VaultPath }` |
| `VaultRoot` | Absolute filesystem path to a vault's root directory |
| `AbsPath` | Absolute filesystem path (opaque string brand) |
| `RelPath` | Relative path string (opaque string brand) |
| `Slug` | URL-safe slug derived from a file stem |
| `WikiEncoded` | A wikilink-encoded string (spaces → underscores per Obsidian rules) |

### Does Not Know About

BC2, BC3, BC4, BC5. All dependencies flow inward toward BC1.

### Public Interface

```typescript
// Construction
function docId(uri: string, root: VaultRoot): DocId
function vaultPath(absPath: AbsPath, root: VaultRoot): VaultPath
function toAbsPath(vp: VaultPath, root: VaultRoot): AbsPath
function toUri(vp: VaultPath, root: VaultRoot): string
function fromUri(uri: string, root: VaultRoot): VaultPath | null

// Slug / wikilink encoding
function slugify(stem: string): Slug
function wikiEncode(s: string): WikiEncoded
function wikiDecode(s: WikiEncoded): string

// Comparators
function sameDoc(a: DocId, b: DocId): boolean
```

### Key Invariants

1. A `VaultPath` is always relative to its `VaultRoot` — never absolute.
2. Two `DocId` values are equal iff their `VaultPath` strings are equal (case-sensitive on Linux, normalised on macOS/Windows).
3. `WikiEncoded` round-trips: `wikiDecode(wikiEncode(s)) === s` for all valid inputs.

---

## BC2 — Document Lifecycle

**Subdomain type:** Supporting  
**NestJS module:** `DocumentModule`

### Language

`OFMDoc`, `OFMIndex`, `ParsePipeline`, CST/AST node types, lifecycle events.

### Owns

| Type | Description |
|------|-------------|
| `OFMDoc` | Aggregate root — identity `DocId`, contains text, structure, index, version |
| `OFMIndex` | Derived projection of typed element collections |
| `ParsePipeline` | Ordered chain of parser stages producing CST → AST → index |
| `Structure` | `{ cst: CST; ast: AST }` — output of the parse pipeline |
| `CST` | Concrete syntax tree (tree-sitter output) |
| `AST` | Cleaned, typed AST with OFM extensions resolved |

### Does Not Know About

BC3 (`RefGraph`, `Oracle`), BC4 (`VaultIndex`, `Workspace`), BC5 (LSP wire types). BC2 exports `OFMDoc` for consumption; it does not consume events from other BCs.

### Public Interface

**Commands (pure functions on `OFMDoc`):**

| Command | Signature | Description |
|---------|-----------|-------------|
| `mk` | `(id: DocId, text: string) → OFMDoc` | Construct from raw text (disk load) |
| `fromLsp` | `(item: TextDocumentItem) → OFMDoc` | Construct from LSP open notification |
| `tryLoad` | `(path: AbsPath) → Promise<OFMDoc \| null>` | Async disk read with parse |
| `withText` | `(doc: OFMDoc, text: string) → OFMDoc` | Full text replacement; re-parses |
| `applyLspChange` | `(doc: OFMDoc, params: DidChangeParams) → OFMDoc` | Apply incremental or full LSP change |

**Domain Events:**

| Event | Payload |
|-------|---------|
| `DocumentTextChanged` | `{ id: DocId; oldVersion: number \| null; newVersion: number }` |
| `DocumentOpened` | `{ id: DocId; version: number; source: 'lsp' \| 'disk' }` |
| `DocumentClosed` | `{ id: DocId }` — editor closed, revert to disk version |

### Key Invariants

1. `(text, structure, index)` is never partially stale. A text change atomically replaces all three.
2. `doc.version === null` means the document reflects disk state (not editor-open).
3. `doc.version === n` means the document reflects the n-th LSP version (monotonically increasing).

---

## BC3 — Reference Resolution

**Subdomain type:** Core (★ primary differentiator)  
**NestJS module:** `ReferenceModule`

### Language

`RefGraph`, `Oracle`, `Def`, `Ref`, `WikiRef`, `EmbedRef`, `BlockRef`, `TagRef`, `IntraRef`, `CrossRef`, `Unresolved`, `Dest`.

### Owns

| Type | Description |
|------|-------------|
| `RefGraph` | Aggregate — the consistency boundary for the reference graph |
| `Oracle` | Domain service / ACL — shields `RefGraph` from `VaultIndex` naming |
| `Def` | A location that can be the target of a reference (heading, anchor, doc title, alias) |
| `Ref` | A reference site (wikilink, embed, block ref, tag) |
| `WikiRef` | Standard `[[target]]` or `[[target\|alias]]` reference |
| `EmbedRef` | `![[target]]` embed reference (first-class, not in marksman) |
| `BlockRef` | `[[target#^anchor]]` block-level embed reference (first-class) |
| `TagRef` | `#tag` reference |
| `IntraRef` | Reference within the same document (`[[#heading]]`) |
| `CrossRef` | Reference across documents |
| `Unresolved` | A ref whose target could not be located |
| `Dest` | Resolved destination: `{ doc: DocId; def: Def }` |

### Does Not Know About

BC4's `VaultIndex` internals — contact is mediated entirely by `Oracle`. BC5 is unknown to BC3.

### Public Interface

```typescript
// RefGraph construction
RefGraph.mk(oracle: Oracle, symMap: SymbolMap): RefGraph
RefGraph.update(graph: RefGraph, oracle: Oracle, symDiff: SymbolDiff): RefGraph

// Oracle interface (implemented by BC4)
interface Oracle {
  resolveToScope(scope: DocId, ref: Ref): DocId[]
  resolveInScope(ref: Ref, scope: DocId): Def[]
}

// Query API
RefGraph.refsFrom(graph: RefGraph, doc: DocId): Ref[]
RefGraph.defsIn(graph: RefGraph, doc: DocId): Def[]
RefGraph.resolvedEdges(graph: RefGraph): Map<Ref, Dest>
RefGraph.unresolvedRefs(graph: RefGraph): Unresolved[]
RefGraph.backlinks(graph: RefGraph, doc: DocId): Ref[]
```

### Key Invariants

1. Every `CrossSection` ref is accompanied by a synthetic `CrossDoc` ref targeting the same file. A title change invalidates all section refs to that file.
2. `aliases` declared in document frontmatter are registered as additional `Def` values with the same location as the document title `Def`.
3. `RefGraph` never calls VaultIndex directly — only through `Oracle`.
4. `EmbedRef` and `BlockRef` participate in the same resolution graph as `WikiRef`; broken embeds appear in `unresolvedRefs`.

---

## BC4 — Vault & Workspace

**Subdomain type:** Supporting  
**NestJS module:** `VaultModule`

### Language

`VaultFolder`, `Workspace`, `VaultIndex`, `VaultDetector`, `FileWatcher`, `GitIgnore`, `FolderLookup`, `SingleFileMode`.

### Owns

| Type | Description |
|------|-------------|
| `VaultFolder` | Aggregate — one detected vault, owns docs + RefGraph + config |
| `Workspace` | Aggregate — one per server instance, owns all VaultFolders |
| `VaultIndex` | Name-lookup index for a vault (used by Oracle implementation) |
| `VaultDetector` | Domain service — detects `.obsidian/` or `.flavor-grenade.toml` |
| `FileWatcher` | Domain service — wraps inotify/fs.watch for `**/*.md` events |
| `GitIgnore` | Value object — parsed `.gitignore` rules applied to file scanning |
| `FolderLookup` | Index structure: `stem → DocId[]`, `title → DocId[]`, `alias → DocId[]` |

### Does Not Know About

BC5 LSP wire types. BC3 RefGraph internals (BC4 owns an opaque `RefGraph` value and forwards it to BC3 for mutation).

### Public Interface

See [[vault/domain-model]] for the full command and event table.

### Key Invariants

1. `Workspace` contains at most one `SingleFileMode` folder per URI. When a multi-file vault is detected that encloses a single-file document, the single-file entry is evicted.
2. A `VaultFolder` always has a consistent `RefGraph` — after any doc mutation, `RefGraph.update` is called before the folder is stored.

---

## BC5 — LSP Protocol

**Subdomain type:** Generic  
**NestJS module:** `LspModule`

### Language

`LspRequest`, `LspResponse`, `LspNotification`, `Capability`, `TextDocumentItem`, `Position`, `Range`, `LspServer`.

### Owns

| Type | Description |
|------|-------------|
| `LspServer` | Application service — JSON-RPC dispatcher, capability negotiator |
| `LspRequest` | Typed JSON-RPC request wrapper |
| `LspResponse` | Typed JSON-RPC response wrapper |
| `LspNotification` | Typed JSON-RPC notification wrapper |
| `Capability` | Advertised server capability (completion, definition, etc.) |

### Does Not Know About

BC3 internals. BC5 calls BC4 workspace mutations and BC3 query services through application service interfaces — it does not import aggregate internals.

### Public Interface

See [[lsp-protocol/domain-model]] for the full method-to-command mapping table.

### Key Invariants

1. `LspServer` is a strict conformist to LSP 3.17. It does not invent protocol deviations.
2. All BC4 mutations triggered by `LspServer` are synchronous from the perspective of the JSON-RPC response (awaited before responding).
3. `flavorGrenade/status` is the only custom notification; it uses the `flavorGrenade/` namespace to avoid collisions.

---

## NestJS Module Mapping

| Bounded Context | NestJS Module | Key Providers |
|----------------|--------------|--------------|
| BC1 Path & Identity | `PathModule` | Pure functions; exported as utility, no providers |
| BC2 Document Lifecycle | `DocumentModule` | `ParsePipelineService`, `OFMDocFactory` |
| BC3 Reference Resolution | `ReferenceModule` | `RefGraphService`, `OracleAdapterService` |
| BC4 Vault & Workspace | `VaultModule` | `WorkspaceService`, `VaultDetectorService`, `FileWatcherService` |
| BC5 LSP Protocol | `LspModule` | `LspServer`, `CapabilityNegotiator`, `JsonRpcHandler` |
| Config | `ConfigModule` | `FlavorConfigService`, `ConfigCascadeService` |

> [!NOTE]
> `ConfigModule` is a cross-cutting concern. Its `FlavorConfig` is consumed by BC4 (`VaultFolder` owns the merged config) and BC5 (`LspServer` reads `text_sync` mode at initialize time). It does not constitute a full bounded context — it is a supporting module with no aggregate of its own.

> [!TIP]
> When adding a new NestJS provider, ask: which bounded context owns the concept this provider encapsulates? Import only from that BC's public interface. Cross-BC imports that bypass the public interface are an architectural violation.
