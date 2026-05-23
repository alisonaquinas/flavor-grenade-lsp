---
title: Feature — R Markdown Flavor
tags: [features, markdown-flavor, r-markdown]
aliases:
  - R Markdown flavor
  - RMarkdown flavor
---

# Feature — R Markdown Flavor

The `r-markdown` flavor models R Markdown source files as Markdown plus YAML
metadata and executable chunk syntax.

## Feature Set

| Surface | Required behavior |
|---|---|
| YAML metadata | Parse title, output, bibliography, params, and other frontmatter keys as metadata. |
| Code chunks | Recognize R Markdown chunk fences, labels, engines, and chunk options. |
| Inline R | Tokenize inline R expressions without treating their contents as Markdown. |
| Cross references | Recognize chunk labels and bookdown-style references where profile-supported. |
| Citations and bibliography | Classify citation syntax when used by the configured R Markdown workflow. |
| Markdown base | Use CommonMark-compatible behavior for prose unless profile options say otherwise. |

## Execution Boundary

Flavor Grenade must not execute R code. Chunk support is static analysis:
labels, options, navigation, diagnostics, hover, and completion only.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report duplicate chunk labels, malformed chunk headers, invalid option syntax, and broken local links. |
| Completion | Offer chunk labels, option keys, output formats, citation keys, headings, and local links. |
| Navigation | Resolve chunk labels, local links, headings, citations, and cross-references. |
| Document symbols | Expose headings, YAML metadata, chunk labels, code chunks, citations, and cross-reference anchors. |
| Hover | Show chunk engine/options, metadata, and reference targets. |
| Folding | Fold chunks, YAML metadata, headings, and fenced blocks. |
| Semantic tokens | Mark YAML metadata, chunk fences, chunk labels/options, inline R boundaries, citations, and Markdown tokens. |
| Rename | Rename local Markdown symbols and chunk labels where syntax-preserving edits are safe; reject R symbols, execution-bound targets, and generated-output references. |

## Acceptance

- R code and inline expressions are not executed.
- Chunk labels become addressable local symbols.
- R Markdown behavior remains separate from generic fenced-code behavior.

## Related

- [[docs/research/r-markdown-analysis]]
- [[docs/plans/phase-32-r-markdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
