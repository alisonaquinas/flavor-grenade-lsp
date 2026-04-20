---
title: Symbol Model — Sym, Def, Ref, Tag Hierarchy
tags: [concepts, symbol-model, def, ref, sym, scoped-sym, scope]
aliases: [sym-hierarchy, def-types, ref-types, scoped-sym, scope-model]
---

# Symbol Model — Sym, Def, Ref, Tag Hierarchy

The symbol model is the vocabulary that connects the OFM parse pipeline to the reference resolution graph. Every element extracted from an `OFMDoc` is classified as a `Sym` — either a definition site (`Def`), a usage site (`Ref`), or a tag (`Tag`). `RefGraph` operates exclusively on `ScopedSym` values, which pair a `Sym` with the `Scope` in which it lives.

---

## Top-Level Union

```typescript
type Sym = Def | Ref | Tag
```

This three-way partition is fundamental:

- `Def` values are what other documents or the same document can reference.
- `Ref` values are what must be resolved against `Def` values.
- `Tag` values resolve to `Global` scope and are neither broken nor ambiguous.

All three are stored in `OFMIndex`, extracted into typed arrays during parse stage 8. The `SymbolExtractor` service in `ReferenceModule` lifts them to `ScopedSym` values before feeding `RefGraph`.

---

## `Scope`

```typescript
type Scope =
  | { kind: 'Doc';    docId: DocId }
  | { kind: 'Global' }
```

`Doc` scope is used for symbols that belong to a specific document: every `Def` is in `Doc` scope (a heading belongs to its document, a block anchor belongs to its document). Intra-document `Ref`s that target headings or block anchors within the same file are also in `Doc` scope.

`Global` scope is used for `Tag` symbols. Tags are vault-wide — `#project` in document A and `#project` in document B refer to the same tag. The `Oracle` can enumerate all `TagRef`s across the vault via `defsInScope(Global)` and `defsInScope(Doc(id))`.

---

## `ScopedSym`

```typescript
type ScopedSym = { scope: Scope; sym: Sym }
```

`ScopedSym` is the **unit of currency** in `RefGraph`. The `resolved` map, the `unresolvedRefs` set, `refDeps`, and `lastTouched` all store `ScopedSym` values. Never raw `Sym` values alone.

The pairing with `Scope` is essential because the same heading text (e.g., `## Introduction`) can appear in dozens of documents. Without the scope, the heading slug `introduction` would be ambiguous. `ScopedSym { scope: Doc(docId), sym: HeaderDef("introduction") }` is unambiguous.

---

## `Def` Subtypes

### `DocDef`

```typescript
type DocDef = {
  kind:    'DocDef'
  docId:   DocId
  slug:    Slug     // derived from file name stem
  title?:  string   // h1 text if present, else stem
}
```

`DocDef` represents the document itself as a referenceable entity. Every document in the vault contributes exactly one `DocDef` to its scope. `[[meeting-notes]]` resolves to the `DocDef` of the document whose slug is `meeting-notes`.

`DocDef.title` is populated from the first h1 heading in the document (or the `title:` frontmatter key). It is used as the label in completion items and hover previews.

### `TitleDef`

```typescript
type TitleDef = {
  kind:   'TitleDef'
  docId:  DocId
  text:   string   // raw h1 text
  range:  Range    // LSP range of the h1 heading
}
```

`TitleDef` represents the h1 heading of a document. It is distinct from `DocDef` because it carries position information and can be renamed independently via `textDocument/rename`.

When a document has exactly one h1, `TitleDef` and `DocDef.title` refer to the same text. When there is no h1, `TitleDef` is absent and `DocDef.title` falls back to the file stem.

### `HeaderDef`

```typescript
type HeaderDef = {
  kind:  'HeaderDef'
  docId: DocId
  level: 2 | 3 | 4 | 5 | 6   // heading level (1 = TitleDef)
  text:  string               // raw heading text
  slug:  Slug                 // normalized for anchor matching
  range: Range
}
```

`HeaderDef` represents h2–h6 headings. The `slug` is used to match heading anchors in wiki-links: `[[doc#my-heading]]` resolves to the `HeaderDef` whose `slug = Slug.ofString("my-heading")`.

Multiple headings with the same text in one document produce `HeaderDef`s with the same slug. In this case, wiki-link resolution is ambiguous and `Oracle.resolveInScope` returns all matches. Obsidian itself handles this the same way — it targets the first match.

### `BlockAnchorDef`

```typescript
type BlockAnchorDef = {
  kind:    'BlockAnchorDef'
  docId:   DocId
  anchorId: string   // the text after "^", e.g. "ab12c"
  range:    Range    // range of the "^id" token
}
```

`BlockAnchorDef` is an OFM-specific addition with no marksman equivalent. A block anchor `^ab12c` placed at the end of a paragraph or list item creates a `BlockAnchorDef` in the document's scope. `[[doc#^ab12c]]` resolves to this def.

Block anchor IDs must match `^[a-z0-9-]+$` (Obsidian's requirement). IDs that fail this validation are tokenized as `BlockAnchor` nodes but produce a `MalformedBlockAnchor` diagnostic and are **not** added to `OFMIndex.blockAnchors` (they cannot be referenced).

### `AliasDef`

```typescript
type AliasDef = {
  kind:      'AliasDef'
  docId:     DocId
  alias:     string   // raw alias text from YAML
  slug:      Slug     // Slug.ofString(alias)
  frontmatterRange: Range
}
```

`AliasDef` is OFM-specific — absent from marksman's model. It is created for each entry in a document's `aliases:` frontmatter array. A document with `aliases: [meeting notes, Q1 review]` creates two `AliasDef`s alongside its `DocDef`.

`[[meeting notes]]` resolves to the document's `DocDef` **via** the `AliasDef`. The `Oracle` returns the `DocDef` as the resolution target, not the `AliasDef` — the alias is a lookup intermediary, not a separate definition.

`AliasDef`s participate in `RefGraph.update` — if the `aliases:` list changes, the added/removed `AliasDef`s appear in `SymbolDiff`.

### `LinkDefDef`

```typescript
type LinkDefDef = {
  kind:   'LinkDefDef'
  docId:  DocId
  label:  string   // the [label] reference label
  url:    string   // the target URL
  range:  Range
}
```

`LinkDefDef` represents CommonMark `[label]: url` link reference definitions. These are used by standard `[text][label]` inline links. They are included in the symbol model for completeness but are lower priority than OFM-native ref types in `DefinitionService`.

---

## `Ref` Subtypes

### `IntraRef`

```typescript
type IntraRef = {
  kind:    'IntraRef'
  docId:   DocId
  target:  { heading?: string; block?: string }  // "#heading" or "#^block"
  range:   Range
}
```

`IntraRef` is a within-document reference: `[[#heading]]` or `[[#^blockid]]`. It resolves to a `HeaderDef` or `BlockAnchorDef` in the same document's scope. `IntraRef`s do not appear in `refDeps` because they cannot create cross-document dependencies.

An unresolved `IntraRef` (referencing a non-existent heading or block anchor) produces a `BrokenIntraLink` diagnostic.

### `CrossRef` — Three Kinds

`CrossRef` covers all wiki-links that target another document:

#### `CrossDoc`

```typescript
type CrossDoc = {
  kind:   'CrossDoc'
  docId:  DocId    // containing document
  target: string   // wiki-link target text (before #)
  label?: string   // alias label (after |)
  range:  Range
}
```

`[[meeting-notes]]` or `[[meeting-notes|our meeting]]` — targets a document. Resolves to a `DocDef` or `AliasDef` (which in turn leads to a `DocDef`).

#### `CrossSection`

```typescript
type CrossSection = {
  kind:    'CrossSection'
  docId:   DocId
  target:  string   // document target
  heading: string   // heading anchor (after #, before ^ if any)
  label?:  string
  range:   Range
}
```

`[[meeting-notes#agenda]]` — targets a specific heading in another document. Resolves to a `HeaderDef` in the target document's scope.

If the target document exists but the heading does not, `Oracle` produces a `BrokenSection` diagnostic (not `BrokenLink`). If the target document does not exist, `BrokenLink` is produced (the heading cannot be checked).

#### `CrossBlock`

```typescript
type CrossBlock = {
  kind:     'CrossBlock'
  docId:    DocId
  target:   string   // document target
  blockId:  string   // block anchor ID (after #^)
  label?:   string
  range:    Range
}
```

`[[meeting-notes#^ab12c]]` — targets a block anchor in another document. OFM-specific; marksman has no equivalent. Resolves to a `BlockAnchorDef` in the target document's scope.

> [!note] CrossBlock → CrossDoc synthesis
> When resolving a `CrossBlock`, the resolver always performs a `CrossDoc` resolution first to confirm the target document exists, then resolves the block anchor within it. If the document exists but the block anchor does not, a `BrokenBlockRef` diagnostic is produced. This two-stage resolution is called **CrossBlock → CrossDoc synthesis**.

### `EmbedRef`

```typescript
type EmbedRef = {
  kind:     'EmbedRef'
  docId:    DocId
  target:   string
  anchor?:  string
  range:    Range
  mimeHint: 'markdown' | 'image' | 'audio' | 'video' | 'pdf' | 'unknown'
}
```

`![[file]]` — embeds another document or media file inline. OFM-specific. The `mimeHint` is derived from the file extension (`.png` → `image`, `.mp3` → `audio`, `.pdf` → `pdf`, `.md` → `markdown`, etc.) and is used by `HoverService` to display appropriate previews.

Embed resolution mirrors wiki-link resolution for `.md` targets. For non-markdown targets, resolution checks file existence in the vault via `VaultIndex.fileExists()` rather than consulting `RefGraph`.

Unresolved embed refs produce `BrokenEmbed` diagnostics (distinct from `BrokenLink` to allow editor clients to style them differently).

### `TagRef`

```typescript
type TagRef = {
  kind:  'TagRef'
  docId: DocId
  tag:   string   // full tag text, e.g. "project/active"
  range: Range
}
```

`#tag` or `#tag/subtag`. Always resolves to `Global` scope. Never produces a broken-ref diagnostic. `TagRef`s are indexed in `OFMIndex.tags` and contribute to the vault-wide tag set used by `TagCompletionProvider`.

Tag hierarchy is represented by the `/` separator: `#project/active` is a subtag of `#project`. `Oracle.defsInScope(Global)` returns all unique tag strings across the vault, which are used to populate `VaultIndex.tagSet`.

---

## Summary Diagram

```text
Sym
├── Def
│   ├── DocDef          ← document itself as referenceable target
│   ├── TitleDef        ← h1 heading (carries range for rename)
│   ├── HeaderDef       ← h2-h6 headings (level + slug)
│   ├── BlockAnchorDef  ← ^blockid anchor  [OFM-specific]
│   ├── AliasDef        ← aliases: frontmatter entry  [OFM-specific]
│   └── LinkDefDef      ← [label]: url CommonMark reference definition
│
├── Ref
│   ├── IntraRef        ← [[#heading]] or [[#^block]]
│   ├── CrossDoc        ← [[doc]] or [[doc|label]]
│   ├── CrossSection    ← [[doc#heading]]
│   ├── CrossBlock      ← [[doc#^blockid]]  [OFM-specific]
│   ├── EmbedRef        ← ![[file]]  [OFM-specific]
│   └── TagRef          ← #tag (always Global scope)
│
└── Tag                 ← (alias for TagRef in some contexts; see Oracle)

ScopedSym = { scope: Scope, sym: Sym }
Scope = Doc(DocId) | Global
```

---

## Cross-References

- [[concepts/connection-graph]] — How ScopedSym values are wired in RefGraph
- [[concepts/document-model]] — How OFMIndex carries typed arrays of these symbols
- [[concepts/path-model]] — DocId and Slug type definitions
- [[concepts/ofm-syntax]] — Syntax that generates each symbol type
- [[design/domain-layer]] — DDD analysis of the symbol subdomain
