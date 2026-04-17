---
title: Document Model — OFMDoc Lifecycle and Structure
tags: [concepts, document-model, ofmdoc, parse-pipeline, ofmindex]
aliases: [ofmdoc, document-lifecycle, parse-pipeline, ofm-parse]
---

# Document Model — OFMDoc Lifecycle and Structure

`OFMDoc` is the primary document entity in `flavor-grenade-lsp`. It is an immutable value type that carries the full state of a single Markdown document as understood by the OFM parse pipeline. Every feature service in the system operates on `OFMDoc` values — they never hold references to mutable document state.

---

## OFMDoc as an Immutable Value Type

The single most important property of `OFMDoc` is that it is **never mutated**. When an editor sends `textDocument/didChange`, a new `OFMDoc` is constructed to replace the old one. The old value is dereferenced and garbage-collected.

This design choice cascades through the system:

- `RefGraph` receives a `SymbolDiff` (old vs new index), not the documents themselves. It never holds live references to an `OFMDoc`.
- `DiagnosticService` can snapshot the `OFMDoc` at the start of a diagnostic run and be certain the document will not change under it.
- Unit tests can construct arbitrary `OFMDoc` values without managing lifecycle hooks.
- The parse pipeline is a pure function: `parse(text) → OFMDoc`. Same input always produces the same output.

```
                        textDocument/didChange
                               │
                               ▼
                         new text arrives
                               │
                    OFMParser.parse(newText)
                               │
                               ▼
                    new OFMDoc constructed
                               │
                   old OFMDoc → GC (dereferenced)
                               │
                    VaultFolder.withDoc(newDoc)
```

---

## Identity: DocId

Every `OFMDoc` has a `DocId` that serves as its canonical identity throughout the system:

```typescript
type DocId = {
  uri: string             // LSP URI, e.g. "file:///vault/notes/daily.md"
  vaultRelPath: VaultPath // vault-relative path, e.g. VaultPath("notes/daily.md")
}
```

`DocId` is stable across document edits — the `uri` and `vaultRelPath` do not change when the content changes. Only a file rename produces a new `DocId`.

`DocId` is used as the key in `VaultFolder`'s document map, as the scope identifier in `ScopedSym`, and as the lookup key in `RefGraph.refDeps`.

See [[concepts/path-model]] for the full type hierarchy (`VaultPath`, `Slug`, `AbsPath`, `WikiEncoded`).

---

## State Triple: (text, structure, index)

An `OFMDoc` holds three tightly coupled pieces of state that are always consistent with each other:

```typescript
type OFMDoc = {
  id:        DocId
  version:   number | null   // null = disk-loaded; number = editor-open
  text:      string          // raw UTF-8 text of the document
  structure: OFMStructure    // CST/AST produced by OFMParser
  index:     OFMIndex        // fast-lookup projection of the structure
}
```

The three are **always in sync**. There is no intermediate state where `text` has been updated but `index` has not. The constructor is the only way to create an `OFMDoc`, and the constructor always runs the full parse pipeline.

### Version Semantics

| `version` value | Meaning |
|----------------|---------|
| `null` | Document was loaded from disk (via `FileWatcher` or initial vault scan). No editor has opened it. |
| `number` (≥ 0) | Document is open in the editor. The version number matches the `version` field from the LSP `VersionedTextDocumentIdentifier`. |

Version `null` documents are valid for all cross-reference resolution purposes — they contribute their symbols to `RefGraph` like any editor-open document. They differ only in that they do not trigger `textDocument/publishDiagnostics` — diagnostics are only published for documents with `version ≥ 0` (editor-open documents).

---

## OFMIndex — Fast-Lookup Projection

The `OFMIndex` is a denormalized projection of the CST/AST optimized for the queries that feature services make repeatedly:

```typescript
type OFMIndex = {
  wikiLinks:     WikiLink[]        // all [[...]] occurrences with positions
  embeds:        Embed[]           // all ![[...]] occurrences
  blockAnchors:  BlockAnchor[]     // all ^id occurrences
  tags:          Tag[]             // all #tag occurrences
  headings:      Heading[]         // all ATX/Setext headings with level + text
  callouts:      Callout[]         // all > [!type] callout blocks
  frontmatter:   FrontmatterMap    // parsed YAML frontmatter key-value pairs
  linkDefs:      LinkDef[]         // [label]: url reference definitions
  ignoreRegions: TextRange[]       // opaque regions (math, code, comments)
}
```

The `OFMIndex` is built once per parse and never mutated. Feature services access it via typed property reads — `index.wikiLinks`, `index.headings` — rather than traversing the full CST.

`SymbolDiff` (used by `VaultFolder`) is computed by comparing two `OFMIndex` values. The diff algorithm is O(N + M) where N and M are the element counts in the two indexes — each element type is diffed independently using its canonical key (e.g., heading slug, block anchor ID, wiki-link target).

---

## Parse Pipeline — 8 Stages

The OFM parse pipeline is a sequential, pure transformation. Each stage receives the output of the previous stage. No stage mutates its input.

### Stage 1: Raw Text Input

The raw UTF-8 string from the editor or from disk. No normalization at this stage — the text is preserved byte-for-byte so that LSP positions (line/character offsets) computed later remain valid.

### Stage 2: Frontmatter Extraction

The parser checks whether the document begins with `---` followed by a YAML block terminated by `---` or `...`. If found, the frontmatter region is extracted and parsed as YAML. Key fields consumed:

- `aliases:` → creates `AliasDef` entries
- `tags:` → creates `TagRef` entries in the document scope (inline tags are also extracted in stage 4)
- `title:` → optionally used as display label in completion items

The frontmatter region is marked as an `ignoreRegion` for subsequent inline-element tokenization — wiki-link patterns inside YAML values are not parsed as wiki-links.

### Stage 3: Ignore Region Marking

Certain document regions are opaque to OFM element tokenization. The parser identifies and marks them before running the wiki-link tokenizer:

| Region type | Syntax | Why ignored |
|-------------|--------|-------------|
| Fenced code block | ` ```...``` ` | `[[link]]` inside code is literal text |
| Inline code | `` `...` `` | Same reason |
| Math block | `$$...$$` or `$...$` | LaTeX does not contain wiki-links |
| Obsidian comment | `%%...%%` | OFM comment — invisible to readers |
| Templater block | `<%...%>` or `<%-...-%>` | Template syntax, not rendered content |

`ignoreRegions` from this stage are stored in `OFMIndex.ignoreRegions` and are used by all feature services to avoid offering completions or highlights inside opaque regions.

### Stage 4: OFM Element Tokenization

The core OFM-specific tokenization pass. Runs over the non-ignored regions and extracts:

- `[[target]]`, `[[target|label]]`, `[[target#anchor]]`, `[[target#^blockid]]` → `WikiLink` tokens
- `![[target]]`, `![[target|label]]` → `Embed` tokens
- `#tag`, `#tag/subtag` → `Tag` tokens
- `^blockid` (at end of line or paragraph) → `BlockAnchor` tokens
- `> [!type]` callout opening lines → `CalloutOpener` tokens

> [!important] Tokenization before CommonMark
> OFM element tokenization runs **before** CommonMark inline parsing. This is the key ordering constraint. CommonMark's bracket-balance algorithm would otherwise misparse `[[double bracket]]` as two nested link constructs. By tokenizing wiki-links first, the brackets are consumed before CommonMark's parser sees them.

### Stage 5: CommonMark Parsing

With OFM tokens extracted and ignore regions marked, the CommonMark parser processes the remainder of the document. It produces standard block structure: ATX headings, Setext headings, blockquotes (which may contain callouts), lists, thematic breaks, link reference definitions.

The CommonMark parser is configured to be lenient — it does not hard-fail on malformed input. OFM documents in the wild often contain mixed content.

### Stage 6: CST Construction

The Concrete Syntax Tree is assembled from the OFM tokens (stage 4) and CommonMark blocks (stage 5). Every node carries:

- Start and end positions (line + character, 0-indexed, matching LSP convention)
- The original text range
- Node type (e.g., `WikiLinkNode`, `HeadingNode`, `EmbedNode`)

The CST preserves all syntactic detail needed for accurate feature service responses — a `DefinitionService` response must return the exact source range of the target definition, which requires the CST position data.

### Stage 7: AST Resolution

The AST is a semantically enriched version of the CST. At this stage, relative paths in wiki-links are resolved against the current document's `VaultPath`. Heading slugs are computed (lowercased, spaces replaced with hyphens, special chars stripped) and attached to `HeadingNode`s. Block anchor IDs are validated (must match `^[a-z0-9-]+$`).

The AST does **not** do cross-document resolution — that is `RefGraph`'s responsibility. The AST only resolves document-internal structure.

### Stage 8: Index Projection

The `OFMIndex` is built as a flat projection of the AST. Each element type is extracted into a typed array sorted by document position. This is the structure that `VaultFolder.withDoc()` diffs to compute `SymbolDiff`, and that all feature services query during request handling.

---

## Parse Pipeline Summary Diagram

```
Raw text
  │
  ▼ Stage 2
Frontmatter extracted → FrontmatterMap
  │
  ▼ Stage 3
Ignore regions marked → ignoreRegions[]
  │
  ▼ Stage 4
OFM element tokenization → WikiLink[], Embed[], Tag[], BlockAnchor[], Callout[]
  │
  ▼ Stage 5
CommonMark parsing → Heading[], List[], Blockquote[], LinkDef[]
  │
  ▼ Stage 6
CST construction → positioned node tree
  │
  ▼ Stage 7
AST resolution → slugs, validated anchors, relative path resolution
  │
  ▼ Stage 8
OFMIndex projection → fast-lookup typed arrays
  │
  ▼
OFMDoc { id, version, text, structure, index }
```

---

## Cross-References

- [[concepts/path-model]] — DocId, VaultPath, Slug type definitions
- [[concepts/symbol-model]] — Sym/Def/Ref hierarchy built from OFMIndex
- [[concepts/connection-graph]] — How OFMIndex feeds RefGraph.update
- [[concepts/ofm-syntax]] — Full OFM element taxonomy reference
- [[architecture/data-flow]] — OFMDoc in the didChange flow
- [[architecture/layers]] — DocumentModule and ParserModule placement
