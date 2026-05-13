---
title: Markdown Flavor Research Trace
tags: [test/evidence, markdown-flavor, phase-19]
aliases:
  - Markdown flavor profile trace
updated: 2026-05-13
---

# Markdown Flavor Research Trace

## Review Metadata

| Field | Value |
|---|---|
| Review date | 2026-05-13 |
| Reviewer / command | Codex Phase 21 evidence review |
| Commit reviewed | `5aad12ce` |
| Source inputs | `docs/research/*.md`, `docs/features/*markdown-flavor.md`, `docs/ofm-spec/index.md`, `docs/bdd/features/markdown-flavor-dialects.feature` |
| Sanitization | Repository-relative paths and source slugs only; no note bodies, TOML contents, environment variables, tokens, local user paths, or raw server output included |

Phase 19 records profile scope only. Later Phase 22-34 tickets replace planned
surface entries with implemented, deferred, or not-applicable behavior evidence.
`auto` is excluded because it is selector and detection state, not a dialect
profile.

Phase 22 replaces the `original` planned surface entries with implemented
local Markdown behavior. Evidence is recorded in
`src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`,
`src/resolution/__tests__/diagnostic-service.test.ts`,
`src/completion/__tests__/completion-router.test.ts`,
`src/test/integration/markdown-flavor.test.ts`, and
`docs/plans/markdown-flavor-lsp-applicability-matrix.md`.

| Flavor id | Label | Feature page | Primary source | Implementation ticket |
|---|---|---|---|---|
| `original` | Original Markdown | docs/features/original-markdown-flavor.md | docs/research/commonmark-and-original-markdown.md | TASK-315 |
| `commonmark` | CommonMark | docs/features/commonmark-flavor.md | docs/research/commonmark-and-original-markdown.md | TASK-318 |
| `obsidian` | Obsidian | docs/features/obsidian-markdown-flavor.md | docs/ofm-spec/index.md | TASK-321 |
| `gfm` | GitHub Flavored Markdown | docs/features/github-flavored-markdown-flavor.md | docs/research/github-flavored-markdown-analysis.md | TASK-324 |
| `glfm` | GitLab Flavored Markdown | docs/features/gitlab-flavored-markdown-flavor.md | docs/research/gitlab-flavored-markdown-analysis.md | TASK-327 |
| `pandoc` | Pandoc Markdown | docs/features/pandoc-markdown-flavor.md | docs/research/pandoc-markdown-deep-research-report.md | TASK-330 |
| `multimarkdown` | MultiMarkdown | docs/features/multimarkdown-flavor.md | docs/research/multimarkdown-analysis.md | TASK-333 |
| `mdx` | MDX | docs/features/mdx-flavor.md | docs/research/mdx-analysis.md | TASK-336 |
| `kramdown` | kramdown | docs/features/kramdown-flavor.md | docs/research/kramdown-analysis.md | TASK-339 |
| `markdown-extra` | Markdown Extra | docs/features/markdown-extra-flavor.md | docs/research/markdown-extra-analysis.md | TASK-342 |
| `r-markdown` | R Markdown | docs/features/r-markdown-flavor.md | docs/research/r-markdown-analysis.md | TASK-345 |
| `reddit` | Reddit Markdown | docs/features/reddit-markdown-flavor.md | docs/research/reddit-markdown-analysis.md | TASK-348 |
| `stack-overflow` | Stack Overflow Markdown | docs/features/stack-overflow-markdown-flavor.md | docs/research/stack-overflow-markdown-analysis.md | TASK-351 |

## Boundary Notes

Host, renderer, conversion, JSX/ESM, bibliography, and execution-bound behavior
is local and inert in Phase 19. The registry declares these boundaries so later
parser work does not accidentally treat them as local vault links, diagnostics,
navigation targets, or rename targets before the owning implementation ticket
adds tests and validation evidence.

## Validation Result

| Validation row | Result | Evidence |
|---|---|---|
| MF-VA-001 | Pass | Every displayed explicit flavor has a source row above. |
| MF-VA-003 | Pass | Source slugs align with `markdown-flavor-dialects.feature` profile examples. |
