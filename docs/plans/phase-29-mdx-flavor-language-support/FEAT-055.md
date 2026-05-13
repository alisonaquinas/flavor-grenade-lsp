---
id: "FEAT-055"
title: "MDX Flavor Language Support"
type: feature
status: in-progress
priority: high
phase: 29
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/feature, "phase/29", markdown-flavor, "mdx"]
aliases: ["FEAT-055"]
---

# MDX Flavor Language Support

> [!INFO] FEAT-055 - Feature - Phase 29 - Status: in-progress

## Implementation Plan

Phase 29 is stacked after Phase 28 because MDX is the next server flavor in the
ledger dependency graph. Implementation will model source-local MDX syntax:
ESM import/export declarations, JSX element blocks, JSX expression regions,
component references, malformed local MDX boundaries, and renderer-bound
component/runtime references. It will not compile MDX, evaluate JavaScript,
resolve React or TypeScript imports, run bundlers, or take ownership of VS Code
documents whose language id is already `mdx`.

Primary source paths:

- `src/parser/mdx-parser.ts`
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

Implement first-class mdx language support for MDX, using [[docs/research/mdx-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for MDX.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-336]] | Implement MDX flavor parser semantics | Task | green |
| [[TASK-337]] | Add MDX diagnostics and LSP features | Task | green |
| [[TASK-338]] | Add MDX tests, host safety, and validation evidence | Task | green |
| [[CHORE-129]] | Phase 29 trace and documentation sweep | Chore | done |
| [[CHORE-130]] | Phase 29 verification and closeout sweep | Chore | done |

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

- [ ] mdx has source-backed parser/profile behavior.
- [ ] mdx satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] mdx behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 28 PR #79 CI is green and added
> concrete implementation and RED test paths for TASK-336 through TASK-338.
> MDX compilation, JavaScript evaluation, import resolution, React/TypeScript
> symbol lookup, bundler behavior, and ownership of VS Code `mdx` language-mode
> documents remain deferred unless separate integration tickets own them.

> [!INFO] GREEN - 2026-05-13
> Implemented local MDX parser semantics, diagnostics, completions,
> document symbols, folding, semantic tokens, spawned-server counts, and
> renderer-bound classification. Focused Phase 29 test set, typecheck, lint,
> and build passed locally before trace documentation updates.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The RED → GREEN split worked cleanly: the first commit established failing
coverage for parser, diagnostics, completion, symbols, folding, semantic
tokens, spawned-server counts, and renderer-bound classification; the GREEN
commit implemented only those local MDX surfaces. The existing flavor-phase
pattern from Pandoc and MultiMarkdown transferred directly to MDX.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | N/A | Steps E, F, G, I, J, K, and L found no new defects or sweep findings. | +0 h |

The only implementation adjustment was tightening the malformed-expression
check so balanced multi-line MDX expressions are not reported as broken.

### Process observations

The A-M checklist fit this phase well. Step K and the validation-directory
portion of Step L remain N/A because this repository has no
`src/test/verification/` or `src/test/validation/` directories; BDD remains the
active validation gate.

### Carry-forward actions

- [ ] Keep Phase 30 on the same flavor-surface template: RED parser/profile
      tests first, then local diagnostics/completion/symbol/fold/token wiring,
      then trace and host-boundary evidence.

### Rule / template amendments

- [ ] none
