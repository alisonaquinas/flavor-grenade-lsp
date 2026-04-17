---
title: Architecture Layers — NestJS Module Stack
tags: [architecture, nestjs, modules, dependency-injection]
aliases: [module-layers, nestjs-stack, compile-order]
---

# Architecture Layers — NestJS Module Stack

`flavor-grenade-lsp` is structured as a layered NestJS module stack. The layers form a strict partial order: a module at layer N may only import from modules at layer N-1 or below. This constraint is enforced at runtime by the NestJS DI container — a circular dependency or an upward import causes an immediate startup failure.

The ordering reflects domain logic: **foundation types** are defined first, **parsers** depend on path types, **documents** depend on parsers, **vault** depends on documents, **reference resolution** depends on vault, **features** depend on resolution, and the **LSP layer** ties everything together.

> [!tip] Why ordering matters
> NestJS resolves providers in dependency order. If `ReferenceModule` is instantiated before `DocumentModule`, the `OFMDoc` type it needs has not been registered yet. Declaring explicit `imports` arrays in each `@Module()` decorator makes the dependency graph legible and machine-checkable — it is not merely convention.

---

## Module Dependency Table

| Layer | Module(s) | Key Providers | Depends On | Responsibilities |
|-------|-----------|---------------|------------|-----------------|
| **Foundation** | `PathModule` | `AbsPath`, `DocId`, `VaultPath`, `Slug`, `WikiEncoded` | — | Pure value types and their constructors/normalizers. No I/O, no async. Slug normalization (case-fold, trim) lives here. |
| **Config** | `ConfigModule` | `FlavorConfig`, `ConfigCascade`, `TomlLoader` | `PathModule` | Reads `.flavor-grenade.toml`; merges workspace defaults with per-folder overrides. Exposes a typed `FlavorConfig` to all consuming modules. |
| **Parsing** | `ParserModule` | `OFMParser`, `WikiLinkParser`, `EmbedParser`, `BlockAnchorParser`, `TagParser`, `CalloutParser` | `PathModule`, `ConfigModule` | Owns the 8-stage OFM parse pipeline. Produces `OFMIndex` and the full CST/AST. Config influences parser behavior (e.g., allowed callout types, ignore patterns). |
| **Document** | `DocumentModule` | `OFMDoc`, `DocLifecycle`, `TextChangeApplicator` | `ParserModule`, `PathModule` | Manages `OFMDoc` creation and replacement. Applies `textDocument/didChange` payloads. Holds the text-version → OFMDoc mapping. |
| **Vault** | `VaultModule` | `VaultDetector`, `VaultIndex`, `FileWatcher`, `VaultFolder`, `Workspace`, `FolderLookup` | `DocumentModule`, `ConfigModule`, `PathModule` | Detects vault roots. Manages the set of known `OFMDoc`s. Owns the `VaultFolder` → `Workspace` hierarchy. Watches filesystem for `.md` changes. |
| **Resolution** | `ReferenceModule` | `RefGraph`, `Oracle`, `SymbolExtractor` | `VaultModule`, `DocumentModule`, `PathModule` | Builds and incrementally updates the bipartite ref→def graph. Resolves wiki-links, embeds, block refs, tags. Identifies unresolved refs. |
| **Features** | *(per-feature services)* | `CompletionService`, `DiagnosticService`, `DefinitionService`, `ReferencesService`, `RenameService`, `HoverService`, `SymbolsService`, `CodeActionService`, `CodeLensService`, `SemanticTokenService` | `ReferenceModule`, `VaultModule`, `DocumentModule` | Each feature service is a standalone injectable. They read from `RefGraph`, `VaultIndex`, and `OFMDoc` but do not write to them. |
| **LSP** | `LspModule` | `LspServer`, `RequestRouter`, `CapabilityNegotiator` | All modules | stdio JSON-RPC codec, request routing, capability negotiation, response serialization. The only layer allowed to directly read from stdin or write to stdout. |

---

## Layer Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  LSP Layer          LspModule                                │
│  (LspServer, RequestRouter, CapabilityNegotiator)            │
├──────────────────────────────────────────────────────────────┤
│  Feature Layer      CompletionService  DiagnosticService     │
│                     DefinitionService  ReferencesService      │
│                     RenameService      HoverService           │
│                     SymbolsService     CodeActionService      │
│                     CodeLensService    SemanticTokenService   │
├──────────────────────────────────────────────────────────────┤
│  Resolution Layer   ReferenceModule                          │
│                     (RefGraph, Oracle, SymbolExtractor)       │
├──────────────────────────────────────────────────────────────┤
│  Vault Layer        VaultModule                              │
│                     (VaultDetector, VaultIndex, FileWatcher,  │
│                      VaultFolder, Workspace, FolderLookup)    │
├──────────────────────────────────────────────────────────────┤
│  Document Layer     DocumentModule                           │
│                     (OFMDoc, DocLifecycle,                    │
│                      TextChangeApplicator)                    │
├──────────────────────────────────────────────────────────────┤
│  Parsing Layer      ParserModule                             │
│                     (OFMParser, WikiLinkParser, EmbedParser,  │
│                      BlockAnchorParser, TagParser,            │
│                      CalloutParser)                           │
├──────────────────────────────────────────────────────────────┤
│  Config Layer       ConfigModule                             │
│                     (FlavorConfig, ConfigCascade, TomlLoader) │
├──────────────────────────────────────────────────────────────┤
│  Foundation Layer   PathModule                               │
│                     (AbsPath, DocId, VaultPath, Slug,         │
│                      WikiEncoded)                             │
└──────────────────────────────────────────────────────────────┘
         Arrows: upper layers import from lower layers only
```

---

## Module Detail Notes

### PathModule (Foundation)

`PathModule` exports only pure value-type constructors and their helpers. There are no async operations and no NestJS services with lifecycle hooks here. All other modules import `PathModule` — it is the universal vocabulary.

Key exports: `AbsPath.of(s)`, `VaultPath.of(root, abs)`, `Slug.ofString(s)`, `DocId.ofUri(uri)`, `WikiEncoded.decode(s)`.

### ConfigModule

`ConfigModule` reads `.flavor-grenade.toml` using a TOML parser and merges user settings with built-in defaults. It exposes a single `FlavorConfig` token. Feature services read from this to determine, for example, the maximum number of completion candidates (`completion.candidates`) or whether to enable semantic tokens.

`ConfigCascade` handles the case where multiple config files exist at different ancestor directories — closer files win.

### ParserModule

`ParserModule` is the most complex module. It owns the OFM parse pipeline and exposes `OFMParser` as the primary service. The individual sub-parsers (`WikiLinkParser`, `EmbedParser`, etc.) are internal providers exported only as part of the `OFMParser` composite — consumers never call them directly.

The CST produced by `OFMParser` is never leaked outside `DocumentModule`. The `OFMIndex` (a projection of the CST) is the export surface.

### DocumentModule

`DocumentModule` owns the `OFMDoc` lifecycle. It receives raw `textDocument/didChange` payloads from `LspServer` via `RequestRouter` and produces new `OFMDoc` values. It does not own vault-level state — it knows about one document at a time.

### VaultModule

`VaultModule` aggregates documents into `VaultFolder`s and `VaultFolder`s into the `Workspace`. `FileWatcher` uses the OS file-watch API to detect `.md` file creation, deletion, and rename events on disk, turning them into `DocumentClosed` and `DocumentTextChanged` domain events.

`FolderLookup` is a suffix-tree index over vault-relative paths, enabling approximate (unanchored) wiki-link resolution — e.g., `[[daily]]` matching `notes/daily/2026-04-16.md`.

### ReferenceModule

`ReferenceModule` owns the `RefGraph` and `Oracle`. It consumes vault-level symbol diffs (computed by `VaultFolder`) and applies them to the graph incrementally. The `Oracle` provides the query interface used by feature services — they never manipulate the graph directly.

### Feature Services

Each feature service is an `@Injectable()` class registered in `LspModule`. They are deliberately kept thin: a feature service's job is to translate between LSP request/response shapes and domain calls to `Oracle`, `VaultIndex`, or `OFMDoc`. Business logic belongs in the domain layer.

### LspModule

`LspModule` is the root module. It imports all other modules and registers the `LspServer`. The `LspServer` owns the stdio transport and the JSON-RPC codec. `RequestRouter` maps LSP method strings to the appropriate handler (feature service or domain service). `CapabilityNegotiator` builds the `ServerCapabilities` object returned in the `initialize` response.

---

## NestJS DI Enforcement

NestJS detects circular imports at startup and throws an error with the cycle listed. This is the primary enforcement mechanism. Additionally:

- `@Module({ exports: [...] })` ensures that only explicitly exported providers are visible to importing modules — a `ParserModule`-internal CST node type cannot be imported by `VaultModule`.
- `@Module({ imports: [...] })` declares the dependency explicitly, making the graph readable in source rather than implicit.
- Integration tests for each module use `Test.createTestingModule()` with only the modules that layer needs, verifying that no upward dependencies have been introduced.

---

## Cross-References

- [[architecture/overview]] — High-level system description and design principles
- [[architecture/data-flow]] — Runtime data flow through these layers
- [[ddd/bounded-contexts]] — DDD mapping of these modules to bounded contexts
- [[concepts/document-model]] — OFMDoc internals
- [[concepts/connection-graph]] — RefGraph and Oracle internals
