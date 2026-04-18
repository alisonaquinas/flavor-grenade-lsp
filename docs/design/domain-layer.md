---
title: Domain Layer — Full DDD Analysis
tags: [design, ddd, domain-model, bounded-contexts, ubiquitous-language, domain-events]
aliases: [ddd-analysis, bounded-contexts, ubiquitous-language, domain-events, context-map]
---

# Domain Layer — Full DDD Analysis

This document applies Domain-Driven Design (DDD) analysis to `flavor-grenade-lsp`. It identifies the domain, subdomains, bounded contexts, ubiquitous language, context map, domain events, and key design decisions. It is the primary reference for understanding **why** the system is structured the way it is, not just how.

---

## The Domain

The domain of `flavor-grenade-lsp` is:

> **Structured navigation and cross-referencing of an Obsidian vault.**

An Obsidian vault is a collection of Markdown notes connected by a rich set of OFM reference types: wiki-links, embeds, block references, and tags. The domain problem is giving a text editor the information it needs to help users navigate, refactor, and maintain those connections — offering completions when a user starts typing a link, showing diagnostics when a link breaks, jumping to the target when a user invokes "go to definition", and updating all references when a user renames a note or heading.

This is a **navigation and refactoring domain** over a structured document graph.

---

## Subdomains

### Core Subdomain: Reference Resolution

**What it is**: The logic for determining, for each `Ref` in the vault, which `Def`(s) it resolves to — or whether it is broken.

**Why it is core**: This is the primary value proposition of the system. Without reference resolution, the server cannot produce diagnostics, go-to-definition results, find-references results, or accurate completions. It is the logic that is hardest to buy off the shelf (marksman does not support OFM's embed/block/alias model) and that most differentiates this server from a generic Markdown tool.

**Entities**: `Ref`, `Def`, `Scope`, `ScopedSym`, `RefGraph`, `Oracle`, `SymbolDiff`

**Key invariants**: See [[concepts/connection-graph]] for the full invariant list.

### Supporting Subdomain: Document Lifecycle

**What it is**: The management of `OFMDoc` values — creation, replacement on change, version tracking, parse pipeline execution.

**Why it is supporting**: Document lifecycle is domain logic (the decision to use full-text sync, the immutability invariant, the 8-stage parse pipeline) but it is not where the competitive advantage lies. It supports the core subdomain by providing correctly parsed document state.

**Entities**: `OFMDoc`, `OFMIndex`, `OFMStructure`

### Supporting Subdomain: Path and Identity

**What it is**: The type system for addressing documents and their components — `VaultRoot`, `DocId`, `VaultPath`, `Slug`, `WikiEncoded`.

**Why it is supporting**: Path identity is load-bearing (a bug in slug normalization would cascade through the entire system) but the logic itself is mechanical and well-understood.

**Entities**: `AbsPath`, `VaultRoot`, `DocId`, `VaultPath`, `Slug`, `WikiEncoded`

### Supporting Subdomain: Symbol Extraction

**What it is**: The extraction of `Sym` values from `OFMIndex` values — classifying each OFM element as a specific `Def` or `Ref` subtype, computing slugs and scopes.

**Why it is supporting**: Symbol extraction is rule-based and deterministic. It is complex enough to warrant its own `SymbolExtractor` service but does not contain domain insight beyond careful application of the OFM specification.

**Entities**: `DocDef`, `HeaderDef`, `BlockAnchorDef`, `AliasDef`, `CrossDoc`, `CrossSection`, `CrossBlock`, `EmbedRef`, `TagRef`, `IntraRef`

### Generic Subdomain: LSP Protocol

**What it is**: JSON-RPC framing, LSP method dispatch, capability negotiation, LSP type serialization/deserialization.

**Why it is generic**: The LSP protocol is a published standard. The server's implementation of `initialize`, `textDocument/didChange`, etc. follows the specification exactly. No domain insight is embedded here. This is solved by the `LspModule`.

### Generic Subdomain: Configuration

**What it is**: TOML parsing, config cascade, config schema validation, default values.

**Why it is generic**: Configuration is a solved problem. The only domain-specific aspect is knowing which config keys exist (e.g., `completion.candidates`, `callouts.customTypes`) — and that knowledge lives in the features that consume config, not in `ConfigModule` itself.

---

## Ubiquitous Language

The following terms have precise meanings within the `flavor-grenade-lsp` codebase. Using these terms consistently — in code, comments, issues, and PR discussions — prevents the ambiguity that leads to bugs.

| Term | Precise Meaning |
|------|----------------|
| **Vault** | A directory tree of Markdown notes identified by a `.obsidian/` directory or `.flavor-grenade.toml` file at its root |
| **OFMDoc** | An immutable snapshot of a single Markdown document's text, parsed structure, and symbol index |
| **DocId** | The pair (LSP URI, vault-relative path) that uniquely identifies a document within a vault |
| **Slug** | A case-folded, trimmed string derived from a file name stem or heading text; the canonical match key for wiki-links |
| **WikiEncoded** | The raw text between `[[` and `]]` before splitting into target, anchor, and label components |
| **Sym** | Any symbol extracted from a document: either a definition site (Def) or a usage site (Ref) or a tag (Tag) |
| **Def** | A definition site: a document (`DocDef`), heading (`TitleDef`, `HeaderDef`), block anchor (`BlockAnchorDef`), alias (`AliasDef`), or CommonMark link definition (`LinkDefDef`) |
| **Ref** | A usage site: a wiki-link, embed, block reference, intra-document link, or tag reference |
| **ScopedSym** | A `Sym` paired with the `Scope` in which it lives; the atomic unit of the `RefGraph` |
| **Scope** | Either `Doc(DocId)` (document-local) or `Global` (vault-wide, used for tags) |
| **RefGraph** | The bipartite graph mapping every `Ref` to zero or more `Defs`; the output of `Oracle.mk` or `Oracle.update` |
| **Oracle** | The query interface over `RefGraph`; used by all feature services to resolve refs |
| **SymbolDiff** | The set of `ScopedSym`s added and removed by one document change; the input to `RefGraph.update` |
| **lastTouched** | The set of `ScopedSym`s whose resolution state changed in the last `RefGraph.update`; drives selective diagnostic republishing |
| **VaultFolder** | The aggregate holding all `OFMDoc`s and the `RefGraph` for one vault |
| **Workspace** | The top-level container holding all `VaultFolder`s |
| **FolderLookup** | The suffix-tree index of document slugs within a `VaultFolder`, used for approximate wiki-link resolution |
| **SingleFile mode** | `VaultFolder` state when no vault root was found; contains one document, cannot resolve cross-document refs |
| **MultiFile mode** | `VaultFolder` state when a vault root was found; contains all vault documents |
| **EmbedRef** | A wiki-link prefixed with `!` — embeds the target document or media inline; OFM-specific |
| **CrossBlock** | A wiki-link targeting a specific block anchor in another document (`[[doc#^id]]`); OFM-specific |
| **AliasDef** | A `Def` created from a `aliases:` frontmatter entry; provides an additional slug for resolving refs to a document; OFM-specific |
| **BlockAnchorDef** | A `Def` created from a `^blockid` token at the end of a paragraph or list item; OFM-specific |
| **BrokenLink** | A `CrossDoc` ref that matches no `DocDef` or `AliasDef` in the vault; produces an error diagnostic |
| **Approx resolution** | Wiki-link resolution mode where the target is matched anywhere in the vault by slug (no path prefix) |

---

## Bounded Contexts

`flavor-grenade-lsp` is organized into five bounded contexts. Each context has a clear responsibility, a stable interface surface, and is implemented as one or more NestJS modules.

### 1. Path & Identity Context

**Core responsibility**: Define and normalize all path and identity types. No I/O, no async.

**Module**: `PathModule`

**Exports**: `AbsPath`, `DocId`, `VaultPath`, `Slug`, `WikiEncoded` and their constructors/normalizers

**Anti-corruption layer**: All inbound LSP URIs are converted to `DocId` at the boundary between `LspModule` and `PathModule`. Raw strings never cross context boundaries.

### 2. Document Context

**Core responsibility**: Manage the lifecycle of `OFMDoc` values; own the parse pipeline.

**Modules**: `ParserModule`, `DocumentModule`

**Exports**: `OFMDoc`, `OFMIndex`, `OFMParser`

**Isolation rule**: The CST/AST internal types (`CSTNode`, `ASTNode`) are never exported from this context. Consumers see only `OFMDoc` and `OFMIndex`.

### 3. Vault Context

**Core responsibility**: Organize documents into vaults; detect vault roots; watch filesystem; maintain `FolderLookup`.

**Module**: `VaultModule`

**Exports**: `Workspace`, `VaultFolder`, `VaultDetector`, `VaultIndex`

**Domain event sources**: `DocumentTextChanged`, `DocumentClosed`, `VaultFolderEnclosed`

### 4. Reference Resolution Context

**Core responsibility**: Resolve refs to defs; maintain the `RefGraph`; report unresolved refs.

**Module**: `ReferenceModule`

**Exports**: `Oracle`, `RefGraph` (read-only view)

**Isolation rule**: Feature services call `Oracle` methods; they never manipulate `RefGraph` edges directly. `RefGraph` is an implementation detail of the resolution context.

### 5. LSP Protocol Context

**Core responsibility**: Handle JSON-RPC framing; dispatch requests; serialize responses; implement LSP methods.

**Module**: `LspModule` + feature service providers

**Exports**: None (root module — everything converges here)

**Isolation rule**: This context is the only one allowed to read stdin or write stdout. All communication with the editor is mediated through `LspServer`.

---

## Context Map

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     LSP Protocol Context                            │
│  (LspServer, RequestRouter, CapabilityNegotiator, Feature Services) │
│                                                                     │
│   reads from:  Vault Context (via Workspace)                        │
│                Resolution Context (via Oracle)                      │
│                Document Context (via OFMDoc)                        │
│                Path Context (via DocId conversions)                 │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Upstream / Customer
         ┌─────────────────┼────────────────────────┐
         │                 │                        │
         ▼                 ▼                        ▼
┌────────────────┐  ┌──────────────┐  ┌────────────────────────────┐
│ Vault Context  │  │  Resolution  │  │     Document Context       │
│                │  │  Context     │  │                            │
│ Workspace      │◄─│              │  │ OFMDoc  OFMIndex           │
│ VaultFolder    │  │ Oracle       │  │ OFMParser (8-stage)        │
│ FolderLookup   │  │ RefGraph     │  │                            │
│ VaultDetector  │  │ SymbolDiff   │  │ depends on: Path Context   │
│                │  │              │  │             Config Context  │
│ depends on:    │  │ depends on:  │  └────────────────────────────┘
│ Document Ctx   │  │ Vault Ctx    │
│ Path Ctx       │  │ Document Ctx │  ┌────────────────────────────┐
│ Config Ctx     │  │ Path Ctx     │  │     Path & Identity Ctx    │
└────────────────┘  └──────────────┘  │                            │
                                      │ AbsPath  DocId             │
         ┌────────────────────────┐   │ VaultPath  Slug            │
         │   Config Context       │   │ WikiEncoded                │
         │   FlavorConfig         │   │                            │
         │   ConfigCascade        │   │ (no dependencies)          │
         │   depends on: Path Ctx │   └────────────────────────────┘
         └────────────────────────┘
```

---

## Integration Styles

| Context Pair | Integration Style | Direction | Notes |
|-------------|------------------|-----------|-------|
| LSP ← Vault | **Shared Kernel** (NestJS module import) | Vault → LSP | `Workspace` and `VaultFolder` types are used directly in LSP feature services |
| LSP ← Resolution | **Published Interface** (`Oracle` interface) | Resolution → LSP | Feature services depend on `Oracle` interface, not `RefGraph` implementation |
| LSP ← Document | **Shared Kernel** | Document → LSP | `OFMDoc` and `OFMIndex` used directly |
| Vault ← Document | **Shared Kernel** | Document → Vault | `VaultFolder.withDoc(OFMDoc)` — direct type dependency |
| Resolution ← Vault | **Published Interface** | Vault → Resolution | `RefGraph.update(oracle, SymbolDiff)` — Vault computes the diff; Resolution owns the graph |
| Resolution ← Document | **Shared Kernel** | Document → Resolution | `OFMIndex` feeds `SymbolExtractor` |
| All ← Path | **Conformist** | Path → All | All contexts conform to `PathModule` type vocabulary; no translation layer needed |
| All ← Config | **Published Interface** | Config → All | `FlavorConfig` token injected via NestJS DI; consuming modules depend on the config schema |

---

## Domain Events

Domain events represent significant state changes within the domain. They are not NestJS events (no `EventEmitter2` bus); they are **conceptual events** that drive state transitions. In code, they manifest as method calls or return values rather than published events.

| Event | Trigger | Consumers | Effect |
|-------|---------|-----------|--------|
| `DocumentTextChanged` | `textDocument/didChange` or `DiskDocumentChanged` | `VaultFolder.withDoc()` | New `OFMDoc` created; `SymbolDiff` computed; `RefGraph.update` called |
| `SymbolsChanged` | `RefGraph.update` completing | `DiagnosticService` | `lastTouched` set scanned; diagnostics republished for affected documents |
| `ReferenceResolved` | A `Ref` in `unresolvedRefs` gains a matching `Def` | `DiagnosticService` | `BrokenLink` (or similar) diagnostic removed from affected document |
| `ReferenceUnresolved` | A `Def` is removed and orphans a `Ref` | `DiagnosticService` | `BrokenLink` (or similar) diagnostic added to affected document |
| `DocumentClosed` | `textDocument/didClose` or file deleted from disk | `VaultFolder` | Document demoted to disk-version (or removed); `RefGraph.update` with removed defs |
| `VaultFolderEnclosed` | A new multi-file `VaultFolder` is added whose root encloses existing single-file folders | `Workspace` | Single-file folders evicted; their `OFMDoc`s absorbed into the new folder |

---

## Key Design Notes

### Why RefGraph is Inside VaultFolder

`RefGraph` is owned by `VaultFolder`, not by `Workspace`. This choice enforces the isolation invariant: cross-vault link resolution is impossible because each `VaultFolder` has its own graph and no query crosses the folder boundary. The `Workspace.withDoc()` method delegates to `VaultFolder.withDoc()`, which updates the folder-local graph. Workspace never merges graphs.

### Incremental vs Full-Rebuild Policy

`RefGraph.update` is the default. `RefGraph.mk` is the exception. The policy is:

- **Use `update`** for any document text change (`textDocument/didChange`, `DiskDocumentChanged`)
- **Use `mk`** only for: initial vault load, file deletion, explicit `flavorGrenade.rebuildIndex` command

Full rebuild is O(V × R) where V is vault size and R is avg refs per document. Incremental update is O(ΔS × D) where ΔS is the size of the symbol diff and D is the avg document count affected. For typical edits (adding/removing one wiki-link), ΔS = 1 and D = 1, making update O(1).

### Why CrossBlock → CrossDoc Synthesis

A `CrossBlock` ref (`[[doc#^id]]`) requires knowing both that the target document exists and that the block anchor exists within it. The resolver synthesizes a `CrossDoc` resolution as the first step — if the document does not exist, a `BrokenLink` diagnostic is produced (not `BrokenBlockRef`), because the document non-existence is the primary problem. Only if the document exists but the block anchor is absent is a `BrokenBlockRef` diagnostic produced.

This two-step synthesis is consistent with Obsidian's own error reporting behavior and produces more actionable diagnostics.

### Single-File Mode as a Domain Predicate

Single-file mode is not a degraded state or an error condition — it is a first-class domain predicate: "this document is not part of any detected vault." The `VaultFolder` type makes this explicit via the `mode: 'SingleFile' | 'MultiFile'` discriminant. Feature services check `folder.mode` when deciding whether to suppress `BrokenLink` diagnostics (in single-file mode, unresolvable cross-refs are expected and not diagnosed).

---

## OFM-Specific Additions vs marksman

The following concepts are present in `flavor-grenade-lsp` but absent from marksman's model:

| Concept | marksman | flavor-grenade-lsp |
|---------|----------|-------------------|
| Embed refs (`![[file]]`) | No | `EmbedRef` — first-class ref type; `EmbedDest` resolution result |
| Block refs (`[[doc#^id]]`) | No | `CrossBlock` — first-class ref type; `BlockAnchorDef` — first-class def type |
| Block anchors (`^blockid`) | No | `BlockAnchorDef` — created from `^id` tokens at end of blocks |
| Aliases | No | `AliasDef` — from `aliases:` frontmatter; participates in RefGraph |
| Tag hierarchy | No | `TagRef` with `/`-separated subtag path; vault-wide tag set |
| Callout types | No | `CalloutOpener` token; `CalloutTypeCompletionProvider` |
| Frontmatter `tags:` | No | Equivalent to inline `#tag` for resolution; creates `TagRef`s |
| OFM comment regions (`%%`) | No | Ignore region; semantic token type; folding range |

---

## Cross-References

- [[architecture/overview]] — Design principles derived from this DDD analysis
- [[architecture/layers]] — NestJS module mapping to bounded contexts
- [[concepts/connection-graph]] — Core subdomain implementation details
- [[concepts/symbol-model]] — Full Sym/Def/Ref type hierarchy
- [[concepts/document-model]] — Document context implementation
- [[concepts/workspace-model]] — Vault context implementation
- [[concepts/path-model]] — Path & Identity context implementation
- [[design/api-layer]] — LSP protocol context surface
- [[design/behavior-layer]] — BDD scenarios validating domain invariants
