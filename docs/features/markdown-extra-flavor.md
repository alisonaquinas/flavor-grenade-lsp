---
title: Feature — Markdown Extra Flavor
tags: [features, markdown-flavor, markdown-extra]
aliases:
  - Markdown Extra flavor
  - PHP Markdown Extra flavor
---

# Feature — Markdown Extra Flavor

The `markdown-extra` flavor models PHP Markdown Extra style extensions for
portable-but-extended web publishing.

## Feature Set

| Surface | Required behavior |
|---|---|
| Tables | Parse pipe tables and alignment. |
| Definition lists | Parse definition list terms and definitions. |
| Footnotes | Parse footnote definitions and references. |
| Abbreviations | Recognize abbreviation definitions and uses. |
| Fenced code blocks | Support Markdown Extra fenced code where profile-supported. |
| Attribute blocks | Parse IDs, classes, and key/value attributes on supported elements. |

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed tables, duplicate attributes/IDs, broken local links, and dangling footnotes. |
| Completion | Offer footnote labels, abbreviation labels, attribute names, local links, and headings. |
| Navigation | Resolve local links, headings, footnotes, abbreviations, and explicit IDs. |
| Hover | Show abbreviation expansions, footnote destinations, and attribute metadata. |
| Semantic tokens | Mark tables, definitions, footnotes, abbreviations, and attributes. |

## Acceptance

- Markdown Extra syntax is active only for `markdown-extra`.
- CommonMark-only documents do not receive Markdown Extra attribute behavior.
- Abbreviations and footnotes participate in local analysis.

## Related

- [[docs/research/markdown-extra-analysis]]
- [[docs/plans/phase-31-markdown-extra-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
