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

## Validation Result

| Validation row | Result | Evidence |
|---|---|---|
| MF-VA-005 | Pass | Shared classifier and BDD boundary examples identify host, renderer, conversion, bibliography, and execution-bound references as non-local unless an owning dialect phase adds explicit local-context evidence. |
