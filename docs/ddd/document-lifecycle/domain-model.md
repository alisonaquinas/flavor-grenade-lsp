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

This document is the authoritative domain model for **Bounded Context 2: Document Lifecycle**. BC2 is a Supporting subdomain that owns the in-memory representation of a single Markdown document: its text, parsed structure (CST + AST), derived index, and the parse context supplied by BC4.

BC2 is the workhorse that all other BCs depend on. BC3 reads `MarkdownIndex` projections to extract refs and defs. BC4 stores `MarkdownDoc` collections and owns the `EffectiveMarkdownFlavor` supplied to parsing. BC5 dispatches LSP notifications to BC4; it does not choose parser behavior.

See also: [[bounded-contexts]], [[ubiquitous-language]], [[docs/ddd/reference-resolution/domain-model]], [[docs/ddd/vault/domain-model]].

> [!NOTE]
> BC2 contains no reference resolution logic. It parses and indexes. Whether a wikilink resolves to a real document is BC3's concern, not BC2's.

---

## Aggregate: MarkdownDoc

`MarkdownDoc` is the primary aggregate. Its identity is `DocId`. Its state is `(text, structure, index, parseContext)`, which is always consistent — never partially stale. Every text or effective-flavor change triggers a complete, synchronous re-parse.

`OFMDoc` remains the current implementation/historical name for the Obsidian-compatible `MarkdownDoc`. New dialect work should use `MarkdownDoc` and `MarkdownIndex` in docs and public concepts, reserving `OFM*` names for current code or Obsidian-specific behavior.

### State

```text
MarkdownDoc
├── id:        DocId                    — identity; immutable after construction
├── text:      string                   — raw UTF-8 document text
├── structure: Structure                — parsed CST + AST (derived from text + context)
├── index:     MarkdownIndex            — typed element collections / projections
├── context:   ParseContext             — includes EffectiveMarkdownFlavor
└── version:   number | null            — null = disk; n = editor-open version n
```

### State Diagram

```text
                     ┌──────────────────────────────────────────────────┐
                     │                  MarkdownDoc                       │
                     │                                                    │
  MarkdownDoc.mk ──► │  id: DocId        (immutable)                     │
  MarkdownDoc.fromLsp│                                                    │
  MarkdownDoc.tryLoad│  text: string     ◄─── withText / applyLspChange  │
                     │                                                    │
                     │  structure: Structure  ◄── always rebuilt with text│
                     │    ├─ cst: CST                                     │
                     │    └─ ast: AST                                     │
                     │                                                    │
                     │  index: MarkdownIndex ◄ rebuilt with text/context │
                     │                                                    │
                     │  context: ParseContext                            │
                     │    EffectiveMarkdownFlavor supplied by BC4         │
                     │                                                    │
                     │  version: number | null                             │
                     │    null  = disk state                              │
                     │    n > 0 = editor open, version n                  │
                     └──────────────────────────────────────────────────┘

  Text mutations:
    withText(text) ──────────────────┐
    applyLspChange(params) ──────────┤──► new text/context → ParsePipeline → new (structure, index)
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
| I6 | Flavor-gated index collections such as `index.obsidian.wikiLinks` and `index.obsidian.embedLinks` contain nodes in source order (ascending by start position). Current `OFMIndex` exposes these as top-level fields. |
| I7 | `context.effectiveMarkdownFlavor` is always explicit, never `auto`. BC4 computes it before BC2 parses. |
| I8 | If only `EffectiveMarkdownFlavor` changes, the document must be re-parsed or re-projected so `MarkdownIndex` reflects the new dialect profile. |

---

## Commands

All commands are pure functions returning a new `MarkdownDoc` (current implementation: `OFMDoc`). They do not perform I/O (except `tryLoad`, which is explicitly async).

| Command | Signature | Description |
|---------|-----------|-------------|
| `MarkdownDoc.mk` | `(id: DocId, text: string, context: ParseContext) → MarkdownDoc` | Construct from a known DocId and raw text. Runs the full parse pipeline. Sets `version = null`. |
| `MarkdownDoc.fromLsp` | `(item: TextDocumentItem, context: ParseContext) → MarkdownDoc` | Construct from an LSP `TextDocumentItem`. Derives `DocId` from `item.uri`. Sets `version = item.version`. |
| `MarkdownDoc.tryLoad` | `(path: AbsPath, root: VaultRoot, context: ParseContext) → Promise<MarkdownDoc \| null>` | Read file from disk, construct `MarkdownDoc`. Returns `null` if the file does not exist or cannot be read. Sets `version = null`. |
| `MarkdownDoc.withText` | `(doc: MarkdownDoc, text: string, context: ParseContext, version?: number) → MarkdownDoc` | Replace full text or parse context. Runs full re-parse. Sets `version` if provided. |
| `MarkdownDoc.applyLspChange` | `(doc: MarkdownDoc, params: DidChangeTextDocumentParams, context: ParseContext) → MarkdownDoc` | Apply LSP content changes. For full sync: calls `withText`. For incremental sync: applies range edits sequentially, then re-parses. Always updates `version`. |

### ParseContext

```typescript
interface ParseContext {
  docId: DocId
  effectiveMarkdownFlavor: MarkdownFlavorId
  profile: MarkdownFlavorProfile
  source: 'disk' | 'lsp'
}
```

BC4 creates `ParseContext` from `EffectiveMarkdownFlavor`. BC2 must not read VS Code settings, TOML, vault markers, or `MarkdownFlavorSelection` directly.

> [!NOTE]
> `applyLspChange` validates that `params.textDocument.version > doc.version` before applying. If the new version is not greater, the command logs a warning and returns the original `MarkdownDoc` unchanged. This protects against out-of-order LSP notifications.

---

## MarkdownIndex — Derived Projection

`MarkdownIndex` is the typed element collection derived from a `MarkdownDoc`'s AST. It is rebuilt atomically every time document text or parse context changes. It is the primary interface BC3 uses to extract refs and defs.

The current `OFMIndex` is the Obsidian-compatible projection of `MarkdownIndex`. Non-Obsidian dialect phases must not force all syntax into OFM-only fields; they should add dialect projections or generic Markdown collections when the construct is not Obsidian-specific.

```typescript
interface MarkdownIndex {
  headings: HeadingNode[]
  links: MarkdownLinkNode[]
  images: MarkdownImageNode[]
  linkLabels: LinkLabelNode[]
  frontmatter: FrontmatterBlock | null
  mathBlocks: MathNode[]
  comments: CommentNode[]
  obsidian?: ObsidianFlavorProjection
  dialect?: Record<string, unknown>
}

interface ObsidianFlavorProjection {
  wikiLinks: WikiLinkNode[]
  embedLinks: EmbedLinkNode[]
  blockAnchors: BlockAnchorNode[]
  tags: TagNode[]
  callouts: CalloutNode[]
}
```

### Node Types

| Node Type | Structure | Notes |
|-----------|-----------|-------|
| `HeadingNode` | `{ level: 1–6; text: string; range: Range }` | ATX headings only (`##`). Setext headings are normalised to ATX in the AST. |
| `MarkdownLinkNode` | `{ target: string; fragment: string \| null; title: string \| null; range: Range }` | Standard inline links. Local-vault classification happens before BC3 refs are built. |
| `MarkdownImageNode` | `{ target: string; alt: string; range: Range }` | Standard image links. May become attachment refs when local. |
| `LinkLabelNode` | `{ label: string; target?: string; range: Range }` | Reference-style link use or definition. |
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
      ▼ Stage 3: Opaque regions and placeholders
      │  Mark code/math/comment/template regions opaque first.
      │  Replace nodes tree-sitter cannot parse as active flavor extensions
      │  (wikilinks, callouts, etc.) with placeholder nodes.
      │  Output: CST with placeholder annotations
      │
      ▼ Stage 4: AST (Abstract Syntax Tree)
      │  Walk CST; resolve placeholders using flavor-enabled parsers.
      │  Strip trivia (whitespace, raw bytes).
      │  Output: typed AST (ASTNode tree)
      │
      ▼ Stage 5: Flavor projection / Index
         Walk AST; collect typed nodes into MarkdownIndex fields.
         Output: MarkdownIndex
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

#### Stage 3: Opaque regions and placeholders

tree-sitter's Markdown grammar does not natively understand every dialect extension. Stage 3 first marks opaque regions: code spans/blocks, math blocks/spans, HTML comments, Obsidian comments, and Templater blocks. No token parser may emit syntax from inside an opaque region.

After opaque marking, Stage 3 annotates `paragraph` or `inline` nodes for active flavor extensions. Obsidian placeholders are emitted only when `ParseContext.effectiveMarkdownFlavor` enables the Obsidian-compatible projection.

Placeholder identification rules:

| Pattern | Placeholder annotation |
|---------|----------------------|
| Text matching `\[\[...\]\]` inside inline | `WIKILINK_PLACEHOLDER` |
| Text matching `!\[\[...\]\]` inside inline | `EMBED_PLACEHOLDER` |
| Block starting with `> [!` | `CALLOUT_PLACEHOLDER` |
| Text matching `#[\w/]+` in inline (not code) | `TAG_PLACEHOLDER` |
| Text matching `\^[\w-]+` at end of block | `BLOCK_ANCHOR_PLACEHOLDER` |

#### Stage 4: AST

Run each enabled extension parser against its corresponding placeholder nodes:

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

Walk the completed AST in source order, collecting generic Markdown nodes and any enabled flavor projections:

- All `HeadingNode` values into `index.headings`
- All standard local/non-local link syntax into generic Markdown collections
- All `WikiLinkNode` values into `index.obsidian.wikiLinks` when Obsidian projection is enabled
- All `EmbedLinkNode` values into `index.obsidian.embedLinks` when enabled
- All `BlockAnchorNode` values into `index.obsidian.blockAnchors` when enabled
- All `TagNode` values into `index.obsidian.tags` when enabled
- The `FrontmatterBlock` (at most one, null if absent) into `index.frontmatter`
- All `CalloutNode` values into `index.obsidian.callouts` when enabled
- All `MathNode` values into `index.mathBlocks`
- All `CommentNode` values into `index.comments`

All lists are in source order (ascending by `range.start`). Existing `OFMIndex` compatibility may expose Obsidian projection fields at top level until code is renamed.

---

## Domain Events

| Event | Payload | Emitted By |
|-------|---------|-----------|
| `DocumentTextChanged` | `{ id: DocId; oldVersion: number \| null; newVersion: number }` | `withText`, `applyLspChange` |
| `DocumentOpened` | `{ id: DocId; version: number; source: 'lsp' \| 'disk'; effectiveMarkdownFlavor: MarkdownFlavorId }` | `fromLsp`, `tryLoad` |
| `DocumentClosed` | `{ id: DocId }` | Called by BC4 when editor closes the document |
| `DocumentFlavorChanged` | `{ id: DocId; oldFlavor: MarkdownFlavorId; newFlavor: MarkdownFlavorId }` | `withText` when only parse context changes |

> [!NOTE]
> BC2 emits events as values returned alongside the new `MarkdownDoc` (in a `{ doc, events }` result type). BC4 is responsible for publishing them to interested parties (e.g., the LSP diagnostics push mechanism). BC2 does not know about event buses or NestJS EventEmitter.

---

## Markdown Flavor Projections

The following table documents current Obsidian-compatible behavior and how future dialect phases should classify constructs.

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
| Footnotes `[^1]` | Dialect-gated | Syntax-only parsing is BC2-local. If a dialect enables navigation/references, emit `FootnoteRef` / `FootnoteDef` symbols for BC3. |
| Citations / labels / cross-references | Dialect-gated | Syntax-only constructs stay in BC2. Addressable constructs become BC3 refs/defs only when the dialect profile declares navigation semantics. |
| Mermaid diagrams | No | Treated as fenced code blocks; content is opaque |
| DataviewJS | No | Treated as fenced code blocks; content is opaque |
| HTML blocks | Partial | Standard HTML comments captured; other HTML passed through |

> [!TIP]
> The parse pipeline is designed for extension. To add a new dialect syntax element: (1) add a placeholder annotation rule after opaque-region marking in Stage 3, (2) implement a new `XxxParser` in Stage 4 gated by `MarkdownFlavorProfile`, (3) add a generic `MarkdownIndex` collection or dialect projection in Stage 5, and (4) emit BC3 refs/defs only when the construct has cross-document or navigation semantics.
