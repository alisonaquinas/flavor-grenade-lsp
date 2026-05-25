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

This document is the authoritative domain model for **Bounded Context 4: Vault & Workspace**. BC4 is a Supporting subdomain that owns the top-level state of the server: which vaults are known, which documents are loaded, how those documents are indexed for reference resolution, and which effective Markdown flavor applies to each document.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[docs/ddd/document-lifecycle/domain-model]], [[docs/ddd/reference-resolution/domain-model]], [[docs/ddd/config/domain-model]].

> [!NOTE]
> BC4 is the customer of BC2 (Document Lifecycle) and BC3 (Reference Resolution). It calls their published APIs but does not import their internals. BC5 (LSP Protocol) is the customer of BC4. BC4 owns `EffectiveMarkdownContext` state and supplies it to BC2 as `ParseContext`.

---

## Aggregate: VaultFolder

`VaultFolder` is the consistency boundary for a single detected vault. All document mutations within a vault — additions, removals, text changes — must pass through `VaultFolder` commands. After each mutation, the `RefGraph` is updated before the new `VaultFolder` is stored.

### State

```text
VaultFolder
├── root:       VaultRoot               — identity; immutable after construction
├── docs:       Map<DocId, MarkdownDoc>  — all indexed documents (current code: OFMDoc)
├── refGraph:   RefGraph                 — current reference graph for this vault
├── config:     FlavorConfig             — merged config for this vault
├── context:    EffectiveMarkdownContext — resolved default context for this vault
├── profiles:   Map<MarkdownFlavorId, MarkdownFlavorProfile>
│                                      — shared flavor corpus used for parse context
├── selections: Map<DocId, MarkdownFlavorSelection>
│                                      — optional document-specific flavor selectors
├── structuredSelections: Map<DocId, StructuredProfileSelection>
│                                      — optional document-specific structured profile selectors
├── lookup:     FolderLookup             — stem/title/alias → DocId[] index
└── gitIgnore:  GitIgnore                — parsed .gitignore rules (may be empty)
```

### State Diagram

```text
                    ┌─────────────────────────────────────────┐
                    │              VaultFolder                 │
                    │                                         │
  VaultDetected ──► │  root: VaultRoot  (identity, immutable) │
                    │                                         │
  DocumentAdded ──► │  docs: Map<DocId, MarkdownDoc>          │
 DocumentRemoved    │                                         │
 DocumentChanged    │  refGraph: RefGraph ◄── rebuilt/updated  │
                    │                         after each cmd  │
                    │  config: FlavorConfig                   │
                    │  context: EffectiveMarkdownContext      │
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
| I4 | `lookup` mirrors `docs` exactly: every `MarkdownDoc` in `docs` has entries in `lookup`; removed docs have no entries. |
| I5 | Documents whose `VaultPath` matches a `gitIgnore` rule are never added to `docs`. |
| I6 | If a document is open in the editor (`doc.version !== null`), the version in `docs` reflects the editor state, not disk state. |
| I7 | `context.effectiveMarkdownFlavor` and all document-specific effective flavors are explicit `MarkdownFlavorId` values, never `auto`; structured profile flags are validated and compatible. |
| I8 | When `MarkdownFlavorSelection`, `StructuredProfileSelection`, or config changes alter a document's `EffectiveMarkdownContext`, that document is re-parsed before `lookup` and `refGraph` are considered current. |

### Commands

All commands are pure functions returning a new `VaultFolder`. They do not perform I/O.

| Command | Signature | Description |
|---------|-----------|-------------|
| `VaultFolder.mk` | `(root: VaultRoot, config: FlavorConfig) → VaultFolder` | Construct an empty vault folder. No docs, empty ref graph. |
| `VaultFolder.withDoc` | `(folder: VaultFolder, doc: MarkdownDoc, oracle: Oracle) → VaultFolder` | Add or replace a document. Updates `lookup` and triggers `RefGraph.update`. Emits `DocumentAdded` or `DocumentChanged`. |
| `VaultFolder.withoutDoc` | `(folder: VaultFolder, id: DocId, oracle: Oracle) → VaultFolder` | Remove a document. Updates `lookup` and triggers `RefGraph.update`. Emits `DocumentRemoved`. |
| `VaultFolder.withConfig` | `(folder: VaultFolder, config: FlavorConfig) → VaultFolder` | Replace the merged config, recompute default effective context, and mark changed docs for reparse. |
| `VaultFolder.withMarkdownFlavorSelection` | `(folder: VaultFolder, selection: MarkdownFlavorSelection, scope?: DocId) → VaultFolder` | Store a validated selector from VS Code or project config scope, recompute affected `EffectiveMarkdownContext` values, and mark changed docs for reparse. |
| `VaultFolder.withStructuredProfileSelection` | `(folder: VaultFolder, selection: StructuredProfileSelection, scope?: DocId) → VaultFolder` | Store a validated structured-profile selector, recompute affected `EffectiveMarkdownContext` values, and mark changed docs for reparse. |
| `VaultFolder.effectiveFlavorFor` | `(folder: VaultFolder, id: DocId) → EffectiveMarkdownFlavor` | Resolve explicit effective flavor for one document from document selector, folder config, marker, and fallback. |
| `VaultFolder.effectiveContextFor` | `(folder: VaultFolder, id: DocId) → EffectiveMarkdownContext` | Resolve base effective flavor plus structured profile flags for one document. |
| `VaultFolder.profileFor` | `(folder: VaultFolder, id: DocId) → MarkdownFlavorProfile` | Return the profile matching `effectiveFlavorFor(id)` for BC2 parse context construction. |
| `VaultFolder.openDoc` | `(folder: VaultFolder, id: DocId, version: number) → VaultFolder` | Mark a document as editor-open. Sets `doc.version`. |
| `VaultFolder.closeDoc` | `(folder: VaultFolder, id: DocId) → VaultFolder` | Revert editor-open document to disk version (`doc.version = null`). |

---

## Aggregate: Workspace

`Workspace` is the top-level aggregate — one instance per server process. It owns all `VaultFolder` instances and mediates the `SingleFileMode` / multi-file lifecycle.

### Workspace State

```text
Workspace
├── folders:    Map<VaultRoot, VaultFolder>  — all known vaults
├── singleFile: Map<string, MarkdownDoc>     — URI → MarkdownDoc (SingleFileMode docs)
├── singleFileContext: Map<string, EffectiveMarkdownContext>
│                                                — URI → effective context
├── vscodeFlavorSelection: MarkdownFlavorSelection
│                                                — current validated VS Code layer
├── vscodeStructuredProfileSelection: StructuredProfileSelection
│                                                — current validated structured-profile layer
└── userConfig: FlavorConfig                 — user-level config (cascade layer 2)
```

### Workspace State Diagram

```text
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

### Workspace Invariants

| # | Invariant |
|---|-----------|
| I1 | There is exactly one `Workspace` per server process. It is constructed during `initialize` and lives until server shutdown. |
| I2 | A URI is tracked in at most one of `folders` or `singleFile` at any time — never both. |
| I3 | When a `VaultFolder` is added whose `root` encloses a URI in `singleFile`, the single-file entry is evicted (removed from `singleFile`) and the document is added to the new `VaultFolder` via `VaultFolder.withDoc`. |
| I4 | `VaultFolder` roots are disjoint — no vault root is a subdirectory of another vault root. If a nested vault is detected, the outer vault takes precedence. |
| I5 | `userConfig` is loaded once at startup and refreshed on `flavorGrenade/reloadConfig` notification. |
| I6 | Workspace owns the VS Code configuration layer used by `MarkdownFlavorCascade`; BC5 validates and dispatches changes but does not store them. |
| I7 | SingleFileMode also has an `EffectiveMarkdownContext`; generic Markdown falls back to base `commonmark` and no structured profiles unless a higher-priority selector or local structured-profile evidence applies. |

### Workspace Commands

| Command | Signature | Description |
|---------|-----------|-------------|
| `Workspace.withFolder` | `(ws: Workspace, folder: VaultFolder) → Workspace` | Add or replace a `VaultFolder`. Triggers SingleFileMode eviction if applicable. Emits `VaultDetected`. |
| `Workspace.withoutFolder` | `(ws: Workspace, root: VaultRoot) → Workspace` | Remove a `VaultFolder` (e.g., vault directory deleted). |
| `Workspace.withSingleFile` | `(ws: Workspace, doc: MarkdownDoc) → Workspace` | Track a document in `SingleFileMode`. No-op if a vault already encloses the URI. |
| `Workspace.withoutSingleFile` | `(ws: Workspace, uri: string) → Workspace` | Remove a single-file entry (e.g., document closed). |
| `Workspace.updateDoc` | `(ws: Workspace, id: DocId, doc: MarkdownDoc) → Workspace` | Route a document update to the correct `VaultFolder` (or single-file slot). |
| `Workspace.withMarkdownFlavorSelection` | `(ws: Workspace, selection: MarkdownFlavorSelection, scope?: VaultRoot \| string) → Workspace` | Store validated VS Code selector state, recompute effective context for affected vault or single-file docs, and schedule reparse/diagnostic refresh for changes. |
| `Workspace.withStructuredProfileSelection` | `(ws: Workspace, selection: StructuredProfileSelection, scope?: VaultRoot \| string) → Workspace` | Store validated structured-profile selector state, recompute effective context for affected vault or single-file docs, and schedule reparse/diagnostic refresh for changes. |
| `Workspace.parseContextFor` | `(ws: Workspace, id: DocId, source: 'disk' \| 'lsp') → ParseContext` | Build the BC2 parse context from server-owned effective Markdown context state. |

---

## Value Objects

### VaultPath

```text
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

```text
VaultRoot (branded string)
├── Absolute filesystem path
├── No trailing separator
└── Example: "/home/user/notes"
```

- Constructed by `VaultDetector` when it confirms a vault directory.
- Immutable — if the vault root moves, it's a new `VaultRoot` and a new `VaultFolder`.

### DocId

```text
DocId
├── uri:  string      — file:// URI (LSP-compatible)
└── path: VaultPath   — vault-relative path
```

- Constructed by BC1 `docId(uri, root)`.
- Identity comparison uses `path` only (see BC1 invariants).
- The `uri` field is kept for round-trip compatibility with LSP `TextDocumentIdentifier`.

---

## Domain Services

### MarkdownFlavorCascade

`MarkdownFlavorCascade` is executed by BC4 whenever a vault is detected, a project config file changes, or BC5 dispatches validated VS Code configuration. It returns the base `EffectiveMarkdownFlavor` for an `EffectiveMarkdownContext`. The normative precedence and resource-specific flow are defined in [[docs/design/markdown-flavor-auto-detection]].

```text
1. VS Code explicit override
2. VS Code workspace-folder/workspace setting
3. Project config core.markdown.flavor
4. Vault marker (.obsidian/ → obsidian)
5. CommonMark fallback
```

BC4 tie-breakers:

- Document-scoped selector beats folder/workspace selector.
- VS Code workspace-folder/workspace setting beats project config when both exist.
- Workspace-folder beats workspace for docs under that folder.
- `auto` delegates to the next lower source.
- Invalid values are never stored by BC4; BC5/Config reject them before mutation.

`EffectiveMarkdownContext` belongs to `VaultFolder`/`Workspace`, not BC2 or BC5. BC2 receives it only through `ParseContext`.

### StructuredProfileResolver

`StructuredProfileResolver` is executed by BC4 after `MarkdownFlavorCascade`
selects the base flavor. It returns zero or more compatible
`StructuredMarkdownProfileId` values for the same `EffectiveMarkdownContext`.

```text
1. Explicit VS Code structured-profile setting
2. Project config core.markdown.structured_profiles
3. Strong local structured-profile evidence
4. No structured profile
```

Evidence values:

| Evidence | Strong signal examples |
|---|---|
| Filename/folder | `CHANGELOG.md`, `docs/decisions/NNNN-title.md`, `decisions/NNNN-title.md` |
| Keep a Changelog content | `# Changelog`, `## [Unreleased]`, bracketed release headings, `Added`/`Changed`/`Deprecated`/`Removed`/`Fixed`/`Security` categories |
| Common Changelog content | `# Changelog`, `## VERSION - YYYY-MM-DD`, `Changed`/`Added`/`Removed`/`Fixed` categories, linked change references, `**Breaking:**` prefixes |
| MADR content | MADR metadata or headings such as `Context and Problem Statement`, `Considered Options`, and `Decision Outcome` |

Resolver rules:

- `auto` delegates to evidence inference.
- `none` returns an empty structured profile list for the relevant scope.
- Explicit arrays must be unique and compatible.
- `keep-a-changelog` and `common-changelog` are mutually exclusive. If both
  changelog profiles have strong evidence for one document, BC4 chooses the
  more specific local evidence winner; if no winner is clear, no changelog
  profile is inferred and diagnostics can report ambiguous structured evidence.
- Weak evidence never enables a structured profile by itself.
- Structured profile inference is bounded to the active workspace/vault root
  and must not inspect sibling workspaces, remote services, rendered output, or
  generated release artifacts.

### Effective Context Responsibilities

BC4 owns the server-authoritative answer to "which Markdown flavor and
structured profiles is this document parsed as?" The answer is:

```text
EffectiveMarkdownContext
  ├── effectiveMarkdownFlavor: MarkdownFlavorId
  ├── profile: MarkdownFlavorProfile
  └── structuredProfiles: StructuredMarkdownProfileId[]
```

The base flavor id decides which explicit dialect profile is active; the
profile carries the syntax surfaces and host boundaries BC2 needs. Structured
profile flags add document-structure behavior such as changelog or MADR rules.
Selector values of `auto` are discarded during resolution and never reach BC2.

When effective context changes for a document, BC4 must:

1. Build a fresh `ParseContext` with the new profile.
2. Reparse or re-project the `MarkdownDoc`.
3. Rebuild `FolderLookup` entries whose defs changed.
4. Update `RefGraph` through BC3 with the new symbol set.
5. Trigger diagnostic refresh through BC5.

Host-specific boundaries stay local to the profile. BC4 does not create vault scopes for GitHub, GitLab, Reddit, Stack Overflow, Pandoc render targets, R execution environments, or MDX language services.

### VaultDetector

The `VaultDetector` service determines whether a given directory is a vault and what kind.

```typescript
VaultDetector.detect(dir: AbsPath, config: FlavorConfig): VaultDetectionResult

VaultDetectionResult
  | { kind: 'obsidian'; root: VaultRoot }    — .obsidian/ found
  | { kind: 'flavor-config'; root: VaultRoot } — Flavor Grenade project config marker found
  | { kind: 'none' }                          — neither found → SingleFileMode
```

**Detection algorithm:**

```text
1. Check for {dir}/.obsidian/ directory
   → if found AND config.core.vault_detection ∈ ['obsidian', 'both']: return obsidian
2. Check for Flavor Grenade project config marker files in {dir}
   → if found AND config.core.vault_detection ∈ ['config-only', 'both']: return flavor-config
3. Walk up to parent directory (repeat until filesystem root)
4. If no match found: return none (SingleFileMode)
```

> [!NOTE]
> The `vault_detection` config key controls which detection signals are respected. Default is `"obsidian"` — only `.obsidian/` triggers vault mode. Set to `"both"` in non-Obsidian editors that use Flavor Grenade project config markers.

### FileWatcher

The `FileWatcher` service wraps OS filesystem events and normalises them into domain events.

```typescript
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
| `VaultDetected` | `{ root: VaultRoot; kind: 'obsidian' \| 'flavor-config' }` | `Workspace.withFolder` |
| `DocumentAdded` | `{ folderId: VaultRoot; id: DocId; version: number \| null }` | `VaultFolder.withDoc` (new doc) |
| `DocumentChanged` | `{ folderId: VaultRoot; id: DocId; oldVersion: number \| null; newVersion: number \| null }` | `VaultFolder.withDoc` (existing doc) |
| `DocumentRemoved` | `{ folderId: VaultRoot; id: DocId }` | `VaultFolder.withoutDoc` |
| `SingleFileModeEntered` | `{ uri: string }` | `Workspace.withSingleFile` |
| `SingleFileModeEvicted` | `{ uri: string; absorbedInto: VaultRoot }` | `Workspace.withFolder` (enclosure detected) |

---

## Interaction with Other BCs

```text
BC5 LspServer
     │
     │  textDocument/didOpen
     │  textDocument/didChange
     │  textDocument/didClose
     ▼
BC4 WorkspaceService  ──── calls ────►  BC2 MarkdownDocFactory
     │                                  (construct / update MarkdownDoc
     │                                   current code: OFMDocFactory)
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
