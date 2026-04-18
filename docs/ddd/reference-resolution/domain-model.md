---
title: "BC3 — Reference Resolution Domain Model"
tags:
  - ddd/domain-model
  - ddd/bc3
  - ddd/reference-resolution
  - architecture
aliases:
  - reference resolution domain model
  - BC3 domain model
  - RefGraph model
---

# BC3 — Reference Resolution Domain Model

This document is the authoritative domain model for **Bounded Context 3: Reference Resolution**. BC3 is the **Core subdomain** — it is the primary differentiating capability of `flavor-grenade-lsp`. Everything that makes the server useful for an Obsidian vault (go-to-definition, backlinks, broken-link diagnostics, rename) lives here.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[document-lifecycle/domain-model]], [[vault/domain-model]].

> [!NOTE]
> BC3 is deliberately isolated from BC4's internal naming. The `Oracle` is the only seam. RefGraph never imports VaultIndex or FolderLookup. This is the anti-corruption layer that keeps the core subdomain pure and testable.

---

## Subdomain Classification

| Attribute | Value |
|-----------|-------|
| Type | Core subdomain (★) |
| Integration | Customer-Supplier (BC4 owns RefGraph, supplies Oracle) |
| Differentiator | First-class EmbedRef, BlockRef; alias Def; Oracle pattern |
| Comparable to | marksman's `Codebase` / `Doc` model, with OFM extensions |

---

## Aggregate: RefGraph

`RefGraph` is the single consistency boundary for the reference graph. All ref/def relationships across a vault are stored here. The graph is either fully rebuilt (`mk`) or incrementally updated (`update`). Between mutations, it is an immutable value.

### State

```text
RefGraph
├── refs:      Map<DocId, Ref[]>          — outgoing refs per document
├── defs:      Map<DocId, Def[]>          — defs (anchors, headings) per document
├── tags:      Set<string>                — all tag strings in the vault
├── resolved:  Map<RefId, Dest>           — ref → destination (resolved edges)
├── unresolved: Map<RefId, Unresolved>   — refs with no matching def
├── refDeps:   Map<DocId, Set<DocId>>    — which docs depend on which (for incremental)
└── backlinks: Map<DocId, RefId[]>        — reverse: docId → all refs pointing to it
```

### State Diagram

```text
                  ┌─────────────────────────────────────────────────────┐
                  │                     RefGraph                         │
                  │                                                       │
  RefGraph.mk ──► │  refs:      doc → outgoing Ref[]                     │
                  │                                                       │
 RefGraph.update ►│  defs:      doc → Def[] (headings, anchors, aliases) │
  (incremental)   │                                                       │
                  │  tags:      vault-wide tag set                        │
                  │                                                       │
                  │  resolved:  RefId → Dest        (resolved edges)      │
                  │  unresolved: RefId → Unresolved (broken refs)         │
                  │                                                       │
                  │  refDeps:   DocId → Set<DocId>  (dependency graph)   │
                  │  backlinks: DocId → RefId[]     (reverse index)       │
                  └─────────────────────────────────────────────────────┘
```

### Invariants

| # | Invariant |
|---|-----------|
| I1 | Every `RefId` in `resolved` has a corresponding entry in `refs`. The resolved and unresolved maps partition the ref set — a ref is in exactly one of them. |
| I2 | Every `CrossSection` ref (targeting `otherDoc#heading`) is accompanied by a synthetic `CrossDoc` ref targeting `otherDoc` with no fragment. If the `otherDoc` title changes, all `CrossSection` refs to it are re-resolved via `refDeps`. |
| I3 | `backlinks` is the exact transpose of `resolved`: if ref `r` in doc `A` resolves to doc `B`, then `backlinks[B]` contains `r`. |
| I4 | `aliases` declared in document frontmatter are present in `defs[docId]` with the same source range as the document-title `Def`. They participate in resolution equally with the title. |
| I5 | `EmbedRef` and `BlockRef` are resolved using the same algorithm as `WikiRef`. Their presence in `unresolved` means the embed/block target does not exist. |
| I6 | `refDeps[A]` contains `B` iff at least one `CrossRef` in `A` targets `B`. Used by `update` to determine which documents must be re-resolved when `B` changes. |

---

## Commands

### RefGraph.mk

Full rebuild from scratch. Called when the vault is first indexed or when a full re-index is requested.

```text
RefGraph.mk(oracle: Oracle, symMap: SymbolMap): RefGraph

SymbolMap
  └── Map<DocId, { refs: RawRef[]; defs: RawDef[] }>
      (built from OFMIndex of each OFMDoc in the vault)
```

**Algorithm:**

```text
1. For each (docId, { refs, defs }) in symMap:
   a. Normalize RawDef[] → Def[] (attach DocId, compute range)
   b. Add alias Defs from frontmatter
   c. Normalize RawRef[] → typed Ref[] (WikiRef | EmbedRef | BlockRef | TagRef)
   d. For each CrossSection ref: emit synthetic CrossDoc ref

2. Build FolderLookup index from all Defs

3. For each Ref in the vault:
   a. oracle.resolveToScope(sourceDoc, ref) → candidate DocId[]
   b. For each candidate: oracle.resolveInScope(ref, candidate) → Def[]
   c. If Def[] non-empty: record Dest in resolved
   d. Else: record Unresolved

4. Compute refDeps from resolved edges
5. Compute backlinks as transpose of resolved
6. Return immutable RefGraph
```

### RefGraph.update

Incremental update when one or more documents have changed. Only re-resolves affected documents.

```text
RefGraph.update(
  graph:   RefGraph,
  oracle:  Oracle,
  symDiff: SymbolDiff
): RefGraph

SymbolDiff
  ├── added:   Map<DocId, { refs: RawRef[]; defs: RawDef[] }>
  ├── changed: Map<DocId, { refs: RawRef[]; defs: RawDef[] }>
  └── removed: Set<DocId>
```

**Algorithm:**

```text
1. Compute affected = changed ∪ removed ∪ {docs that refDeps on changed/removed}
   (because a title change in B invalidates CrossSection refs in A that target B)

2. For removed docIds:
   a. Remove all refs/defs for that doc
   b. Remove resolved/unresolved edges originating from that doc
   c. Remove backlinks pointing to that doc

3. For added/changed docIds:
   a. Drop old refs/defs/edges for that doc
   b. Compute new Def[], Ref[] from symDiff entry
   c. Re-resolve all Refs in affected (using oracle)
   d. Rebuild refDeps, backlinks for affected docs

4. Return new immutable RefGraph
```

> [!TIP]
> The `refDeps` graph is the key performance win for incremental updates. Without it, every document change would require full re-resolution of the entire vault. With it, only documents that transitively reference the changed document are re-resolved.

---

## Domain Service: Oracle

The `Oracle` is the anti-corruption layer between `RefGraph` and `VaultIndex`. It is defined in BC3 as an interface and implemented in BC4 by `OracleAdapterService`.

`RefGraph` only ever sees the `Oracle` interface — it never sees `VaultIndex`, `FolderLookup`, or any other BC4 type.

### Interface

```typescript
interface Oracle {
  /**
   * Given a reference and the document it appears in, return the set of
   * documents that could plausibly be the target of this reference.
   *
   * For a WikiRef to "foo", this returns all DocIds whose stem, title, or
   * alias matches "foo" (exact or fuzzy, depending on config).
   *
   * For an IntraRef (same-document ref), returns [sourceDocId].
   */
  resolveToScope(sourceDoc: DocId, ref: Ref): DocId[]

  /**
   * Given a reference and a candidate scope (document), return the Def
   * values within that document that match the ref's fragment (heading,
   * anchor, or none for whole-document refs).
   *
   * Returns [] if the scope document has no matching Def.
   */
  resolveInScope(ref: Ref, scope: DocId): Def[]
}
```

### Resolution Semantics by Ref Type

| Ref Type | `resolveToScope` | `resolveInScope` |
|----------|-----------------|-----------------|
| `WikiRef` (no fragment) | docs matching stem/title/alias | document-title Def |
| `WikiRef` (with `#heading`) | docs matching stem/title/alias | heading Defs matching fragment |
| `EmbedRef` (no fragment) | docs matching stem/title/alias | document-title Def |
| `EmbedRef` (with `#heading`) | docs matching stem/title/alias | heading Defs matching fragment |
| `BlockRef` (`#^anchor`) | docs matching stem/title/alias | block anchor Defs matching anchor-id |
| `IntraRef` (`#heading`) | `[sourceDocId]` | heading Defs in source doc matching fragment |
| `IntraRef` (`#^anchor`) | `[sourceDocId]` | block anchor Defs in source doc |
| `TagRef` | all docs containing the tag | tag Def |

> [!NOTE]
> The Oracle implementation in BC4 uses `FolderLookup` for `resolveToScope`. Matching is exact by default, but the `completion.wiki.style` config key affects how stems are normalised before comparison. The Oracle's matching logic lives in BC4, not BC3.

---

## Value Objects

### WikiRef

```typescript
interface WikiRef {
  kind:     'wiki'
  target:   string          // raw target text, e.g. "notes/2024/foo"
  fragment: string | null   // heading text after '#', or null
  alias:    string | null   // display text after '|', or null
  range:    Range           // source range in the document
  id:       RefId
}
```

### EmbedRef

First-class ref type in flavor-grenade; not present in marksman.

```typescript
interface EmbedRef {
  kind:     'embed'
  target:   string          // raw target text
  fragment: string | null   // heading or null
  range:    Range
  id:       RefId
}
```

**OFM extension notes:**

- Embeds can target full documents (`![[doc]]`), headings (`![[doc#heading]]`), blocks (`![[doc#^anchor]]`), or images (non-Markdown — skipped by ref resolution).
- Image embeds (target ends in `.png`, `.jpg`, etc.) produce no `Ref` in the graph — they are captured in `OFMIndex` but excluded from `RefGraph`.

### BlockRef

First-class ref type in flavor-grenade; not present in marksman.

```typescript
interface BlockRef {
  kind:      'block'
  target:    string          // document stem/title
  anchorId:  string          // anchor-id after '#^'
  isEmbed:   boolean         // true if '![[...#^...]]'
  range:     Range
  id:        RefId
}
```

**Resolution:** `anchorId` is matched against `BlockAnchor` Def values in the target document. Mismatch → `Unresolved`.

### TagRef

```typescript
interface TagRef {
  kind:  'tag'
  tag:   string   // full tag text including '#', e.g. '#project/active'
  range: Range
  id:    RefId
}
```

**Resolution:** `tag` matched against the vault's `tags` set in `RefGraph`. Unmatched tags are not treated as errors by default (tags are freely invented). Diagnostics for unused/misspelled tags are opt-in.

### IntraRef

A specialisation of `WikiRef` / `EmbedRef` where the target is the same document (no document stem, only a fragment).

```typescript
type IntraRef = WikiRef & { target: '' }  // target is empty string
```

### CrossRef

A `WikiRef` or `EmbedRef` where the target refers to a different document.

```typescript
type CrossRef = WikiRef & { target: string }  // target is non-empty
```

### Def

```typescript
interface Def {
  kind:    'title' | 'heading' | 'block-anchor' | 'alias'
  text:    string    // the def's canonical text
  doc:     DocId     // which document this def lives in
  range:   Range     // source range of the def in the document
  level?:  number    // heading level (1–6), for 'heading' kind only
}
```

**Multiple Defs per document:**

```text
OFMDoc "foo.md"
  ├─ Def { kind: 'title',   text: 'Foo',         range: ... }
  ├─ Def { kind: 'alias',   text: 'Foo Note',    range: frontmatter.range }
  ├─ Def { kind: 'heading', text: 'Introduction', level: 2, range: ... }
  ├─ Def { kind: 'heading', text: 'See Also',     level: 2, range: ... }
  └─ Def { kind: 'block-anchor', text: '^key-point', range: ... }
```

### Unresolved

```typescript
interface Unresolved {
  ref:    Ref
  source: DocId
  reason: 'no-matching-doc' | 'no-matching-def' | 'ambiguous'
}
```

| Reason | Meaning |
|--------|---------|
| `no-matching-doc` | Oracle returned empty scope for the ref target |
| `no-matching-def` | Oracle found the document but no Def matched the fragment |
| `ambiguous` | Oracle returned multiple scopes (multiple docs with the same stem) and none had a matching Def |

### Dest

```typescript
interface Dest {
  doc: DocId
  def: Def
}
```

The fully resolved destination of a `Ref`. Converted to an LSP `Location` by BC5.

---

## OFM Extensions vs marksman

This table documents where flavor-grenade's `RefGraph` diverges from marksman's domain model.

| Feature | marksman | flavor-grenade |
|---------|---------|---------------|
| `EmbedRef` | Not modelled (treated as regular link or ignored) | First-class `Ref` type; participates in full resolution |
| `BlockRef` | Not modelled | First-class `Ref` type; matches `BlockAnchor` Defs |
| Frontmatter `aliases` | Document has one title Def | Aliases produce additional `Def` values with `kind: 'alias'` |
| Tag resolution | Tags are indexed, no cross-doc tag graph | `TagRef` participates in `RefGraph`; vault-wide tag set in `RefGraph.tags` |
| Image embeds | N/A | `![[image.png]]` captured in `OFMIndex` but excluded from `RefGraph` |
| `CrossSection` synthetic ref | Present | Present (same invariant) |
| `IntraRef` | Present | Present |

> [!NOTE]
> marksman's `Oracle` pattern is used here without modification for the cross-document scope resolution architecture. The difference is that flavor-grenade's Oracle must also handle `BlockRef` anchor matching and `EmbedRef` semantics, which marksman's Oracle does not address.

---

## Query API

```typescript
// Read-only queries on a RefGraph value

RefGraph.refsFrom(graph: RefGraph, doc: DocId): Ref[]
// All outgoing refs in the given document

RefGraph.defsIn(graph: RefGraph, doc: DocId): Def[]
// All defs (title, headings, anchors, aliases) in the given document

RefGraph.resolvedEdges(graph: RefGraph): Map<RefId, Dest>
// All resolved ref→dest pairs in the vault

RefGraph.unresolvedRefs(graph: RefGraph): Unresolved[]
// All refs that could not be resolved

RefGraph.backlinks(graph: RefGraph, doc: DocId): Array<{ ref: Ref; source: DocId }>
// All refs in other documents that point to the given document

RefGraph.defAt(graph: RefGraph, doc: DocId, position: Position): Def | null
// The Def at a given cursor position (for go-to-definition on the def side)

RefGraph.refAt(graph: RefGraph, doc: DocId, position: Position): Ref | null
// The Ref at a given cursor position (for go-to-definition on the ref side)

RefGraph.allTags(graph: RefGraph): Set<string>
// All tag strings across the vault (for tag completion)
```
