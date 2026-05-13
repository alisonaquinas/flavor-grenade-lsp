---
title: Markdown Flavor Host Boundary Review
tags:
  - test/evidence
  - markdown-flavor
aliases:
  - Markdown Flavor Host Boundary Evidence
updated: 2026-05-13
---

# Markdown Flavor Host Boundary Review

## Review Metadata

| Field | Value |
|---|---|
| Review date | 2026-05-13 |
| Reviewer / command | Codex Phase 21 evidence review |
| Commit reviewed | `5aad12ce` |
| Source inputs | `src/markdown-flavor/non-local-boundary-classifier.ts`, `src/test/integration/markdown-flavor.test.ts`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/plans/markdown-flavor-lsp-applicability-matrix.md` |
| Sanitization | Repository-relative paths and summarized references only; no note bodies, TOML contents, environment variables, tokens, local user paths, or raw server output included |

## Phase 20 Evidence

Phase 20 introduced `classifyMarkdownBoundaryReference` in
`src/markdown-flavor/non-local-boundary-classifier.ts`.

Covered dispositions:

| Flavor | Example | Disposition |
|---|---|---|
| `gfm` / `glfm` | `#123` | `non-local-host` |
| `pandoc` | `[@doe2020]` | `bibliography-bound` |
| `multimarkdown` | `[Figure][]` | `conversion-bound` |
| `mdx` | `<Component />` | `renderer-bound` |
| `r-markdown` | ```` ```{r setup}```` | `execution-bound` |
| `reddit` | `r/obsidianmd` | `non-local-host` |
| `stack-overflow` | `[tag:markdown]` | `non-local-host` |

Verification commands:

```bash
bun test src/lsp/handlers/__tests__/configuration.handler.test.ts
bun test src/test/integration/markdown-flavor.test.ts
```

Both commands passed locally on 2026-05-13.

## Residual Work

Later dialect phases must add surface-specific false-local-resolution fixtures
before diagnostics, navigation, rename, hover, and semantic-token behavior are
marked complete for that flavor.

## Phase 22 Original Markdown Review

Original Markdown has no host-specific syntax in the profile registry. Phase 22
therefore treats later extensions such as wiki links, embeds, tags, callouts,
pipe tables, task lists, and fenced code blocks as inert or portability-warning
syntax, not as local vault navigation or rename targets.

Evidence:

| Surface | Result |
|---|---|
| Diagnostics | FG101 portability warnings cover Original-inert extension syntax. |
| Completion | Obsidian-only completion contexts return no candidates for Original Markdown. |
| Navigation / rename | Inactive constructs have no Original index entries, so shared local handlers do not treat them as vault targets. |

## Phase 23 CommonMark Review

CommonMark has no host-specific syntax in the profile registry. Phase 23
therefore treats GFM pipe tables and task lists plus Obsidian wiki links,
embeds, tags, and callouts as inert or portability-warning syntax, not as
local vault navigation or rename targets.

Evidence:

| Surface | Result |
|---|---|
| Diagnostics | FG102 portability warnings cover CommonMark-inert extension syntax. |
| Completion | Obsidian-only completion contexts return no candidates for CommonMark. |
| Navigation / rename | Inactive constructs have no CommonMark index entries, so shared local handlers do not treat them as vault targets. |

## Phase 24 Obsidian Review

Obsidian declares vault-local syntax and renderer semantics in the profile
registry. Phase 24 implements local vault behavior for parsed Obsidian
constructs while keeping renderer-only semantics local and inert: no network
access, process execution, dynamic import, or out-of-root file read is allowed
when resolving or explaining Obsidian references.

| Surface | Boundary disposition |
|---|---|
| Parser/profile | Wiki links, embeds, tags, block anchors, callouts, frontmatter, and Obsidian opaque regions are active only under effective flavor `obsidian`. |
| Diagnostics | Active Obsidian syntax does not emit Original/CommonMark portability warnings; vault diagnostics remain local to the vault index and attachment metadata. |
| Completion | Obsidian-only completion contexts return candidates for the Obsidian flavor and remain suppressed for Original/CommonMark. |
| Navigation / rename | Existing handlers operate on vault-local notes, headings, blocks, Markdown links, embeds, and attachments; renderer-only semantics are not treated as external platform lookups. |

## Phase 25 GFM Review

GFM declares GitHub issue, pull request, commit, user, and label references as
host-specific syntax in the profile registry. Phase 25 implements local syntax
for tables, task-list items, strikethrough, and extended autolinks, while live
GitHub platform lookup remains deferred.

| Surface | Boundary disposition |
|---|---|
| Parser/profile | Pipe tables, task-list items, strikethrough, and extended bare autolinks are active only under effective flavor `gfm`; Obsidian wiki links, embeds, tags, and callouts stay inert. |
| Diagnostics | `FG201` covers malformed local GFM tables; GitHub host references do not become broken vault links. |
| Completion | GFM table and task snippets are local; Obsidian-only completion contexts stay suppressed. |
| Navigation / rename | Local Markdown links, headings, and autolinks use existing local behavior; `#123` and related GitHub host objects remain `non-local-host` without network access or workspace edits. |

## Validation Result

| Validation row | Result | Evidence |
|---|---|---|
| MF-VA-005 | Pass | Shared classifier and BDD boundary examples identify host, renderer, conversion, bibliography, and execution-bound references as non-local unless an owning dialect phase adds explicit local-context evidence; Phase 25 records GFM GitHub references as host-bound. |
