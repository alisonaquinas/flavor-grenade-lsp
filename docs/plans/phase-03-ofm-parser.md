---
title: "Phase 3: OFM Parser"
phase: 3
status: planned
tags: [parser, ofm, ast, cst, wiki-links, tags, callouts, frontmatter]
updated: 2026-04-16
---

# Phase 3: OFM Parser

| Field      | Value |
|------------|-------|
| Phase      | 3 |
| Title      | OFM Parser |
| Status     | ⏳ planned |
| Gate       | `bun test src/parser/**` all pass; OFMIndex correctly projects all element types for sample vault fixture; wiki-links.feature @smoke, tags.feature @smoke, callouts.feature @smoke pass |
| Depends on | Phase 2 (LSP Transport) |

---

## Objective

Implement the OFM-specific parse pipeline that transforms raw markdown text into a structured `OFMIndex`. The index is the primary data structure that all LSP features (diagnostics, completion, navigation) query. The parser must correctly identify and isolate OFM constructs while respecting "opaque regions" (code blocks, math blocks, HTML blocks) where OFM syntax is not active.

---

## Architecture: The 8-Stage Pipeline

```text
Raw Text
  │
  ▼ Stage 1: FrontmatterParser
Frontmatter extracted, body isolated
  │
  ▼ Stage 2: OpaqueRegionMarker (CommentParser + MathParser + CodeParser)
Opaque regions marked — OFM tokens inside these regions are skipped
  │
  ▼ Stage 3: OFM Token Extraction
WikiLinkParser, EmbedParser, TagParser, CalloutParser, BlockAnchorParser run
  │
  ▼ Stage 4: CommonMark parsing (via micromark or similar)
Standard markdown AST produced
  │
  ▼ Stage 5: CST merge
OFM tokens placed into the CommonMark tree at correct positions
  │
  ▼ Stage 6: AST normalization
Heading normalization, list flattening
  │
  ▼ Stage 7: OFMIndex projection
Flat index: headings[], wikiLinks[], embeds[], blockAnchors[], tags[], callouts[]
  │
  ▼ Stage 8: OFMDoc assembly
OFMDoc = { uri, version, frontmatter, body, index, opaqueRegions }
```

---

## Task List

- [ ] **1. Define `OFMIndex` and `OFMDoc` types**

  Create `src/parser/types.ts`:

  ```typescript
  export interface OFMIndex {
    headings: HeadingEntry[];
    wikiLinks: WikiLinkEntry[];
    embeds: EmbedEntry[];
    blockAnchors: BlockAnchorEntry[];
    tags: TagEntry[];
    callouts: CalloutEntry[];
  }

  export interface WikiLinkEntry {
    raw: string;          // [[target#heading|alias]]
    target: string;       // target
    heading?: string;     // heading
    blockId?: string;     // blockId
    alias?: string;       // alias
    range: Range;         // LSP Range in source document
  }

  export interface OFMDoc {
    uri: string;
    version: number;
    frontmatter: Record<string, unknown> | null;
    opaqueRegions: OpaqueRegion[];
    index: OFMIndex;
  }
  ```

- [ ] **2. Implement `FrontmatterParser`**

  Create `src/parser/frontmatter-parser.ts`:
  - Detect `---\n` at byte offset 0
  - Find the closing `---\n` delimiter
  - Parse YAML between delimiters using `js-yaml`
  - Return `{ frontmatter, bodyOffset }` or `{ frontmatter: null, bodyOffset: 0 }`
  - Report `FG007` if YAML parsing throws

  ```bash
  bun add js-yaml
  bun add --dev @types/js-yaml
  ```

- [ ] **3. Implement `CommentParser` — opaque region: `%%...%%`**

  Create `src/parser/comment-parser.ts`. Marks all `%%comment%%` spans as opaque. OFM syntax inside comments is invisible to later stages.

- [ ] **4. Implement `MathParser` — opaque region: `$$...$$` and `$...$`**

  Create `src/parser/math-parser.ts`. Marks:
  - Display math: `$$\n...\n$$` (block-level)
  - Inline math: `$...$` (must not span newlines)
  - Content inside math is opaque to wiki-link and tag parsers

- [ ] **5. Implement `CodeParser` — opaque region: fenced code and inline code**

  Create `src/parser/code-parser.ts`. Marks:
  - Fenced code blocks: `` ``` `` or `~~~` delimiters
  - Indented code blocks: 4-space indent
  - Inline code: `` `...` ``

- [ ] **6. Implement `WikiLinkParser`**

  Create `src/parser/wiki-link-parser.ts`. Use a character-level FSM (not regex on the whole document) to find `[[...]]` tokens outside opaque regions.

  Handles all variants:
  - `[[note]]` — simple file link
  - `[[note|alias]]` — display alias
  - `[[note#heading]]` — heading link
  - `[[note#^blockid]]` — block reference
  - `[[note#heading|alias]]` — heading with alias
  - `[[folder/note]]` — path-qualified
  - `[[#heading]]` — intra-document heading
  - `[[#^blockid]]` — intra-document block ref
  - `[[]]` — empty (FG003)

- [ ] **7. Implement `EmbedParser`**

  Create `src/parser/embed-parser.ts`. Same FSM as WikiLinkParser but prefixed by `!`. The `!` must not itself be inside an opaque region. Embed-width syntax `![[image.png|200]]` must be handled — the `|200` or `|200x150` is a size specifier, not an alias, when the target has an image extension.

- [ ] **8. Implement `BlockAnchorParser`**

  Create `src/parser/block-anchor-parser.ts`. Detects `^anchor-id` at the **end of a non-blank line** (after any trailing whitespace). Rules:
  - The `^` must not be inside an opaque region
  - The ID must match `/^[a-zA-Z0-9-]+$/`
  - The anchor must be at line end (possibly with trailing whitespace)
  - Middle-of-line `^` (e.g., in math like `x^2`) must NOT match

- [ ] **9. Implement `TagParser`**

  Create `src/parser/tag-parser.ts`. Unicode-aware tag regex:
  - Pattern: `#[\p{L}\p{N}_/-]+` (Unicode property escapes, `u` flag)
  - Must not be inside an opaque region
  - Must be preceded by whitespace, start of line, or certain punctuation (not alphanumeric)
  - Nested tags: `#project/active` — the slash is part of the tag

- [ ] **10. Implement `CalloutParser`**

  Create `src/parser/callout-parser.ts`. Detects `> [!TYPE]` at the start of a blockquote line:
  - Pattern: `/^(>+)\s*\[!([A-Z-]+)\]([+-]?)(\s+.*)?$/`
  - Group 1: nesting depth (number of `>`)
  - Group 2: callout type (e.g., `NOTE`, `WARNING`)
  - Group 3: fold indicator (`-` = collapsed, `+` = expanded, empty = non-foldable)
  - Group 4: optional title text

- [ ] **11. Implement `OpaqueRegionMarker`**

  Create `src/parser/opaque-region-marker.ts`. Runs Comment, Math, and Code parsers in sequence. Returns a sorted, non-overlapping list of `OpaqueRegion` objects. All subsequent parsers consult this list to skip opaque spans.

  ```typescript
  export interface OpaqueRegion {
    kind: 'code' | 'math' | 'comment';
    start: number;  // byte offset
    end: number;    // byte offset
  }

  export function isInsideOpaqueRegion(offset: number, regions: OpaqueRegion[]): boolean;
  ```

- [ ] **12. Implement `OFMParser` orchestrator**

  Create `src/parser/ofm-parser.ts`. Runs all 8 stages and returns an `OFMDoc`. Must be pure (no I/O, no side effects) so it can be tested in isolation.

  ```typescript
  export class OFMParser {
    parse(uri: string, text: string, version: number): OFMDoc;
  }
  ```

- [ ] **13. Register `OFMParser` in NestJS DI**

  Add `OFMParser` as a provider in a new `ParserModule`. Export it for use by `VaultIndex` (Phase 4) and handler services (Phase 5+).

- [ ] **14. Write unit tests for each parser sub-component**

  Target: one test file per parser class. Example structure:

  ```text
  src/parser/
  ├── __tests__/
  │   ├── frontmatter-parser.test.ts
  │   ├── wiki-link-parser.test.ts
  │   ├── embed-parser.test.ts
  │   ├── block-anchor-parser.test.ts
  │   ├── tag-parser.test.ts
  │   ├── callout-parser.test.ts
  │   ├── opaque-region-marker.test.ts
  │   └── ofm-parser.integration.test.ts
  ```

  The integration test uses a sample vault fixture (a directory of `.md` files in `src/test/fixtures/sample-vault/`) to verify the full pipeline output.

- [ ] **15. Wire parser into `textDocument/didOpen` and `textDocument/didChange`**

  When a document is opened or changed, call `OFMParser.parse()` and store the result in a new `ParseCache` service. Later phases query `ParseCache` rather than re-parsing.

---

## Gate Verification

```bash
# Unit tests
bun test src/parser/

# BDD smoke scenarios (require Phase 2 transport + Phase 3 parser)
bun run bdd -- features/wiki-links.feature --tags @smoke
bun run bdd -- features/tags.feature --tags @smoke
bun run bdd -- features/callouts.feature --tags @smoke
bun run bdd -- features/frontmatter.feature --tags @smoke
```

---

## References

- `[[ofm-spec/index]]`
- `[[ddd/document-lifecycle/domain-model]]`
- `[[concepts/document-model]]`
- `[[plans/phase-04-vault-index]]`
