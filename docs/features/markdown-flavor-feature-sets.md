---
title: Feature — Markdown Flavor Feature Sets
tags: [features, markdown-flavor, dialects]
aliases:
  - Markdown flavor feature sets
  - Flavor feature sets
---

# Feature — Markdown Flavor Feature Sets

This page indexes the flavor-specific feature sets controlled by
[[docs/features/ofmarkdown-language-mode]]. Each flavor page defines the parser,
diagnostic, completion, navigation, hover, and portability behavior expected
when that flavor is the effective Markdown flavor.

## Feature Pages

| Flavor | Feature set | Research source |
|---|---|---|
| Original Markdown | [[docs/features/original-markdown-flavor]] | [[docs/research/commonmark-and-original-markdown]] |
| CommonMark | [[docs/features/commonmark-flavor]] | [[docs/research/commonmark-and-original-markdown]] |
| Obsidian | [[docs/features/obsidian-markdown-flavor]] | [[docs/ofm-spec/index]] |
| GitHub Flavored Markdown | [[docs/features/github-flavored-markdown-flavor]] | [[docs/research/github-flavored-markdown-analysis]] |
| GitLab Flavored Markdown | [[docs/features/gitlab-flavored-markdown-flavor]] | [[docs/research/gitlab-flavored-markdown-analysis]] |
| Pandoc Markdown | [[docs/features/pandoc-markdown-flavor]] | [[docs/research/pandoc-markdown-deep-research-report]] |
| MultiMarkdown | [[docs/features/multimarkdown-flavor]] | [[docs/research/multimarkdown-analysis]] |
| MDX | [[docs/features/mdx-flavor]] | [[docs/research/mdx-analysis]] |
| kramdown | [[docs/features/kramdown-flavor]] | [[docs/research/kramdown-analysis]] |
| Markdown Extra | [[docs/features/markdown-extra-flavor]] | [[docs/research/markdown-extra-analysis]] |
| R Markdown | [[docs/features/r-markdown-flavor]] | [[docs/research/r-markdown-analysis]] |
| Reddit Markdown | [[docs/features/reddit-markdown-flavor]] | [[docs/research/reddit-markdown-analysis]] |
| Stack Overflow Markdown | [[docs/features/stack-overflow-markdown-flavor]] | [[docs/research/stack-overflow-markdown-analysis]] |

## Shared Contract

Every flavor feature set must:

- keep `.md` files in VS Code's built-in `markdown` language mode;
- be selected through `flavorGrenade.markdownFlavor`;
- describe which syntax surfaces become active, inert, or host-specific;
- declare expected LSP feature behavior for diagnostics, completion, hover,
  navigation, document symbols, folding, semantic tokens, and rename;
- avoid enabling Obsidian-only wiki-link, embed, tag, callout, or vault behavior
  unless the effective flavor is `obsidian` or the flavor page explicitly says
  the construct is supported by that flavor.

## Related

- [[docs/features/ofmarkdown-language-mode]]
- [[docs/plans/markdown-flavor-lsp-applicability-matrix]]
- [[docs/requirements/ofmarkdown-language-mode]]
- [[docs/test/markdown-flavor-unit-spec]]
