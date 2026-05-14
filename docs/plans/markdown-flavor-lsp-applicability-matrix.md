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

## Phase 22 Original Markdown Disposition

Phase 22 marks the `original` profile's LSP surfaces implemented for local
Markdown behavior. Existing shared Markdown handlers provide local link,
heading, document-symbol, folding, hover, semantic-token, and rename behavior
from the parsed index. Phase 22 adds explicit parser dispatch, FG101
portability diagnostics, and completion suppression for Original-inert
Obsidian constructs.

| Surface | Phase 22 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for Original portability warnings. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for standard Markdown link/heading contexts; inactive Obsidian contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Navigation, document symbols, folding | Implemented through the parsed Original index: headings and Markdown links remain active; wiki links, embeds, tags, and callouts are absent. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing structural/navigation suites |
| Semantic tokens | Implemented through existing Markdown token surfaces for core syntax; inactive extension tokens are absent from the Original index. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Hover | Implemented through existing local Markdown metadata surfaces for core syntax; no host-specific Original syntax exists. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for local headings and Markdown link references through existing rename handlers; inactive extension syntax has no Original index entries. | existing rename and Markdown-link rename suites |

## Phase 23 CommonMark Disposition

Phase 23 marks the `commonmark` profile's LSP surfaces implemented for local
CommonMark behavior. Existing shared Markdown handlers provide local link,
heading, document-symbol, folding, hover, semantic-token, and rename behavior
from the parsed CommonMark-compatible index. Phase 23 adds explicit CommonMark
surface status, autolink indexing, FG102 portability diagnostics, and
completion suppression for Obsidian-only contexts outside the Obsidian flavor.

| Surface | Phase 23 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for CommonMark portability warnings. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for standard Markdown link/heading contexts; inactive Obsidian contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Navigation, document symbols, folding | Implemented through the parsed CommonMark index: headings, inline links, reference labels, and autolinks remain active; wiki links, embeds, tags, and callouts are absent. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing structural/navigation suites |
| Semantic tokens | Implemented through existing Markdown token surfaces for CommonMark syntax; inactive extension tokens are absent from the CommonMark index. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` |
| Hover | Implemented through existing local Markdown metadata surfaces for CommonMark syntax; no host-specific CommonMark syntax exists. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for local headings and Markdown link references through existing rename handlers; inactive extension syntax has no CommonMark index entries. | existing rename and Markdown-link rename suites |

## Phase 24 Obsidian Disposition

Phase 24 marks the `obsidian` profile's LSP surfaces implemented for existing
Obsidian Flavored Markdown behavior under explicit flavor state. Existing OFM
handlers continue to provide vault-local diagnostics, completions, navigation,
document links, document symbols, folding, semantic tokens, hover, and safe
rename behavior from the parsed Obsidian index. Phase 24 adds explicit
Obsidian profile status plus parser, diagnostic, completion, and spawned-server
regression evidence proving this behavior no longer depends on `ofmarkdown`
language-mode promotion.

| Surface | Phase 24 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for vault-local wiki links, embeds, block references, tags, callouts, and attachment rules; active Obsidian syntax does not emit Original/CommonMark portability warnings. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for vault links, embeds, headings, blocks, tags, callouts, and aliases when `doc.markdownFlavor` is `obsidian`. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through the parsed Obsidian index: wiki links, embeds, tags, block anchors, callouts, headings, Markdown links, and attachments remain active. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing structural/navigation suites |
| Semantic tokens | Implemented through existing OFM token surfaces for active Obsidian constructs and opaque-region suppression. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing semantic-token suite |
| Hover | Implemented through existing vault target metadata and attachment hover surfaces; renderer-only semantics stay documented as host-boundary behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md`, existing hover suites |
| Rename | Implemented for safe vault-local notes, headings, blocks, Markdown links, embeds, and attachments through existing rename handlers. | existing rename and Markdown-link rename suites |

## Phase 25 GFM Disposition

Phase 25 marks the `gfm` profile's local LSP surfaces implemented for the
published GFM syntax subset. GFM extends the CommonMark base with local indices
for pipe tables, task-list items, strikethrough, and extended bare autolinks.
GitHub platform objects remain host-bound: the server classifies them locally
but does not perform live GitHub lookup, network access, process execution,
dynamic imports, or out-of-root file reads.

| Surface | Phase 25 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed pipe-table shape (`FG201`) and existing local Markdown-link diagnostics; Obsidian-only syntax stays inert. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for GFM table and task-list snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through parsed headings, Markdown links, autolinks, GFM table symbols, task symbols, and table folds. Host references remain non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for GFM task markers and strikethrough spans. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; live GitHub metadata hover is deferred as host-bound behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; GitHub issue, pull request, commit, user, and label references are rejected by remaining non-local. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 26 GLFM Disposition

Phase 26 marks the `glfm` profile's local LSP surfaces implemented for the
offline-testable GitLab syntax subset. GLFM inherits the GFM base and adds
local indices for inapplicable task markers, description lists, footnote
definitions, table-of-contents tags, and GitLab host-reference shapes. Live
GitLab object lookup remains deferred.

| Surface | Phase 26 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed GLFM description lists (`FG202`); inherited malformed GFM tables still use `FG201`; GitLab host objects do not become vault diagnostics. | `src/resolution/__tests__/diagnostic-service.test.ts` |
| Completion | Implemented for GLFM inapplicable task-item and table-of-contents snippets plus inherited GFM table/task snippets; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, inherited GFM tables, GLFM description-list symbols/folds, and TOC symbols. GitLab host references remain non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for GLFM inapplicable task markers and footnote labels plus inherited GFM token behavior. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; live GitLab metadata hover is deferred as host-bound behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; GitLab issue, merge request, epic, user, and project references remain non-local without integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 27 Pandoc Disposition

Phase 27 marks the `pandoc` profile's local LSP surfaces implemented for the
source-backed Pandoc Markdown subset. Pandoc adds local indices for title
blocks, citations, footnotes, attribute sets, fenced Divs, and definition
lists. Pandoc conversion, citeproc processing, filters, templates, output
writers, and unconfigured bibliography databases remain deferred.

| Surface | Phase 27 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed Pandoc attribute sets (`FG301`); citations are classified as bibliography-bound rather than broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for Pandoc citation and attribute snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, title-block symbols, attribute-label symbols, footnote symbols, fenced-Div folds, and definition-list folds. Bibliography and conversion targets remain non-local unless configured local context exists. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for Pandoc citations, footnote labels, and attribute sets. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; Pandoc conversion and bibliography metadata hover is deferred as boundary behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; citation, bibliography, conversion, writer, template, and filter targets remain non-local without configured local context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 28 MultiMarkdown Disposition

Phase 28 marks the `multimarkdown` profile's local LSP surfaces implemented for
the source-backed MultiMarkdown subset. MultiMarkdown adds local indices for
metadata, tables, footnotes, citations, cross-references, labels, and
abbreviations. MultiMarkdown conversion, export writers, BibTeX processing,
transclusion, and generated-output behavior remain deferred.

| Surface | Phase 28 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed MultiMarkdown metadata (`FG302`); export cross-references are classified as conversion-bound rather than broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for MultiMarkdown metadata, citation, and footnote snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, metadata symbols, label symbols, citation symbols, footnote symbols, metadata folds, and table folds. Export and generated-output targets remain non-local unless configured local context exists. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for MultiMarkdown metadata keys, labels, citations, and footnotes. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; MultiMarkdown conversion and generated-output metadata hover is deferred as boundary behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; export cross-references, bibliography processing, and generated-output targets remain non-local without configured local context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 29 MDX Disposition

Phase 29 marks the `mdx` profile's local LSP surfaces implemented for
Markdown-language documents that opt into MDX flavor behavior. MDX adds local
indices for ESM declarations, JSX elements, expression islands, malformed local
boundaries, and opaque MDX regions. MDX compilation, React/TypeScript symbol
lookup, import resolution, bundler behavior, and VS Code `mdx` language-mode
ownership remain deferred.

| Surface | Phase 29 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed MDX boundaries (`FG401`); renderer-bound component references do not become broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for MDX component, expression, and named-export snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, MDX ESM declaration symbols, JSX component symbols, expression symbols, JSX folds, and expression folds. React and TypeScript targets remain renderer/integration-bound unless configured local context exists. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for MDX ESM declarations, JSX elements, and expression islands. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; MDX component/runtime metadata hover is deferred as renderer-bound behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; React/TypeScript imports, JSX components, and expression targets remain non-local without integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 30 kramdown Disposition

Phase 30 marks the `kramdown` profile's local LSP surfaces implemented for
source-backed kramdown syntax. kramdown adds local indices for attribute
lists, definition lists, pipe tables, footnotes, and math blocks. Ruby,
Jekyll, renderer-generated output, converters, syntax highlighters, and
sanitizers remain out of scope.

| Surface | Phase 30 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed kramdown attributes (`FG501`); renderer output and generated anchors do not become broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for kramdown attribute and footnote snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, kramdown attribute symbols, definition-list symbols, table symbols, footnote symbols, definition-list folds, table folds, and math folds. Renderer-generated anchors and conversion output remain non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for kramdown attribute markers and footnote labels. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; renderer-generated output and sanitizer metadata hover are deferred as boundary behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; renderer-generated anchors and conversion output remain non-local without configured integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 31 Markdown Extra Disposition

Phase 31 marks the `markdown-extra` profile's local LSP surfaces implemented
for source-backed Markdown Extra syntax. Markdown Extra adds local indices for
attribute blocks, definition lists, pipe tables, footnotes, abbreviations, and
fenced code blocks. PHP Markdown Extra execution, HTML conversion, renderer
output, generated metadata, and syntax highlighters remain out of scope.

| Surface | Phase 31 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed Markdown Extra attributes (`FG502`); renderer/conversion output does not become broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for Markdown Extra table, footnote, abbreviation, and attribute snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, Markdown Extra attribute symbols, definition-list symbols, table symbols, footnote symbols, abbreviation symbols, definition-list folds, table folds, and fenced-code folds. Renderer/conversion output remains non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for Markdown Extra attribute markers, footnote labels, and abbreviation labels. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; renderer/conversion metadata hover is deferred as boundary behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; generated output, conversion artifacts, and renderer metadata remain non-local without configured integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 32 R Markdown Disposition

Phase 32 marks the `r-markdown` profile's local LSP surfaces implemented for
source-backed R Markdown syntax. R Markdown adds local indices for YAML
metadata, fenced chunk headers, chunk labels/options, inline R markers, and
malformed chunk headers. R, Python, shell, notebook, knitr, Pandoc, Shiny,
package, cache, runtime, and generated-output behavior remain out of scope.

| Surface | Phase 32 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for malformed R Markdown chunk headers (`FG601`); executable chunks do not run and generated output does not become a broken vault link. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for R Markdown chunk, chunk-option, and inline-expression snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, R Markdown chunk symbols, inline-expression symbols, and chunk folds. Runtime symbols, package objects, generated figures, and notebook output remain non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for R Markdown chunk engines, chunk labels, chunk options, and inline expressions. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; runtime/package/generated-output hover is deferred as execution-bound behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; chunk runtime symbols, package references, generated output, and execution targets remain non-local without configured integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

## Phase 33 Reddit Markdown Disposition

Phase 33 marks the `reddit` profile's local LSP surfaces implemented for
source-backed Reddit Markdown syntax. Reddit adds local indices for spoilers,
superscript, strikethrough, pipe tables, `r/` and `u/` host-reference shapes,
old-Reddit ordered-list portability warnings, and unsafe link-scheme warnings.
Live Reddit user, subreddit, post, comment, moderation-state, and Rich Text
editor behavior remain out of scope.

| Surface | Phase 33 disposition | Evidence |
|---|---|---|
| Diagnostics | Implemented for old-Reddit-incompatible `1)` ordered-list markers (`FG701`) and unsupported URL schemes (`FG702`); host references do not become broken vault links. | `src/resolution/__tests__/diagnostic-service.test.ts`, `src/test/integration/markdown-flavor.test.ts` |
| Completion | Implemented for Reddit spoiler and superscript snippets plus existing local Markdown link/heading completions; Obsidian-only contexts return no candidates. | `src/completion/__tests__/completion-router.test.ts` |
| Navigation, document symbols, folding | Implemented through local headings, Markdown links, Reddit table symbols, subreddit/user host-reference symbols, and table folds. Live Reddit lookup remains non-local. | `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts` |
| Semantic tokens | Implemented for Reddit spoiler text, superscript text, and host-reference targets. | `src/handlers/__tests__/semantic-tokens.handler.test.ts` |
| Hover | Existing local Markdown hover surfaces remain available; live Reddit metadata hover is deferred as host-bound behavior. | `docs/test/evidence/markdown-flavor-host-boundary-review.md` |
| Rename | Implemented for existing safe local headings and Markdown links; live Reddit users, subreddits, posts, comments, and moderation targets remain non-local without configured integration context. | existing rename and Markdown-link rename suites, `src/markdown-flavor/non-local-boundary-classifier.ts` |

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

Until such a ticket exists, boundary classification must be local and inert: no
network requests, process execution, dynamic module imports, or out-of-root file
reads may be performed while classifying host, conversion, renderer,
bibliography, JSX/ESM, or execution-bound references.

| Flavor | Deferred lookup | Follow-up disposition |
|---|---|---|
| `gfm` | Live GitHub issue, pull request, commit, user, label, alert rendering, and repository metadata lookup. | Out of scope for Phase 25; local GFM syntax, reference-shape classification, and unsafe rename rejection remain required. |
| `glfm` | Live GitLab issue, merge request, commit, user, and project metadata lookup. | Out of scope for Phase 26; local GLFM syntax and reference shape support remains required. |
| `pandoc` | Renderer/conversion extension behavior, bibliography databases not configured in the workspace, and output-format-specific cross-reference behavior. | Out of scope for Phase 27; local citation/reference shape and configured local bibliography behavior remains required. |
| `multimarkdown` | Export-only cross-reference, metadata, and generated-output behavior. | Out of scope for Phase 28; local cross-reference and metadata syntax support remains required. |
| `mdx` | React/TypeScript symbol lookup for JSX components, imports, and expressions. | Out of scope for Phase 29; Markdown/MDX boundary support remains required without owning VS Code `mdx` language mode. |
| `kramdown` | Ruby/Jekyll renderer behavior, generated anchors, converters, syntax highlighters, sanitizers, and output HTML metadata. | Out of scope for Phase 30; local kramdown attribute, definition-list, table, footnote, and math syntax support remains required. |
| `markdown-extra` | Renderer-specific attributes, generated HTML, PHP Markdown Extra conversion, syntax highlighter metadata, and rendering metadata. | Out of scope for Phase 31; local Markdown Extra tables, definitions, footnotes, abbreviations, fenced code, and attributes support remains required. |
| `r-markdown` | R execution, package-aware symbol lookup, generated output, and runtime chunk evaluation. | Out of scope for Phase 32; local chunk boundary and label support remains required. |
| `reddit` | Live Reddit user, subreddit, post, comment, and moderation-state lookup. | Out of scope for Phase 33; local Reddit Markdown syntax and portability diagnostics remain required. |
| `stack-overflow` | Live Stack Exchange tag, question, answer, user, and site metadata lookup. | Out of scope for Phase 34; local Stack Overflow Markdown syntax and tag-reference shape support remain required. |
