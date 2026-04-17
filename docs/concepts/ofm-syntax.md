---
title: OFM Syntax — Element Taxonomy Quick Reference
tags: [concepts, ofm, syntax, elements, parse-pipeline]
aliases: [ofm-elements, ofm-taxonomy, ofm-syntax-ref]
---

# OFM Syntax — Element Taxonomy Quick Reference

This document is a **quick-reference summary** of the Obsidian Flavored Markdown element types recognized by `flavor-grenade-lsp`. It covers the trigger syntax for each element, which LSP features apply to it, and the parse precedence rules that determine tokenization order.

> [!note] Full specification
> This document is intentionally concise. The authoritative grammar, edge cases, ambiguity resolution rules, and examples for each element type live in `ofm-spec/`. When this summary and `ofm-spec/` disagree, `ofm-spec/` is correct. See [[ofm-spec/wiki-links]], [[ofm-spec/embeds]], [[ofm-spec/block-anchors]], [[ofm-spec/tags]], [[ofm-spec/callouts]], and [[ofm-spec/frontmatter]].

---

## Element Taxonomy Table

| Element | Trigger Syntax | Example | LSP Features |
|---------|----------------|---------|--------------|
| **WikiLink — doc** | `[[target]]` | `[[daily-notes]]` | Completion, Definition, References, Hover, Rename, SemanticTokens |
| **WikiLink — section** | `[[target#heading]]` | `[[meeting#agenda]]` | Completion, Definition, References, Hover, SemanticTokens |
| **WikiLink — block** | `[[target#^blockid]]` | `[[meeting#^ab12c]]` | Completion, Definition, References, SemanticTokens |
| **WikiLink — alias** | `[[target\|label]]` | `[[meeting\|our meeting]]` | Completion (label shown), Definition (via target), Rename |
| **WikiLink — intra** | `[[#heading]]` | `[[#agenda]]` | Completion, Definition (within file), References |
| **Embed — doc** | `![[target]]` | `![[diagram.png]]` | Completion, Definition, Diagnostics (broken embed) |
| **Embed — section** | `![[target#heading]]` | `![[notes#summary]]` | Completion, Definition, SemanticTokens |
| **Tag** | `#word` or `#word/sub` | `#project/active` | Completion, References, Hover (tag stats), SemanticTokens |
| **Block anchor** | `^blockid` (end of block) | `^meeting-action` | Completion (in `[[doc#^`), References, CodeLens |
| **Callout opener** | `> [!type]` | `> [!warning]` | Completion (callout types), SemanticTokens, FoldingRange |
| **Callout title** | `> [!type] title text` | `> [!note] My Note` | SemanticTokens |
| **Frontmatter** | `---\n...\n---` at top | *(YAML block)* | Completion (key names), Hover (key description), Diagnostics |
| **Frontmatter alias** | `aliases:` key | `aliases: [foo, bar]` | Drives AliasDef creation; affects Completion, Definition |
| **Frontmatter tags** | `tags:` key | `tags: [project]` | Same as inline `#tag` for resolution purposes |
| **Link ref def** | `[label]: url` | `[RFC]: https://...` | Definition, References (in CommonMark inline links) |
| **Inline code** | `` `...` `` | `` `code` `` | *(ignore region — no OFM features inside)* |
| **Fenced code** | ` ```lang\n...\n``` ` | *(code block)* | FoldingRange; *(ignore region internally)* |
| **Math inline** | `$...$` | `$E = mc^2$` | SemanticTokens (math token), FoldingRange (display math) |
| **Math block** | `$$\n...\n$$` | *(display math)* | SemanticTokens, FoldingRange; *(ignore region internally)* |
| **OFM comment** | `%%...%%` | `%%draft section%%` | SemanticTokens (comment token), FoldingRange; *(ignore region)* |

---

## Ignore Regions

The following element types are marked as **opaque ignore regions** during stage 3 of the parse pipeline (see [[concepts/document-model]] stage 3). Inside ignore regions:

- Wiki-link tokenization does not run.
- Tag tokenization does not run.
- Completions are suppressed.
- Hover and semantic tokens do not apply (except for the region boundaries themselves).

| Ignore type | Syntax | Notes |
|-------------|--------|-------|
| Fenced code block | ` ```...``` ` | Language tag is not ignored — only the body |
| Indented code block | 4-space indent | Recognized by CommonMark parser |
| Inline code | `` `...` `` | Single-line only |
| Display math | `$$...$$` | Multi-line |
| Inline math | `$...$` | Single-line; must be balanced |
| OFM comment | `%%...%%` | Multi-line capable |
| Templater block | `<%...%>`, `<%-...-%>`, `<%_..._%>` | Active only when `FlavorConfig.templater.enabled = true` |
| HTML block | `<div>...</div>` etc | CommonMark HTML blocks |

> [!tip] Templater detection
> Templater ignore regions are only activated when `FlavorConfig.templater.enabled` is `true` (default: auto-detected if `Templater` plugin files exist in `.obsidian/plugins/`). When disabled, `<%...%>` is treated as literal text.

---

## Parse Precedence Rules

The order in which parsers run determines how ambiguous input is resolved. The precedence rules are:

### Rule 1: Frontmatter First

Frontmatter extraction (stage 2) runs before all other parsing. The `---` fence at position 0 is consumed. If frontmatter is malformed (no closing `---`), the entire document is treated as body text and a `MalformedFrontmatter` diagnostic is produced.

### Rule 2: Ignore Regions Before OFM Tokens

Ignore region marking (stage 3) runs before OFM element tokenization (stage 4). This ensures that `[[link]]` inside a code block is never tokenized as a wiki-link.

**Consequence**: a wiki-link that spans an ignore region boundary is not recognized. E.g.:

```
`[[not` a link]]
```

The `[[not` is inside an inline code region; the tokenizer sees only `a link]]` after the closing backtick, which does not match the wiki-link pattern.

### Rule 3: OFM Tokens Before CommonMark

OFM element tokenization (stage 4) runs before CommonMark parsing (stage 5). The tokenized OFM elements are excluded from CommonMark input. This prevents CommonMark from interpreting `[[link]]` as a failed CommonMark link.

**Consequence**: a `[[link]]` inside a CommonMark link label is still recognized as a wiki-link:

```markdown
[see [[notes/meeting]]]   ← wiki-link tokenized first; CommonMark sees broken outer link
```

This is consistent with Obsidian's own parser behavior.

### Rule 4: Longer Match Wins

When two OFM patterns could match at the same position, the longer match is preferred. Specifically:

- `![[file]]` (embed) wins over `!` followed by `[[file]]` (bang + wiki-link) — embeds are always matched as a unit.
- `[[doc#^blockid]]` (block ref) wins over `[[doc#anchor]]` (section ref) when the anchor begins with `^`.
- `#tag/subtag` wins over `#tag` when followed by `/` and a valid tag word.

### Rule 5: Tag Boundary Rules

A `#tag` token is recognized only when:

1. The `#` is preceded by whitespace, the start of a line, or one of: `(`, `,`, `[`.
2. The character immediately after `#` is a letter or Unicode word character (not a digit, to avoid `#1` being a tag).
3. The token ends at the next whitespace or end-of-line.

This prevents hash characters in URLs, hex color codes, and heading ID fragments from being tokenized as tags.

---

## Directed to Full Specification

The following topics are covered in depth in `ofm-spec/`:

| Topic | File |
|-------|------|
| Wiki-link grammar (formal BNF) | [[ofm-spec/wiki-links]] |
| Embed resolution rules | [[ofm-spec/embeds]] |
| Block anchor valid ID characters | [[ofm-spec/block-anchors]] |
| Tag hierarchy and nesting | [[ofm-spec/tags]] |
| Callout type registry and custom types | [[ofm-spec/callouts]] |
| Frontmatter schema and recognized keys | [[ofm-spec/frontmatter]] |
| Templater block patterns | [[ofm-spec/templater]] |
| Math syntax (KaTeX subset) | [[ofm-spec/math]] |

---

## Cross-References

- [[concepts/document-model]] — How these elements feed the 8-stage parse pipeline
- [[concepts/symbol-model]] — How elements map to Def/Ref symbols
- [[concepts/connection-graph]] — How Ref symbols are resolved across documents
- [[design/api-layer]] — Which LSP methods are triggered by which element types
