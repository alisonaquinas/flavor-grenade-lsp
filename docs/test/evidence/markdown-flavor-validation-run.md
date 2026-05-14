---
title: Markdown Flavor Validation Run
tags:
  - test/evidence
  - markdown-flavor
aliases:
  - Markdown Flavor Validation Evidence
updated: 2026-05-13
---

# Markdown Flavor Validation Run

## Run Metadata

| Field | Value |
|---|---|
| Run date | 2026-05-13 |
| Runner / command | Codex local Phase 31 gate execution |
| Commit under test | `7d3015c` |
| Source inputs | `src/parser/__tests__/markdown-flavor-profiles.test.ts`, `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, `src/resolution/__tests__/diagnostic-service.test.ts`, `src/completion/__tests__/completion-router.test.ts`, `src/handlers/__tests__/document-symbol.handler.test.ts`, `src/handlers/__tests__/folding-range.handler.test.ts`, `src/handlers/__tests__/semantic-tokens.handler.test.ts`, `src/test/integration/markdown-flavor.test.ts`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/test/markdown-flavor-unit-spec.md`, `docs/test/markdown-flavor-integration-spec.md`, `docs/test/evidence/markdown-flavor-host-boundary-review.md`, `docs/test/evidence/markdown-flavor-research-trace.md` |
| Output policy | Summaries only; no vault note content, TOML contents, environment variables, API-like tokens, local user paths, or raw server output included |

## Command Evidence

| Command | Result | Summary |
|---|---|---|
| `bun run bdd` | Pass | 178 scenarios and 1074 steps passed. |
| `bun test src/parser/__tests__/markdown-flavor-profiles.test.ts` | Pass | 6 tests passed. |
| `bun test src/parser/__tests__/markdown-flavor-parser-analysis.test.ts` | Pass | Parser analysis tests passed, including Phase 31 Markdown Extra syntax and implemented surface status. |
| `bun test src/test/integration/markdown-flavor.test.ts` | Pass | Spawned-server flavor tests passed, including Original/CommonMark/Obsidian/GFM/GLFM/Pandoc/MultiMarkdown/MDX/kramdown behavior and Phase 31 Markdown Extra syntax counts. |
| `bun test src/test/ci-workflow.test.ts` | Pass | 6 tests passed; guard protects flavor feature files, root flavor specs, extension flavor specs, and validation artifacts. |
| `bun test src/` | Pass | 764 tests passed. |
| `bun test src/test/integration/` | Pass | 27 integration tests passed. |
| `bun run typecheck` | Pass | `tsc --noEmit` completed successfully. |
| `bun run lint --max-warnings 0` | Pass | ESLint completed with zero warnings. |
| `bun audit` | Pass | No vulnerabilities found. |
| `bun run lint:docs` | Pass | OFM docs lint completed successfully. |
| `bun run format:check` | Pass | Prettier check completed successfully. |
| `bun run build` | Pass | TypeScript project build completed successfully. |

## Validation Rows

| Validation row | Result | Evidence |
|---|---|---|
| MF-VA-001 | Pass | Product review and research trace cover each displayed explicit flavor. |
| MF-VA-002 | Pass | BDD examples and ADR020 flavor ids align. |
| MF-VA-003 | Pass | Dialect feature examples include source and signature rows. |
| MF-VA-004 | Pass | Product review records MDX language-mode safety. |
| MF-VA-005 | Pass | Host-boundary review records non-local dispositions, deferred dialect work, Phase 22 Original Markdown inert-extension behavior, Phase 23 CommonMark inert-extension behavior, Phase 24 Obsidian vault-local behavior, Phase 25 GFM GitHub host-bound behavior, Phase 26 GLFM GitLab host-bound behavior, Phase 27 Pandoc bibliography-bound behavior, Phase 28 MultiMarkdown conversion-bound behavior, Phase 29 MDX renderer-bound behavior, Phase 30 kramdown renderer/conversion-bound behavior, and Phase 31 Markdown Extra renderer/conversion-bound behavior. |

## Verification Rows

| Verification row | Result | Evidence |
|---|---|---|
| MF-VF-001 | Pass | `src/test/ci-workflow.test.ts` guards the root CI battery. |
| MF-VF-002 | Pass | Cucumber config includes `docs/bdd/features/**/*.feature`; exact flavor feature paths are protected by CI workflow tests. |
| MF-VF-003 | Pass | Matrix rows remain honest: root BDD and evidence pass, later extension/host/parser dialect work stays planned or failing. |
| MF-VF-004 | Pass | `bun run lint:docs` passed during local closeout. |
| MF-VF-005 | Pass | CI workflow test protects exact flavor gate files. |
| MF-VF-006 | Pass | CI workflow test protects Phase 21 validation artifact paths. |
| MF-VF-007 | Pass | Host-boundary review artifact exists and records deferred non-local behavior rules plus Phase 22 Original Markdown, Phase 23 CommonMark, Phase 24 Obsidian, Phase 25 GFM, Phase 26 GLFM, Phase 27 Pandoc, Phase 28 MultiMarkdown, Phase 29 MDX, Phase 30 kramdown, and Phase 31 Markdown Extra dispositions. |

## Notes

This run is root/server Phase 31 evidence. It does not
replace Phase E17 Extension Development Host proof for visible selector UX, VS
Code settings persistence, package targets, or Marketplace screenshots.
BUG-045 was opened and fixed during Phase 22 Step I after full unit testing
found frontmatter delimiters could be scanned as setext headings. BUG-046 was
opened and fixed during Phase 23 Step L after BDD showed a watcher fixture was
asserting wiki-link completions without selecting the Obsidian flavor.
Phase 25 added local GFM syntax coverage and opened CHORE-143 during Step F
before documenting the exported parser result contract. Phase 26 added local
GLFM syntax coverage and opened CHORE-144 during Step F before splitting the
description-list parser helper. Phase 27 added local Pandoc syntax coverage.
Phase 28 added local MultiMarkdown syntax coverage and opened CHORE-145 during
Step F before shortening the table parser helper. Steps E and G found no lint
or security tickets. Phase 29 added local MDX syntax coverage. Phase 30 added
local kramdown syntax coverage. Phase 31 added local Markdown Extra syntax
coverage; Steps E, F, and G found no lint, code-quality, or security tickets.
