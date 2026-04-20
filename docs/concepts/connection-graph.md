---
title: Connection Graph — RefGraph and Oracle
tags: [concepts, reference-resolution, refgraph, oracle, ofm]
aliases: [refgraph, connection-graph, oracle-pattern, ref-resolution]
---

# Connection Graph — RefGraph and Oracle

The `RefGraph` is the central data structure for cross-document navigation in `flavor-grenade-lsp`. It is the direct analog of marksman's `Conn` type, adapted for OFM's richer reference taxonomy. At any given moment, `RefGraph` holds the complete bipartite graph mapping every `Ref` node in the vault to zero or more `Def` nodes.

---

## Purpose

The graph answers three classes of queries:

1. **Go to definition** — Given a `Ref` at a cursor position, what `Def`(s) does it resolve to?
2. **Find references** — Given a `Def`, what `Ref`s across the vault point to it?
3. **Diagnostics** — Which `Ref`s could not be resolved to any `Def`?

All feature services (`DefinitionService`, `ReferencesService`, `DiagnosticService`) consult the graph via the `Oracle` interface. They never manipulate the graph directly.

---

## Graph Structure

```text
RefGraph
├── resolved: Map<ScopedSym(Ref), ScopedSym(Def)[]>
│       "resolved" edges — the primary bipartite graph
├── unresolvedRefs: Set<ScopedSym(Ref)>
│       "broken" refs that matched no Def — the unresolved side-graph
├── refDeps: Map<DocId, Set<DocId>>
│       cross-document dependency index:
│       refDeps[A] = { B, C } means doc A has refs into docs B and C
│       used to determine which docs to re-check when B or C changes
└── lastTouched: Set<ScopedSym>
        ScopedSyms whose resolution state changed in the last update()
        drives selective diagnostic republishing
```

### Bipartite Graph

The `resolved` map is the heart of the graph. Its keys are `ScopedSym(Ref)` values (a ref paired with its containing scope — typically the `DocId` of the document that contains it). Its values are arrays of `ScopedSym(Def)` — one `Def` per plausible resolution target.

Most refs resolve to exactly one def. Ambiguous resolution (e.g., `[[daily]]` matching both `notes/daily.md` and `journal/daily-notes.md`) produces multiple entries in the value array. `DefinitionService` sorts ambiguous results by path length (shorter = more specific) and presents all candidates to the editor.

### Unresolved Side-Graph

Refs that match no def are placed in `unresolvedRefs`. This set is the input to `DiagnosticService`. A ref moves out of `unresolvedRefs` when a new document is added to the vault whose slug matches the ref's target — this is the common case when the user types a wiki-link to a note they haven't created yet, then creates it.

### Cross-Document Dependency Index

`refDeps` maps each document to the set of documents it references. When document B changes (its symbols change), all documents in `refDeps⁻¹[B]` (i.e., all documents that reference B) must be re-checked for resolution changes. This is what limits diagnostic republishing to the affected subgraph rather than the full vault.

---

## `RefGraph.mk` vs `RefGraph.update`

### `RefGraph.mk` — Full Rebuild

```typescript
RefGraph.mk(oracle: Oracle, allSyms: ScopedSym[]): RefGraph
```

Called at:

- Vault initialization (first `workspace/didChangeWorkspaceFolders` or first document open)
- File deletion events (the deleted document's defs must be purged and all its incoming refs re-evaluated)
- Explicit `workspace/executeCommand: flavorGrenade.rebuildIndex`

`RefGraph.mk` iterates all `ScopedSym`s in the vault, resolves each `Ref` against the full symbol set, and builds the graph from scratch. For a 5000-note vault this takes ~200ms on first load; subsequent calls are rare.

### `RefGraph.update` — Incremental Delta

```typescript
RefGraph.update(oracle: Oracle, symDiff: SymbolDiff): RefGraph
```

Called on every `textDocument/didChange` notification. `symDiff` contains only the symbols that changed since the last version of a document:

```typescript
SymbolDiff {
  added:   ScopedSym[]   // new symbols introduced by the edit
  removed: ScopedSym[]   // symbols that no longer exist after the edit
}
```

`RefGraph.update` processes removals first (purging stale edges and moving affected refs to `unresolvedRefs` if their def was removed), then additions (attempting to resolve previously unresolved refs against newly added defs, and resolving the new refs against existing defs).

The resulting graph is a new `RefGraph` value — `RefGraph` is immutable, consistent with [[concepts/document-model]]'s immutability principle. The old `RefGraph` is discarded.

> [!note] Why immutable?
> Immutability means `DiagnosticService` can hold a reference to the previous `RefGraph` snapshot during its async re-evaluation loop without risk of the graph changing under it. The NestJS event loop serializes the `update()` call and the diagnostic run, but immutability makes the invariant explicit and verifiable.

---

## Oracle Pattern

The `Oracle` is the query interface over `RefGraph`. Feature services depend on `Oracle`, not on `RefGraph` directly. This separation allows `Oracle` to be mocked in unit tests without constructing a full graph.

### Core Oracle Operations

```typescript
interface Oracle {
  // Resolve a ref to the scope(s) it could belong to
  resolveToScope(scope: Scope, ref: Ref): Scope[]

  // Within a given scope, find all Defs that match a ref
  resolveInScope(ref: Ref, scope: Scope): Def[]

  // Find all refs that point to a given def
  findRefs(def: Def): ScopedSym[]

  // All defs in a given scope
  defsInScope(scope: Scope): Def[]

  // All unresolved refs, optionally filtered by scope
  unresolvedRefs(scope?: Scope): ScopedSym[]
}
```

`resolveToScope` answers "which documents could this ref be targeting?" before committing to a specific def. For `CrossDoc` refs, this is usually one or two documents (exact match + alias match). For `IntraRef`, the scope is always `Doc(currentDocId)`.

`resolveInScope` answers "within this document's scope, what def does this ref target?" For heading refs (`[[doc#heading]]`), this returns the `HeaderDef` matching the heading slug.

---

## OFM Extensions to the Marksman Model

### EmbedRef and BlockRef as First-Class Ref Types

In marksman, the reference type set is: `WikiLink`, `IntraLink`, `LinkDef`. OFM adds:

- **`EmbedRef`** — `![[file]]` or `![[file#heading]]`. Resolves the same as the corresponding `CrossDoc`/`CrossSection`, but the resolution result has type `EmbedDest` (which carries MIME type information for image/audio embeds). `DiagnosticService` produces `BrokenEmbed` (not `BrokenLink`) diagnostics for unresolved embeds.
- **`CrossBlock`** — `[[doc#^blockid]]`. Resolves to a `BlockAnchorDef` in the target document's scope. If the block anchor does not exist in the target document, the ref is unresolved and produces a `BrokenBlockRef` diagnostic.

### Aliases via `AliasDef`

OFM's `aliases:` frontmatter key creates additional def entries for a document alongside its primary `DocDef`. For example, a document `notes/meeting-2026.md` with frontmatter `aliases: [meeting notes, Q1 meeting]` generates:

```typescript
DocDef         { docId, slug: "meeting-2026" }
AliasDef       { docId, alias: "meeting notes", normalised: "meeting-notes" }
AliasDef       { docId, alias: "Q1 meeting", normalised: "q1-meeting" }
```

A wiki-link `[[meeting notes]]` resolves via the `AliasDef` to the same document. This is entirely absent from marksman's model.

### Tag Resolution — Global Scope, No Diagnostics

`TagRef` (`#tag`, `#tag/subtag`) always resolves to the `Global` scope, not to a specific document. Tags are never added to `unresolvedRefs` — the vault does not require tags to be declared before use (unlike wiki-links, which require a corresponding document). `DiagnosticService` skips `TagRef` symbols entirely when scanning for broken refs.

---

## `lastTouched` Delta and Diagnostic Republishing

After every `RefGraph.update`, the `lastTouched` set contains the `ScopedSym`s whose resolution state changed in that call:

- A ref that was unresolved and is now resolved → added to `lastTouched`
- A ref that was resolved and is now unresolved → added to `lastTouched`
- A def that gained or lost incoming refs → its document is added to `lastTouched`

`DiagnosticService` iterates `lastTouched`, groups by `DocId`, and re-runs diagnostic evaluation only for the affected documents. The resulting `Diagnostic[]` arrays are published via `textDocument/publishDiagnostics`.

Documents whose resolution state did not change receive no new diagnostic publication — the editor retains its existing diagnostic markers for those documents.

---

## OFM-Specific Invariants

The following invariants are maintained by `RefGraph` at all times. Violation of any invariant is a programming error, not a user error:

1. **Block anchors are scoped defs** — `BlockAnchorDef` entries are always in `Doc(docId)` scope, never in `Global` scope.
2. **Embed resolution mirrors wiki-link resolution** — An `EmbedRef` to `[[file]]` resolves identically to a `CrossDoc` to `[[file]]`, plus the `EmbedDest` wrapper. If the underlying `CrossDoc` resolution changes, the `EmbedRef` resolution changes too.
3. **Tags are always resolved** — No `TagRef` appears in `unresolvedRefs`. The `TagCompletionProvider` may offer a warning about unknown tags (configurable) but this is a feature-level concern, not a graph-level one.
4. **AliasDef entries are co-owned with DocDef** — When a document is removed, all its `AliasDef` entries are removed in the same `RefGraph.update` call. There are never dangling `AliasDef` entries without a corresponding `DocDef`.

---

## Cross-References

- [[concepts/symbol-model]] — Full Sym/Def/Ref type hierarchy
- [[concepts/document-model]] — OFMDoc and OFMIndex structure
- [[concepts/workspace-model]] — VaultFolder and SymbolDiff computation
- [[architecture/data-flow]] — How RefGraph.update fits into the change pipeline
- [[architecture/layers]] — ReferenceModule placement in the layer stack
