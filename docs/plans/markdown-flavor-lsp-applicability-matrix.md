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

| Flavor | Diagnostics | Completion | Navigation: definition, references, document links, document symbols, folding | Semantic tokens | Hover | Rename |
|---|---|---|---|---|---|---|
| `original` | Required for non-core extension diagnostics and portability warnings. | Required for baseline link/heading constructs only. | Required for inline/reference links, headings, references to headings/links, document symbols for core blocks, and folding for headings and indented code blocks. | Required for core Markdown tokens. | Required for core syntax explanation. | Required for local headings, reference labels, and Markdown links; reject extension-only and host/conversion targets. |
| `commonmark` | Required for CommonMark edge cases and non-enabled extension warnings. | Required for CommonMark block/inline constructs. | Required for inline/reference links, headings, references to headings/links, document symbols for CommonMark blocks, and folding for headings, lists, block quotes, and fenced code. | Required for CommonMark tokens. | Required for standardized syntax explanation. | Required for local headings, reference labels, and Markdown links; reject inactive extension and host/conversion targets. |
| `obsidian` | Required for wiki links, embeds, tags, blocks, callouts, and vault rules. | Required for vault links, embeds, headings, blocks, tags, and aliases. | Required for definitions/references/document links for vault symbols, wiki links, embeds, Markdown links, attachments, tags, headings, and blocks; document symbols and folding required for headings, lists, callouts, code, and math. | Required for OFM tokens. | Required for resolved vault targets and OFM syntax. | Required for profile-safe vault symbols, note links, headings, blocks, tags, embeds, and attachments. |
| `gfm` | Required for tables, task lists, strikethrough, and autolinks. | Required for GFM table/task/list constructs. | Required for definitions/references/document links for headings, Markdown links, and autolinks; document symbols and folding required for headings, lists, block quotes, code, and tables. | Required for GFM tokens. | Required for GFM extension explanation. | Required for local headings, reference labels, and Markdown links; reject GitHub host objects without integration context. |
| `glfm` | Required for GitLab-specific extension boundaries and portability warnings. | Required for GLFM syntax constructs that are local to Markdown text. | Required for definitions/references/document links for local headings, Markdown links, and recognized media references; document symbols and folding required for headings, lists, block quotes, code, and tables; live GitLab object lookup is deferred. | Required for GLFM tokens. | Required for GLFM syntax explanation; live GitLab metadata is deferred. | Required for local Markdown symbols; reject live GitLab issue, MR, epic, user, commit, and project objects without integration context. |
| `pandoc` | Required for extension-enabled syntax, citations, footnotes, math, and metadata boundaries. | Required for citations, footnotes, math, and metadata constructs. | Required for definitions/references/document links for headings, links, footnotes, and locally resolvable citations; document symbols and folding required for headings, lists, block quotes, code, math, and metadata. | Required for Pandoc Markdown tokens. | Required for Pandoc syntax explanation. | Required for local headings, labels, footnotes, and configured local bibliography/citation targets; reject conversion-bound targets without local context. |
| `multimarkdown` | Required for metadata, tables, footnotes, and cross-reference boundaries. | Required for metadata, footnotes, tables, and cross-reference constructs. | Required for definitions/references/document links for headings, links, footnotes, and cross references; document symbols and folding required for headings, lists, block quotes, code, tables, and metadata. | Required for MultiMarkdown tokens. | Required for MultiMarkdown syntax explanation. | Required for local headings, labels, footnotes, abbreviations, and cross references; reject export-only targets without local context. |
| `mdx` | Required for Markdown/JSX boundary diagnostics and Markdown-mode safety. | Required for Markdown constructs and MDX component/expression boundaries. | Required for definitions/references/document links for Markdown headings and links, plus document symbols/folding for Markdown headings, JSX blocks, and code fences; React symbol lookup is deferred. | Required for Markdown and MDX boundary tokens. | Required for MDX syntax explanation without changing VS Code `languageId`. | Required for local Markdown symbols and explicitly local MDX constructs only; reject React/TypeScript imports, JSX components, and expression targets without integration context. |
| `kramdown` | Required for attributes, definition lists, footnotes, and ID boundaries. | Required for attribute, footnote, and definition-list constructs. | Required for definitions/references/document links for headings, links, footnotes, and custom IDs; document symbols and folding required for headings, lists, block quotes, code, and attribute blocks. | Required for kramdown tokens. | Required for kramdown syntax explanation. | Required for local headings, custom IDs, labels, footnotes, and reference links; reject inactive extension and conversion-only targets. |
| `markdown-extra` | Required for tables, definition lists, footnotes, and attribute boundaries. | Required for Markdown Extra tables, footnotes, and definition lists. | Required for definitions/references/document links for headings, links, footnotes, and definition terms; document symbols and folding required for headings, lists, block quotes, code, tables, and definition lists. | Required for Markdown Extra tokens. | Required for Markdown Extra syntax explanation. | Required for local headings, labels, footnotes, abbreviations, and reference links; reject kramdown/Pandoc-only constructs unless explicitly profiled. |
| `r-markdown` | Required for YAML metadata, code chunk fences, math, and Markdown boundary diagnostics. | Required for R code chunk and metadata constructs. | Required for definitions/references/document links for Markdown headings and links, plus document symbols/folding for headings, metadata, chunk fences, and Markdown blocks; R symbol lookup is deferred. | Required for Markdown/R chunk boundary tokens; R semantic analysis is deferred. | Required for R Markdown syntax explanation. | Required for local Markdown symbols and chunk labels where syntax-preserving edits are safe; reject R symbol, execution-bound, and generated-output targets. |
| `reddit` | Required for platform-supported Markdown and unsupported portability warnings. | Required for Reddit-specific text constructs when local syntax is known. | Required for definitions/references/document links for local headings, Markdown links, and recognized Reddit user/subreddit link shapes; document symbols/folding required for supported headings, lists, block quotes, and code blocks; live Reddit lookup is deferred. | Required for Reddit Markdown tokens. | Required for Reddit syntax explanation. | Required for local Markdown symbols; reject live Reddit user, subreddit, post, comment, and moderation targets without integration context. |
| `stack-overflow` | Required for technical-writing Markdown, code-heavy constructs, and portability warnings. | Required for Stack Overflow-style code, link, and tag-reference constructs. | Required for definitions/references/document links for headings, links, and tag-reference shapes; document symbols/folding required for headings, lists, block quotes, and code blocks; live Stack Exchange lookup is deferred. | Required for Stack Overflow Markdown tokens. | Required for Stack Overflow syntax explanation. | Required for local Markdown symbols; reject live Stack Exchange tag, question, answer, user, and comment targets without integration context. |

## Phase Gate

- A flavor phase may mark a surface `not applicable` only when the research
  source shows that the flavor has no syntax or behavior for that surface.
- A flavor phase may mark a surface `deferred` only with a reason plus either a
  follow-up ticket or an explicit out-of-scope note, such as a live platform API
  lookup that is outside local Markdown analysis.
- Validation evidence must cite this matrix and confirm that diagnostics,
  completion, navigation sub-surfaces, semantic tokens, hover, rename, and
  host/conversion boundary classification are either implemented or
  intentionally deferred with links.

## Non-Local Boundary Notes

These follow-ups are outside the local Markdown-language-support phases unless
a later platform-integration ticket explicitly adds authenticated, networked,
renderer, conversion, bibliography, or execution-context lookup behavior.

| Flavor | Deferred lookup | Follow-up disposition |
|---|---|---|
| `gfm` | Live GitHub issue, pull request, commit, user, label, alert rendering, and repository metadata lookup. | Out of scope for Phase 25; local GFM syntax, reference-shape classification, and unsafe rename rejection remain required. |
| `glfm` | Live GitLab issue, merge request, commit, user, and project metadata lookup. | Out of scope for Phase 26; local GLFM syntax and reference shape support remains required. |
| `pandoc` | Renderer/conversion extension behavior, bibliography databases not configured in the workspace, and output-format-specific cross-reference behavior. | Out of scope for Phase 27; local citation/reference shape and configured local bibliography behavior remains required. |
| `multimarkdown` | Export-only cross-reference, metadata, and generated-output behavior. | Out of scope for Phase 28; local cross-reference and metadata syntax support remains required. |
| `mdx` | React/TypeScript symbol lookup for JSX components, imports, and expressions. | Out of scope for Phase 29; Markdown/MDX boundary support remains required without owning VS Code `mdx` language mode. |
| `r-markdown` | R execution, package-aware symbol lookup, generated output, and runtime chunk evaluation. | Out of scope for Phase 32; local chunk boundary and label support remains required. |
| `reddit` | Live Reddit user, subreddit, post, comment, and moderation-state lookup. | Out of scope for Phase 33; local Reddit Markdown syntax and portability diagnostics remain required. |
| `stack-overflow` | Live Stack Exchange tag, question, answer, user, and site metadata lookup. | Out of scope for Phase 34; local Stack Overflow Markdown syntax and tag-reference shape support remain required. |
