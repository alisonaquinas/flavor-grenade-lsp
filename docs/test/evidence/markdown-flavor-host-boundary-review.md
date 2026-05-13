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
