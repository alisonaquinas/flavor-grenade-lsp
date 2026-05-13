---
title: Feature — MDX Flavor
tags: [features, markdown-flavor, mdx]
aliases:
  - MDX flavor
---

# Feature — MDX Flavor

The `mdx` flavor models Markdown documents that embed JSX expressions,
components, and ESM-like declarations. It is a Markdown flavor profile, not a
replacement for VS Code's dedicated MDX language support.

## Feature Set

| Surface | Required behavior |
|---|---|
| CommonMark/MDX Markdown | Support Markdown blocks and inline content accepted by the MDX profile. |
| JSX elements | Tokenize JSX component tags, props, children, and closing tags. |
| JSX expressions | Recognize expression containers and suppress Markdown parsing inside JavaScript expressions. |
| ESM declarations | Recognize import/export blocks as MDX module syntax. |
| Component references | Provide symbol and completion hooks for local component identifiers when source context is available. |

## Language-Mode Boundary

If a document's VS Code language id is `mdx`, a dedicated MDX extension may own
the editor experience. Flavor Grenade must not steal that language mode. The
`mdx` flavor exists for Markdown-mode documents whose project explicitly wants
MDX-aware analysis.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed MDX containers and broken local Markdown links; do not run Markdown parsing inside opaque JSX/ESM regions. |
| Completion | Offer local Markdown links, headings, JSX component names when available, and MDX snippets. |
| Navigation | Resolve local Markdown links and local component identifiers when supported by project context. |
| Hover | Show Markdown target metadata and lightweight JSX/MDX classification. |
| Semantic tokens | Mark JSX tags, props, expressions, and ESM regions distinctly. |

## Acceptance

- `mdx` flavor does not call `setTextDocumentLanguage`.
- JSX and ESM regions are treated as opaque for Markdown link/tag parsing.
- MDX behavior is active only through explicit flavor state or project config.

## Related

- [[docs/research/mdx-analysis]]
- [[docs/plans/phase-29-mdx-flavor-language-support]]
- [[docs/requirements/ofmarkdown-language-mode]]
