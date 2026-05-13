---
title: Feature — MultiMarkdown Flavor
tags: [features, markdown-flavor, multimarkdown]
aliases:
  - MultiMarkdown flavor
  - MMD flavor
---

# Feature — MultiMarkdown Flavor

The `multimarkdown` flavor supports document-production Markdown with metadata,
tables, footnotes, citations, and cross-reference-oriented authoring.

## Feature Set

| Surface | Required behavior |
|---|---|
| Metadata | Parse MultiMarkdown metadata keys and values at document start. |
| Tables | Support MultiMarkdown table syntax and alignment behavior. |
| Footnotes | Parse footnote definitions and references. |
| Citations | Recognize citation keys and bibliography-oriented syntax. |
| Cross-references | Track labels and references for headings, figures, tables, equations, and anchors where supported. |
| Math | Tokenize math spans/blocks when the profile enables them. |

## Export Boundaries

MultiMarkdown behavior varies by processor and export target. Local LSP support
must describe syntax and references without claiming final PDF, HTML, or LaTeX
rendering parity.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report duplicate or missing labels, malformed metadata, malformed tables, and broken local links. |
| Completion | Offer metadata keys, labels, citation keys, footnotes, and local link targets. |
| Navigation | Resolve labels, footnotes, citations, headings, and local Markdown links. |
| Document symbols | Expose headings, metadata, labels, footnotes, citations, tables, math blocks, and cross-reference anchors. |
| Folding | Fold headings, metadata blocks, lists, blockquotes, code fences, tables, footnotes, and math blocks. |
| Hover | Show metadata, citation, footnote, and label summaries. |
| Semantic tokens | Mark metadata, tables, footnotes, citations, cross references, math, and Markdown tokens. |
| Rename | Safely rename local labels and document links. |

## Acceptance

- MultiMarkdown metadata and cross-reference surfaces are active under `multimarkdown`.
- Obsidian vault features remain inactive unless selected separately.
- Export-only behavior is clearly separated from local source analysis.

## Related

- [[docs/research/multimarkdown-analysis]]
- [[docs/plans/phase-28-multimarkdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
