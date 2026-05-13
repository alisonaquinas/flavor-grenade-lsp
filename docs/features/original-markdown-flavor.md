---
title: Feature — Original Markdown Flavor
tags: [features, markdown-flavor, original-markdown]
aliases:
  - Original Markdown flavor
  - Gruber Markdown flavor
---

# Feature — Original Markdown Flavor

The `original` flavor models John Gruber's 2004 Markdown baseline. It is useful
for compatibility checks and for showing authors when modern syntax depends on
later dialects rather than the original language.

## Feature Set

| Surface | Required behavior |
|---|---|
| Paragraphs and line breaks | Preserve original Markdown paragraph and hard-break behavior. |
| ATX and Setext headings | Parse as structural headings and expose document symbols and folding. |
| Emphasis and strong emphasis | Tokenize only original-style emphasis behavior; flag dialect-only assumptions as unsupported where useful. |
| Lists and blockquotes | Support original list and blockquote forms for symbols, folding, and semantic tokens. |
| Indented code blocks and inline code | Support original code syntax. Fenced code blocks are not core original Markdown. |
| Links and images | Support inline and reference links/images; local Markdown links participate in document navigation when the target exists. |
| Raw HTML | Treat inline and block HTML as allowed original Markdown content while avoiding unsafe preview assumptions. |

## Disabled Or Non-Core Syntax

Tables, task lists, strikethrough, fenced code blocks, footnotes, math,
frontmatter, attributes, wiki-links, embeds, block references, and callouts are
not active original Markdown constructs.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report broken local Markdown links and unsupported active flavor constructs when the user opts into portability diagnostics. |
| Completion | Offer Markdown link destinations and headings; do not offer table, task-list, callout, tag, or wiki-link completions. |
| Navigation | Support definition/references for local Markdown links and headings. |
| Hover | Explain original-supported syntax and mark modern extensions as outside the flavor. |
| Rename | Update Markdown links and heading references only for supported local link forms. |

## Acceptance

- `original` can be selected without changing VS Code language mode.
- Original Markdown documents do not receive Obsidian-only diagnostics.
- Modern extension syntax is not silently treated as original Markdown.

## Related

- [[docs/research/commonmark-and-original-markdown]]
- [[docs/plans/phase-22-original-markdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
