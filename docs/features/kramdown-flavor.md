---
title: Feature — kramdown Flavor
tags: [features, markdown-flavor, kramdown]
aliases:
  - kramdown flavor
---

# Feature — kramdown Flavor

The `kramdown` flavor models kramdown's Ruby-oriented Markdown extensions,
especially attributes and structured document-production syntax.

## Feature Set

| Surface | Required behavior |
|---|---|
| kramdown block parsing | Parse CommonMark-like Markdown with kramdown-specific block behavior where documented. |
| Attribute lists | Recognize inline and block attribute lists, IDs, classes, and key/value attributes. |
| Definition lists | Parse term/definition structures. |
| Tables | Parse kramdown table syntax and alignment. |
| Footnotes | Parse footnote definitions and references. |
| Math | Tokenize math blocks/spans where kramdown profile enables them. |
| Header IDs | Treat explicit IDs as addressable local anchors. |

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed attribute lists, duplicate IDs, broken local links, and malformed footnotes. |
| Completion | Offer attribute keys, classes/IDs from the document, footnote labels, headings, and local links. |
| Navigation | Resolve local Markdown links, explicit IDs, headings, and footnotes. |
| Document symbols | Expose headings, explicit IDs, attribute blocks, definition lists, tables, footnotes, math blocks, and reference definitions. |
| Folding | Fold headings, lists, blockquotes, fenced code, tables, definition lists, attribute blocks, footnotes, and math blocks. |
| Hover | Explain attribute targets and generated/explicit anchors. |
| Semantic tokens | Mark attributes, explicit IDs, definition lists, tables, footnotes, math, and Markdown tokens. |
| Rename | Rename explicit IDs and update matching local references when safe. |

## Acceptance

- kramdown attributes are first-class addressable syntax under `kramdown`.
- Attribute parsing does not leak into CommonMark or GFM profiles.
- Explicit IDs participate in local navigation.

## Related

- [[docs/research/kramdown-analysis]]
- [[docs/plans/phase-30-kramdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
