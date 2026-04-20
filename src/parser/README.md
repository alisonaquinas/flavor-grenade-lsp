# parser/

OFM document parser.

Converts raw Markdown text into an `OFMDoc` — a structured representation
containing parsed YAML frontmatter, a list of opaque regions (code/math/
comments), and an `OFMIndex` of all OFM-specific tokens.

## Parse Pipeline

1. **`frontmatter-parser.ts`** — extracts and parses the leading `---…---` YAML block
2. **`opaque-region-marker.ts`** — marks code spans, fenced blocks, math, and comments as opaque
3. Token parsers (run in parallel, each skipping opaque regions):
   - `wiki-link-parser.ts` — `[[…]]` links
   - `embed-parser.ts` — `![[…]]` embeds
   - `tag-parser.ts` — `#tag` tokens
   - `block-anchor-parser.ts` — `^identifier` anchors
   - `callout-parser.ts` — `> [!TYPE]` callout headers
   - `code-parser.ts` — fenced code blocks (contributes to opaque regions)
   - `comment-parser.ts` — `%% … %%` comments
   - `math-parser.ts` — `$ … $` and `$$ … $$` math
4. **`ofm-parser.ts`** — orchestrates the above and produces `OFMDoc`

## Key Types

Defined in `types.ts`:

- `OFMDoc` — top-level parsed document
- `OFMIndex` — all token lists
- `WikiLinkEntry`, `EmbedEntry`, `BlockAnchorEntry`, `TagEntry`, `CalloutEntry`, `HeadingEntry`
- `OpaqueRegion`

## NestJS Module

`parser.module.ts` exports `OFMParser` for injection by `VaultModule` and
`LspModule`.
