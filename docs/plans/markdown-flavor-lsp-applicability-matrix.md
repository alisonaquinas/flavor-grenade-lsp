---
title: Markdown Flavor LSP Applicability Matrix
tags: [plans, markdown-flavor, lsp, matrix]
aliases: [Markdown Flavor LSP Matrix]
updated: 2026-05-13
---

# Markdown Flavor LSP Applicability Matrix

This matrix removes ambiguous applicability gates from flavor phases.
Each phase 22-34 implementation ticket must either satisfy the required LSP
surface below or record a deferred/not-applicable reason in that phase's
verification evidence.

| Flavor | Diagnostics | Completion | Document links | Folding | Semantic tokens | Navigation | Hover |
|---|---|---|---|---|---|---|---|
| `original` | Required for non-core extension diagnostics and portability warnings. | Required for baseline link/heading constructs only. | Required for inline/reference links. | Required for headings and indented code blocks. | Required for core Markdown tokens. | Required for headings and links. | Required for core syntax explanation. |
| `commonmark` | Required for CommonMark edge cases and non-enabled extension warnings. | Required for CommonMark block/inline constructs. | Required for inline/reference links. | Required for headings, lists, block quotes, and fenced code. | Required for CommonMark tokens. | Required for headings and links. | Required for standardized syntax explanation. |
| `obsidian` | Required for wiki links, embeds, tags, blocks, callouts, and vault rules. | Required for vault links, embeds, headings, blocks, tags, and aliases. | Required for wiki links, embeds, Markdown links, and attachments. | Required for headings, lists, callouts, code, and math. | Required for OFM tokens. | Required for vault symbols, links, tags, headings, and blocks. | Required for resolved vault targets and OFM syntax. |
| `gfm` | Required for tables, task lists, strikethrough, and autolinks. | Required for GFM table/task/list constructs. | Required for Markdown links and autolinks. | Required for headings, lists, block quotes, code, and tables. | Required for GFM tokens. | Required for headings and links. | Required for GFM extension explanation. |
| `glfm` | Required for GitLab-specific extension boundaries and portability warnings. | Required for GLFM syntax constructs that are local to Markdown text. | Required for Markdown links and recognized media references. | Required for headings, lists, block quotes, code, and tables. | Required for GLFM tokens. | Required for headings and links; live GitLab object lookup is deferred. | Required for GLFM syntax explanation; live GitLab metadata is deferred. |
| `pandoc` | Required for extension-enabled syntax, citations, footnotes, math, and metadata boundaries. | Required for citations, footnotes, math, and metadata constructs. | Required for Markdown links and citation-like references when locally resolvable. | Required for headings, lists, block quotes, code, math, and metadata. | Required for Pandoc Markdown tokens. | Required for headings, links, footnotes, and locally resolvable citations. | Required for Pandoc syntax explanation. |
| `multimarkdown` | Required for metadata, tables, footnotes, and cross-reference boundaries. | Required for metadata, footnotes, tables, and cross-reference constructs. | Required for Markdown links and cross references. | Required for headings, lists, block quotes, code, tables, and metadata. | Required for MultiMarkdown tokens. | Required for headings, links, footnotes, and cross references. | Required for MultiMarkdown syntax explanation. |
| `mdx` | Required for Markdown/JSX boundary diagnostics and Markdown-mode safety. | Required for Markdown constructs and MDX component/expression boundaries. | Required for Markdown links; JSX import/component resolution is deferred. | Required for Markdown headings, JSX blocks, and code fences. | Required for Markdown and MDX boundary tokens. | Required for Markdown headings and links; React symbol lookup is deferred. | Required for MDX syntax explanation without changing VS Code `languageId`. |
| `kramdown` | Required for attributes, definition lists, footnotes, and ID boundaries. | Required for attribute, footnote, and definition-list constructs. | Required for Markdown links and attribute IDs. | Required for headings, lists, block quotes, code, and attribute blocks. | Required for kramdown tokens. | Required for headings, links, footnotes, and custom IDs. | Required for kramdown syntax explanation. |
| `markdown-extra` | Required for tables, definition lists, footnotes, and attribute boundaries. | Required for Markdown Extra tables, footnotes, and definition lists. | Required for Markdown links and footnote references. | Required for headings, lists, block quotes, code, tables, and definition lists. | Required for Markdown Extra tokens. | Required for headings, links, footnotes, and definition terms. | Required for Markdown Extra syntax explanation. |
| `r-markdown` | Required for YAML metadata, code chunk fences, math, and Markdown boundary diagnostics. | Required for R code chunk and metadata constructs. | Required for Markdown links. | Required for headings, metadata, chunk fences, and Markdown blocks. | Required for Markdown/R chunk boundary tokens; R semantic analysis is deferred. | Required for Markdown headings and links; R symbol lookup is deferred. | Required for R Markdown syntax explanation. |
| `reddit` | Required for platform-supported Markdown and unsupported portability warnings. | Required for Reddit-specific text constructs when local syntax is known. | Required for Markdown links and recognized Reddit user/subreddit links. | Required for headings, lists, block quotes, and code blocks as supported. | Required for Reddit Markdown tokens. | Required for headings and links; live Reddit lookup is deferred. | Required for Reddit syntax explanation. |
| `stack-overflow` | Required for technical-writing Markdown, code-heavy constructs, and portability warnings. | Required for Stack Overflow-style code, link, and tag-reference constructs. | Required for Markdown links and recognized tag references. | Required for headings, lists, block quotes, and code blocks. | Required for Stack Overflow Markdown tokens. | Required for headings, links, and tag references; live Stack Exchange lookup is deferred. | Required for Stack Overflow syntax explanation. |

## Phase Gate

- A flavor phase may mark a surface `not applicable` only when the research
  source shows that the flavor has no syntax or behavior for that surface.
- A flavor phase may mark a surface `deferred` only with a reason plus either a
  follow-up ticket or an explicit out-of-scope note, such as a live platform API
  lookup that is outside local Markdown analysis.
- Validation evidence must cite this matrix and confirm that all required
  surfaces are either implemented or intentionally deferred with links.

## Deferred Platform Lookup Notes

These follow-ups are outside the local Markdown-language-support phases unless
a later platform-integration ticket explicitly adds authenticated or networked
lookup behavior.

| Flavor | Deferred lookup | Follow-up disposition |
|---|---|---|
| `glfm` | Live GitLab issue, merge request, commit, user, and project metadata lookup. | Out of scope for Phase 26; local GLFM syntax and reference shape support remains required. |
| `mdx` | React/TypeScript symbol lookup for JSX components, imports, and expressions. | Out of scope for Phase 29; Markdown/MDX boundary support remains required without owning VS Code `mdx` language mode. |
| `reddit` | Live Reddit user, subreddit, post, comment, and moderation-state lookup. | Out of scope for Phase 33; local Reddit Markdown syntax and portability diagnostics remain required. |
| `stack-overflow` | Live Stack Exchange tag, question, answer, user, and site metadata lookup. | Out of scope for Phase 34; local Stack Overflow Markdown syntax and tag-reference shape support remain required. |
