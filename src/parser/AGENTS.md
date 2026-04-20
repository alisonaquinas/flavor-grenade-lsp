# AGENTS.md — src/parser/

## Purpose

Parses raw Markdown text into `OFMDoc` objects consumed by the vault indexer
and all LSP feature handlers.

## Layout

```
parser/
├── types.ts                    # OFMDoc, OFMIndex, and all entry types
├── ofm-parser.ts               # orchestration — calls sub-parsers in order
├── frontmatter-parser.ts       # YAML frontmatter extraction
├── opaque-region-marker.ts     # code/math/comment region detection
├── wiki-link-parser.ts         # [[…]] wiki-links
├── embed-parser.ts             # ![[…]] embeds
├── tag-parser.ts               # #tag tokens
├── block-anchor-parser.ts      # ^identifier block anchors
├── callout-parser.ts           # > [!TYPE] callout headers
├── code-parser.ts              # fenced code blocks
├── comment-parser.ts           # %% … %% comments
├── math-parser.ts              # $ … $ and $$ … $$ math
├── offset-utils.ts             # character offset ↔ line/character conversion helpers
├── parser.module.ts            # NestJS module
└── __tests__/
```

## Invariants

- **Opaque regions first**: `OpaqueRegionMarker` must run before any token
  parser. Token parsers must check `opaqueRegions` and skip any match that
  falls inside a region. Violating this causes false-positive wiki-links
  inside code blocks.
- **No mutation of OFMDoc after construction**: parsers return new objects;
  no parser mutates the input text or an existing `OFMDoc`.
- **types.ts is the shared contract**: all LSP feature handlers import types
  from `parser/types.ts`. Do not duplicate these types elsewhere.

## Workflows

- **Adding a new token type**: add a new entry type to `types.ts`, add a field
  to `OFMIndex`, write a parser file with unit tests, wire it into
  `ofm-parser.ts`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [CONCEPTS.md](../../CONCEPTS.md) — OFM, OFMDoc, OFMIndex, OpaqueRegion
