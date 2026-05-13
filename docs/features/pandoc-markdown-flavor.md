---
title: Feature — Pandoc Markdown Flavor
tags: [features, markdown-flavor, pandoc]
aliases:
  - Pandoc Markdown flavor
  - Pandoc flavor
---

# Feature — Pandoc Markdown Flavor

The `pandoc` flavor models Pandoc Markdown's extension-oriented authoring
surface for academic, technical, and document-conversion workflows.

## Feature Set

| Surface | Required behavior |
|---|---|
| Metadata blocks | Parse Pandoc title blocks and YAML metadata blocks as document metadata. |
| Citations | Recognize citation syntax, citation keys, prefixes, suffixes, and suppress-author forms. |
| Footnotes | Parse inline and reference footnotes. |
| Math | Tokenize inline and display math. |
| Attributes | Parse fenced-code, heading, link, span, and block attributes where supported. |
| Tables | Support Pandoc table variants according to implemented profile level. |
| Cross-references | Recognize labels and reference-like targets used by Pandoc-compatible workflows. |

## Conversion Boundaries

Pandoc output depends on command-line extensions, filters, templates, citeproc,
and target format. Flavor Grenade should model source syntax and local
references; it should not promise renderer parity with every Pandoc output
format.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed citations, duplicate labels, broken local Markdown links, and invalid attribute syntax when profile-supported. |
| Completion | Offer citation keys, labels, attributes, code languages, and local link targets. |
| Navigation | Resolve local links, headings, labels, footnotes, and citation keys when bibliographic context is configured. |
| Document symbols | Expose headings, metadata blocks, labels, footnotes, citations where local context exists, tables, math blocks, and fenced code. |
| Folding | Fold headings, metadata blocks, lists, blockquotes, code fences, math blocks, tables, and footnote definitions. |
| Hover | Show citation/label/attribute metadata and note conversion-dependent features. |
| Semantic tokens | Mark metadata, citations, footnotes, math, attributes, tables, labels, and Markdown tokens. |
| Rename | Rename labels, footnotes, and local Markdown targets within safe local scope. |

## Acceptance

- Pandoc extensions are profile-gated behind `pandoc`.
- Citation and label syntax is represented as first-class analysis data.
- Unsupported Pandoc renderer behavior is documented as conversion-bound.

## Related

- [[docs/research/pandoc-markdown-deep-research-report]]
- [[docs/plans/phase-27-pandoc-markdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
