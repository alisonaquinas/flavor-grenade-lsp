---
title: "BC2 — Document Lifecycle Domain Model"
tags:
  - ddd/domain-model
  - ddd/bc2
  - ddd/document-lifecycle
  - architecture
aliases:
  - document lifecycle domain model
  - BC2 domain model
  - OFMDoc model
---

# BC2 — Document Lifecycle Domain Model

This document is the authoritative domain model for **Bounded Context 2: Document Lifecycle**. BC2 is a Supporting subdomain that owns the in-memory representation of a single Obsidian Flavored Markdown document: its text, parsed structure (CST + AST), and derived index.

BC2 is the workhorse that all other BCs depend on. BC3 reads `OFMIndex` to extract refs and defs. BC4 stores `OFMDoc` collections. BC5 creates and mutates `OFMDoc` values in response to LSP notifications.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[ddd/reference-resolution/domain-model]], [[ddd/vault/domain-model]].

> [!NOTE]
> BC2 contains no reference resolution logic. It parses and indexes. Whether a wikilink resolves to a real document is BC3's concern, not BC2's.

---

## Aggregate: OFMDoc

`OFMDoc` is the primary aggregate. Its identity is `DocId`. Its state is the triple `(text, structure, index)`, which is always consistent — never partially stale. Every text change triggers a complete, synchronous re-parse.

### State

```text
OFMDoc
├── id:        DocId                  — identity; immutable after construction
├── text:      string                 — raw UTF-8 document text
├── structure: Structure              — parsed CST + AST (derived from text)
├── index:     OFMIndex               — typed element collections (derived from AST)
└── version:   number | null          — null = disk; n = editor-open version n
```

### State Diagram

```text
                     ┌──────────────────────────────────────────────────┐
                     │                    OFMDoc                         │
                     │                                                    │
  OFMDoc.mk ───────► │  id: DocId        (immutable)                     │
  OFMDoc.fromLsp     │                                                    │
  OFMDoc.tryLoad     │  text: string     ◄─── withText / applyLspChange  │
                     │                                                    │
                     │  structure: Structure  ◄── always rebuilt with text│
                     │    ├─ cst: CST                                     │
                     │    └─ ast: AST                                     │
                     │                                                    │
                     │  index: OFMIndex  ◄──── always rebuilt with text  │
                     │                                                    │
                     │  version: number | null                             │
                     │    null  = disk state                              │
                     │    n > 0 = editor open, version n                  │
                     └──────────────────────────────────────────────────┘

  Text mutations:
    withText(text) ──────────────────┐
    applyLspChange(params) ──────────┤──► new text → ParsePipeline → new (structure, index)
                                     └──► atomic replacement; old values discarded
```

### Invariants

| # | Invariant |
|---|-----------|
| I1 | `(text, structure, index)` are always mutually consistent. There is no intermediate state where `text` has changed but `index` still reflects the old text. |
| I2 | `id` is immutable. A document's identity never changes. Moving a file produces a remove + add, not an in-place id change. |
| I3 | `version === null` iff the document was loaded from disk and has not been opened in an editor session. |
| I4 | `version` is monotonically increasing during an editor session. Applying a change with a lower version number than the current is a protocol error and is rejected. |
| I5 | `index.frontmatter` is `null` iff no valid YAML frontmatter block is present. Malformed YAML produces a `null` frontmatter (parse error is logged but not thrown). |
| I6 | `index.wikiLinks` and `index.embedLinks` contain nodes in source order (ascending by start position). |

---

## Commands

All commands are pure functions returning a new `OFMDoc`. They do not perform I/O (except `tryLoad`, which is explicitly async).

| Command | Signature | Description |
|---------|-----------|-------------|
| `OFMDoc.mk` | `(id: DocId, text: string) → OFMDoc` | Construct from a known DocId and raw text. Runs the full parse pipeline. Sets `version = null`. |
| `OFMDoc.fromLsp` | `(item: TextDocumentItem) → OFMDoc` | Construct from an LSP `TextDocumentItem`. Derives `DocId` from `item.uri`. Sets `version = item.version`. |
| `OFMDoc.tryLoad` | `(path: AbsPath, root: VaultRoot) → Promise<OFMDoc \| null>` | Read file from disk, construct `OFMDoc`. Returns `null` if the file does not exist or cannot be read. Sets `version = null`. |
| `OFMDoc.withText` | `(doc: OFMDoc, text: string, version?: number) → OFMDoc` | Replace full text. Runs full re-parse. Sets `version` if provided. |
| `OFMDoc.applyLspChange` | `(doc: OFMDoc, params: DidChangeTextDocumentParams) → OFMDoc` | Apply LSP content changes. For full sync: calls `withText`. For incremental sync: applies range edits sequentially, then re-parses. Always updates `version`. |

> [!NOTE]
> `applyLspChange` validates that `params.textDocument.version > doc.version` before applying. If the new version is not greater, the command logs a warning and returns the original `OFMDoc` unchanged. This protects against out-of-order LSP notifications.

---

## OFMIndex — Derived Projection

`OFMIndex` is the typed element collection derived from an `OFMDoc`'s AST. It is rebuilt atomically every time the document text changes. It is the primary interface BC3 uses to extract refs and defs.

```typescript
interface OFMIndex {
  headings:     HeadingNode[]
  wikiLinks:    WikiLinkNode[]
  embedLinks:   EmbedLinkNode[]
  blockAnchors: BlockAnchorNode[]
  tags:         TagNode[]
  frontmatter:  FrontmatterBlock | null
  callouts:     CalloutNode[]
  mathBlocks:   MathNode[]
  comments:     CommentNode[]
}
```

### Node Types

| Node Type | Structure | Notes |
|-----------|-----------|-------|
| `HeadingNode` | `{ level: 1–6; text: string; range: Range }` | ATX headings only (`##`). Setext headings are normalised to ATX in the AST. |
| `WikiLinkNode` | `{ target: string; fragment: string \| null; alias: string \| null; range: Range }` | `[[target]]`, `[[target#frag]]`, `[[target\|alias]]`. |
| `EmbedLinkNode` | `{ target: string; fragment: string \| null; range: Range; isImage: boolean }` | `![[target]]`. `isImage: true` if target extension is an image format. |
| `BlockAnchorNode` | `{ id: string; range: Range; blockRange: Range }` | `^anchor-id` at end of block. `blockRange` is the range of the entire block it anchors. |
| `TagNode` | `{ tag: string; range: Range }` | `#tag` in body (not in frontmatter YAML). Nested tags preserved: `#project/active`. |
| `FrontmatterBlock` | `{ raw: string; title: string \| null; aliases: string[]; tags: string[]; extra: Record<string, unknown>; range: Range }` | Parsed YAML. `extra` holds all non-standard keys. |
| `CalloutNode` | `{ type: string; title: string \| null; foldable: boolean; body: string; range: Range }` | `> [!TYPE] Title`. `foldable: true` if `> [!TYPE]+` or `> [!TYPE]-`. |
| `MathNode` | `{ display: boolean; source: string; range: Range }` | `display: true` for `$$...$$`, `false` for `$...$`. |
| `CommentNode` | `{ kind: 'html' \| 'obsidian'; text: string; range: Range }` | `<!-- html -->` or `%% obsidian %%`. |

---

## Parse Pipeline

The parse pipeline is a pure, ordered chain of stages. Each stage receives the output of the previous stage and returns a transformed representation. The pipeline is stateless and deterministic — same input always produces the same output.

```text
Raw text (string)
      │
      ▼ Stage 1: Tokenize
      │  Split into line tokens; handle CRLF normalisation.
      │  Output: Token[]
      │
      ▼ Stage 2: CST (Concrete Syntax Tree)
      │  Run tree-sitter Markdown grammar parser.
      │  Output: CST (tree-sitter Tree)
      │
      ▼ Stage 3: Ignore-type placeholders
      │  Replace nodes tree-sitter cannot parse as OFM extensions
      │  (wikilinks, callouts, etc.) with placeholder nodes.
      │  Output: CST with placeholder annotations
      │
      ▼ Stage 4: AST (Abstract Syntax Tree)
      │  Walk CST; resolve placeholders using OFM extension parsers.
      │  Strip trivia (whitespace, raw bytes).
      │  Output: typed AST (ASTNode tree)
      │
      ▼ Stage 5: Index
         Walk AST; collect typed nodes into OFMIndex fields.
         Output: OFMIndex
```

### Parse Pipeline — Stage Detail

#### Stage 1: Tokenize

- Normalise line endings (`\r\n` → `\n`).
- Identify byte-order mark and strip it (log warning).
- Produce a `LineToken[]` for use by range mapping (LSP positions are line/character based).

#### Stage 2: CST

- Run `tree-sitter-markdown` parser synchronously.
- For incremental re-parse (`applyLspChange` with incremental sync): feed tree-sitter the previous tree + the edit descriptor. Tree-sitter performs incremental re-parse in O(change size) average case.
- Output: a `Tree` value (owned by tree-sitter; not serialised).

#### Stage 3: Ignore-type placeholders

tree-sitter's Markdown grammar does not natively understand Obsidian extensions. The CST will contain `paragraph` or `inline` nodes where wikilinks, embeds, and callouts appear. Stage 3 annotates these nodes for processing in Stage 4.

Placeholder identification rules:

| Pattern | Placeholder annotation |
|---------|----------------------|
| Text matching `\[\[...\]\]` inside inline | `WIKILINK_PLACEHOLDER` |
| Text matching `!\[\[...\]\]` inside inline | `EMBED_PLACEHOLDER` |
| Block starting with `> [!` | `CALLOUT_PLACEHOLDER` |
| Text matching `#[\w/]+` in inline (not code) | `TAG_PLACEHOLDER` |
| Text matching `\^[\w-]+` at end of block | `BLOCK_ANCHOR_PLACEHOLDER` |

#### Stage 4: AST

Run each OFM extension parser against its corresponding placeholder nodes:

| Extension Parser | Handles | Output Node |
|-----------------|---------|-------------|
| `WikiLinkParser` | `WIKILINK_PLACEHOLDER` | `WikiLinkNode` |
| `EmbedParser` | `EMBED_PLACEHOLDER` | `EmbedLinkNode` |
| `BlockAnchorParser` | `BLOCK_ANCHOR_PLACEHOLDER` | `BlockAnchorNode` |
| `TagParser` | `TAG_PLACEHOLDER` | `TagNode` |
| `CalloutParser` | `CALLOUT_PLACEHOLDER` | `CalloutNode` |
| `FrontmatterParser` | First node if `document → front_matter` | `FrontmatterBlock` |
| `MathParser` | tree-sitter `math_block` / `math_inline` | `MathNode` |
| `CommentParser` | HTML comment nodes + `%%` text | `CommentNode` |

Each parser is responsible for recovering gracefully from malformed syntax. A malformed wikilink (`[[broken`) produces no `WikiLinkNode` — the raw text is preserved as a regular paragraph node. No exception is thrown.

#### Stage 5: Index

Walk the completed AST in source order, collecting:

- All `HeadingNode` values into `index.headings`
- All `WikiLinkNode` values into `index.wikiLinks`
- All `EmbedLinkNode` values into `index.embedLinks`
- All `BlockAnchorNode` values into `index.blockAnchors`
- All `TagNode` values into `index.tags`
- The `FrontmatterBlock` (at most one, null if absent) into `index.frontmatter`
- All `CalloutNode` values into `index.callouts`
- All `MathNode` values into `index.mathBlocks`
- All `CommentNode` values into `index.comments`

All lists are in source order (ascending by `range.start`).

---

## Domain Events

| Event | Payload | Emitted By |
|-------|---------|-----------|
| `DocumentTextChanged` | `{ id: DocId; oldVersion: number \| null; newVersion: number }` | `withText`, `applyLspChange` |
| `DocumentOpened` | `{ id: DocId; version: number; source: 'lsp' \| 'disk' }` | `fromLsp`, `tryLoad` |
| `DocumentClosed` | `{ id: DocId }` | Called by BC4 when editor closes the document |

> [!NOTE]
> BC2 emits events as values returned alongside the new `OFMDoc` (in a `{ doc, events }` result type). BC4 is responsible for publishing them to interested parties (e.g., the LSP diagnostics push mechanism). BC2 does not know about event buses or NestJS EventEmitter.

---

## OFM Parse Extensions vs CommonMark

The following table documents what flavors of Markdown `ParsePipeline` handles beyond standard CommonMark, and what it intentionally does not parse.

| Extension | Parsed | Notes |
|-----------|--------|-------|
| WikiLinks `[[...]]` | Yes | `WikiLinkParser` |
| Embeds `![[...]]` | Yes | `EmbedParser` |
| Block anchors `^id` | Yes | `BlockAnchorParser` |
| Tags `#tag` | Yes | `TagParser` (body tags only, not YAML) |
| Callouts `> [!TYPE]` | Yes | `CalloutParser` |
| Frontmatter `--- yaml ---` | Yes | `FrontmatterParser` (YAML via `js-yaml`) |
| Math `$...$` / `$$...$$` | Yes | `MathParser` (content not evaluated) |
| Comments `%% ... %%` | Yes | `CommentParser` |
| Footnotes `[^1]` | No | CommonMark only; not an Obsidian extension |
| Mermaid diagrams | No | Treated as fenced code blocks; content is opaque |
| DataviewJS | No | Treated as fenced code blocks; content is opaque |
| HTML blocks | Partial | Standard HTML comments captured; other HTML passed through |

> [!TIP]
> The parse pipeline is designed for extension. To add a new OFM syntax element: (1) add a placeholder annotation rule in Stage 3, (2) implement a new `XxxParser` in Stage 4 that handles that placeholder, (3) add the corresponding node type to `OFMIndex` in Stage 5. No other stages need modification.
