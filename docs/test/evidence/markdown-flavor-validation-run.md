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
| Runner / command | Codex local Phase 21 gate execution |
| Commit under test | `b23f739d` |
| Source inputs | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `src/test/ci-workflow.test.ts`, `docs/test/markdown-flavor-verification-spec.md`, `docs/test/markdown-flavor-validation-spec.md`, `docs/test/evidence/markdown-flavor-product-review.md`, `docs/test/evidence/markdown-flavor-host-boundary-review.md`, `docs/test/evidence/markdown-flavor-research-trace.md` |
| Output policy | Summaries only; no vault note content, TOML contents, environment variables, API-like tokens, local user paths, or raw server output included |

## Command Evidence

| Command | Result | Summary |
|---|---|---|
| `bun run bdd -- docs/bdd/features/ofmarkdown-language-mode.feature docs/bdd/features/markdown-flavor-dialects.feature` | Pass | 178 scenarios and 1074 steps passed. |
| `bun test src/test/ci-workflow.test.ts` | Pass after artifact creation | Guard protects flavor feature files, root flavor specs, extension flavor specs, and Phase 21 validation artifacts. |
| `bun test src/` | Pass | 693 tests passed. |
| `bun test src/test/integration/` | Pass | 17 integration tests passed. |
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
| MF-VA-005 | Pass | Host-boundary review records non-local dispositions and deferred dialect work. |

## Verification Rows

| Verification row | Result | Evidence |
|---|---|---|
| MF-VF-001 | Pass | `src/test/ci-workflow.test.ts` guards the root CI battery. |
| MF-VF-002 | Pass | Cucumber config includes `docs/bdd/features/**/*.feature`; exact flavor feature paths are protected by CI workflow tests. |
| MF-VF-003 | Pass | Matrix rows remain honest: root BDD and evidence pass, later extension/host/parser dialect work stays planned or failing. |
| MF-VF-004 | Pass | `bun run lint:docs` passed during local closeout. |
| MF-VF-005 | Pass | CI workflow test protects exact flavor gate files. |
| MF-VF-006 | Pass | CI workflow test protects Phase 21 validation artifact paths. |
| MF-VF-007 | Pass | Host-boundary review artifact exists and records deferred non-local behavior rules. |

## Notes

This run is root/server release-readiness evidence only. It does not replace
Phase E17 Extension Development Host proof for visible selector UX, VS Code
settings persistence, package targets, or Marketplace screenshots.
