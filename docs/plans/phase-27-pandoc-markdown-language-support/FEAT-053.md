---
id: "FEAT-053"
title: "Pandoc Markdown Language Support"
type: feature
status: in-review
priority: high
phase: 27
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-052"]
tags: [tickets/feature, "phase/27", markdown-flavor, "pandoc"]
aliases: ["FEAT-053"]
---

# Pandoc Markdown Language Support

> [!INFO] FEAT-053 - Feature - Phase 27 - Status: in-review

## Implementation Plan

Phase 27 is stacked after Phase 26 and reuses the explicit flavor dispatch,
CommonMark base, and recent GFM/GLFM local-surface pattern. Pandoc work will
model source-local Markdown syntax only: title/YAML metadata, citations as
bibliography-bound shapes, footnotes, attributes and labels, fenced Divs,
definition lists, symbols, folds, semantic tokens, snippets, diagnostics, and
host/conversion boundary classification. It will not run Pandoc, citeproc,
filters, templates, or output writers.

Primary source paths:

- `src/parser/pandoc-parser.ts`
- `src/parser/ofm-parser.ts`
- `src/parser/types.ts`
- `src/resolution/diagnostic-service.ts`
- `src/completion/completion-router.ts`
- `src/handlers/document-symbol.handler.ts`
- `src/handlers/folding-range.handler.ts`
- `src/handlers/semantic-tokens.handler.ts`
- `src/markdown-flavor/markdown-flavor-profiles.ts`
- `src/markdown-flavor/non-local-boundary-classifier.ts`
- `src/lsp/lsp.module.ts`

Primary RED test paths:

- `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`
- `src/resolution/__tests__/diagnostic-service.test.ts`
- `src/completion/__tests__/completion-router.test.ts`
- `src/handlers/__tests__/document-symbol.handler.test.ts`
- `src/handlers/__tests__/folding-range.handler.test.ts`
- `src/handlers/__tests__/semantic-tokens.handler.test.ts`
- `src/test/integration/markdown-flavor.test.ts`

## Description

Implement first-class pandoc language support for Pandoc Markdown, using [[docs/research/pandoc-markdown-deep-research-report]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Pandoc Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-015 - Pandoc Markdown Parser And Analysis|MF-U-015]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-330]] | Implement Pandoc Markdown parser semantics | Task | done |
| [[TASK-331]] | Add Pandoc diagnostics and LSP features | Task | done |
| [[TASK-332]] | Add Pandoc tests and validation evidence | Task | done |
| [[CHORE-125]] | Phase 27 trace and documentation sweep | Chore | done |
| [[CHORE-126]] | Phase 27 verification and closeout sweep | Chore | done |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| FlavorLSP.Profile.SignatureCoverage | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Parser.ProfileDispatch | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Diagnostics.ProfileRules | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Completion.ProfileCandidates | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Navigation.ProfileResolution | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Hover.ProfileMetadata | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.SemanticTokens.ProfileTokens | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.Rename.ProfileSafety | [[docs/requirements/functional/markdown-flavor-lsp]] |
| FlavorLSP.HostBoundary.NonLocalReferences | [[docs/requirements/functional/markdown-flavor-lsp]] |

## Definition of Done

- [x] pandoc has source-backed parser/profile behavior.
- [x] pandoc satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [x] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [x] pandoc behavior is covered at every required test level.
- [x] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Added concrete implementation and RED test paths
> for TASK-330 through TASK-332. Pandoc conversion, citeproc, filters,
> templates, output writer behavior, and unconfigured bibliography databases
> remain deferred/non-local.

> [!INFO] Local gate passed - 2026-05-13
> Status set to `done` after A-M local execution. Exact phase gate passed:
> `bun test src/parser/__tests__/markdown-flavor-profiles.test.ts; bun test src/test/integration/markdown-flavor.test.ts; bun run bdd; bun test src/test/ci-workflow.test.ts; bun run lint:docs; bun run typecheck; bun run lint; bun run build`.

> [!INFO] In review - 2026-05-13
> PR #78 opened and CI run `25827784301` passed. Ledger set to in-review with
> PR URL.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

Pandoc fit the same local-surface pattern used by GFM and GLFM. The RED
coverage exposed missing parser indices, snippets, symbols, folds, tokens,
diagnostics, and spawned-server counts; the GREEN implementation stayed scoped
to source-local Markdown syntax and did not require Pandoc execution.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| none | — | Steps E-G found no lint, quality, or security findings requiring new tickets. | 0 h |

### Process observations

The A-M checklist worked cleanly for this flavor. Verification and validation
directories remain absent, so those steps were recorded as N/A while BDD,
integration, unit, docs evidence, and the exact local gate carried the proof.

### Carry-forward actions

- [ ] Continue Phase 28 directly after Phase 27 because MultiMarkdown shares
  metadata, footnote, citation, and cross-reference concerns with Pandoc.
- [ ] Keep conversion/export behavior deferred unless a dedicated ticket owns
  configured local context.

### Rule / template amendments

- [ ] none
