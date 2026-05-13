---
id: "FEAT-052"
title: "GitLab Flavored Markdown Language Support"
type: feature
status: in-review
priority: high
phase: 26
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-051"]
tags: [tickets/feature, "phase/26", markdown-flavor, "glfm"]
aliases: ["FEAT-052"]
---

# GitLab Flavored Markdown Language Support

> [!INFO] FEAT-052 - Feature - Phase 26 - Status: in-review

## Description

Implement first-class glfm language support for GitLab Flavored Markdown, using [[docs/research/gitlab-flavored-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for GitLab Flavored Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-014 - GLFM Parser And Analysis|MF-U-014]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-327]] | Implement GLFM parser semantics | Task | done |
| [[TASK-328]] | Add GLFM diagnostics and LSP features | Task | done |
| [[TASK-329]] | Add GLFM tests and validation evidence | Task | done |
| [[CHORE-123]] | Phase 26 trace and documentation sweep | Chore | done |
| [[CHORE-124]] | Phase 26 verification and closeout sweep | Chore | done |
| [[CHORE-144]] | Split GLFM description-list parser helper | Chore | done |

## Implementation Plan

Phase 26 is stacked after Phase 25 because GLFM inherits the CommonMark/GFM
baseline and then adds local GitLab syntax awareness. Implementation will reuse
the Phase 25 GFM parser for tables, ordinary task items, strikethrough, and
extended autolinks, then add GLFM-local entries for inapplicable task markers,
description lists, footnotes, TOC tags, and GitLab host references.

Primary source paths:

- `src/parser/gfm-parser.ts`
- `src/parser/glfm-parser.ts`
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

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[docs/requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/ofmarkdown-language-mode]] |
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

- [x] glfm has source-backed parser/profile behavior.
- [x] glfm satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [x] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [x] glfm behavior is covered at every required test level.
- [x] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Added concrete implementation and RED test paths
> for TASK-327 through TASK-329. GLFM host lookup remains deferred unless a
> separate integration ticket owns live GitLab service access.

> [!INFO] Local gate passed - 2026-05-13
> Status set to `done` after A-M local execution. Exact phase gate passed:
> `bun test src/parser/__tests__/markdown-flavor-profiles.test.ts; bun test src/test/integration/markdown-flavor.test.ts; bun run bdd; bun test src/test/ci-workflow.test.ts; bun run lint:docs; bun run typecheck; bun run lint; bun run build`.

> [!INFO] In review - 2026-05-13
> PR #77 opened and CI run `25826542905` passed. Ledger set to in-review with
> PR URL.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

GLFM could reuse the Phase 25 GFM parser path for tables, ordinary task items,
strikethrough, and autolinks. The RED coverage exposed the intended missing
surfaces, and the GREEN change stayed local: parser indices, diagnostics,
completions, symbols, folds, semantic tokens, host-boundary classification, and
spawned-server counts.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| CHORE-144 | Chore | Step F found `GlfmParser.parseDescriptionLists` exceeded the 40-line helper guideline. | +0.1 h |

### Process observations

The A-M checklist continues to work for stacked flavor phases. Verification and
validation directories are still absent, so those steps remain N/A and the BDD
gate plus evidence docs carry the validation proof.

### Carry-forward actions

- [ ] For Phase 27, split parser helpers during initial implementation when a
  syntax family needs collection plus projection logic.
- [ ] Keep live platform lookup explicitly deferred unless an integration
  ticket owns authenticated service access.

### Rule / template amendments

- [ ] none
