---
title: Feature — CommonMark Flavor
tags: [features, markdown-flavor, commonmark]
aliases:
  - CommonMark flavor
---

# Feature — CommonMark Flavor

The `commonmark` flavor is the default portable Markdown profile. It provides
standardized parsing for core Markdown without platform extensions.

## Feature Set

| Surface | Required behavior |
|---|---|
| CommonMark block structure | Parse paragraphs, headings, thematic breaks, blockquotes, lists, code blocks, and HTML blocks according to CommonMark semantics. |
| Fenced code blocks | Support backtick and tilde fences, info strings, semantic tokens, and folding. |
| Inline structure | Parse emphasis, strong, code spans, links, images, autolinks, raw HTML, and escapes according to CommonMark rules. |
| Link labels | Support reference labels and definitions with CommonMark normalization. |
| Headings | Provide document symbols, folding, heading completion, and heading navigation. |

## Disabled Or Non-Core Syntax

GFM tables/task lists/strikethrough, Obsidian wiki-links/embeds/tags/callouts,
Pandoc citations, MultiMarkdown metadata, MDX JSX, kramdown attributes, and
R Markdown chunks are not CommonMark features.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed CommonMark constructs only when the parser can prove an error; report broken local Markdown links. |
| Completion | Offer local Markdown link targets, reference labels, headings, and fenced-code info strings when supported. |
| Navigation | Resolve local links, same-document anchors, and reference-style labels. |
| Document symbols | Expose headings, thematic sections, fenced code, reference definitions, and structural CommonMark blocks. |
| Folding | Fold headings, lists, blockquotes, fenced code, HTML blocks, and other CommonMark block ranges. |
| Hover | Show normalized target and heading information for CommonMark links. |
| Semantic tokens | Mark CommonMark block and inline tokens, including fences, links, images, emphasis, and HTML. |
| Rename | Update local Markdown links and heading anchors without using Obsidian wiki-link rules. |

## Acceptance

- `commonmark` is the fallback effective flavor when no vault or config signal exists.
- CommonMark edge cases are deterministic and tested against the flavor profile.
- Platform extensions remain inactive unless another flavor is selected.

## Related

- [[docs/research/commonmark-and-original-markdown]]
- [[docs/plans/phase-23-commonmark-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
