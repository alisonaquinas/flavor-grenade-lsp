---
id: "FEAT-056"
title: "kramdown Language Support"
type: feature
status: in-review
priority: high
phase: 30
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-055"]
tags: [tickets/feature, "phase/30", markdown-flavor, "kramdown"]
aliases: ["FEAT-056"]
---

# kramdown Language Support

> [!INFO] FEAT-056 - Feature - Phase 30 - Status: in-progress

## Implementation Plan

Phase 30 is stacked after Phase 29 because the ledger's near-term roadmap keeps
the server flavor chain contiguous. Implementation will model source-local
kramdown syntax: inline/block attribute lists, explicit heading IDs, definition
lists, pipe tables, footnotes, math blocks, malformed local attribute
boundaries, and local attribute/anchor references. It will not run Ruby,
kramdown, Jekyll, syntax highlighters, converters, sanitizers, or output
renderers.

Primary source paths:

- `src/parser/kramdown-parser.ts`
- `src/parser/ofm-parser.ts`
- `src/parser/types.ts`
- `src/resolution/diagnostic-service.ts`
- `src/completion/completion-router.ts`
- `src/handlers/document-symbol.handler.ts`
- `src/handlers/folding-range.handler.ts`
- `src/handlers/semantic-tokens.handler.ts`
- `src/markdown-flavor/markdown-flavor-profiles.ts`
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

Implement first-class kramdown language support for kramdown, using [[docs/research/kramdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for kramdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-018 - kramdown Parser And Analysis|MF-U-018]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-339]] | Implement kramdown parser semantics | Task | done |
| [[TASK-340]] | Add kramdown diagnostics and LSP features | Task | done |
| [[TASK-341]] | Add kramdown tests and validation evidence | Task | done |
| [[CHORE-131]] | Phase 30 trace and documentation sweep | Chore | done |
| [[CHORE-132]] | Phase 30 verification and closeout sweep | Chore | done |

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

- [ ] kramdown has source-backed parser/profile behavior.
- [ ] kramdown satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] kramdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 29 PR #80 CI is green and added
> concrete implementation and RED test paths for TASK-339 through TASK-341.
> kramdown/Jekyll execution, conversion, rendering, sanitization, syntax
> highlighting, and Ruby ecosystem integration remain deferred unless separate
> integration tickets own them.

> [!FAILURE] Step D RED - 2026-05-13
> Focused kramdown RED suite fails in the expected parser, diagnostics,
> completion, document-symbol, folding, semantic-token, and integration
> assertions. TASK-339 through TASK-341 moved to `red` before implementation.

> [!SUCCESS] Step D GREEN - 2026-05-13
> kramdown parser, diagnostics, completions, symbols, folds, semantic tokens,
> query counts, and profile surface status are implemented. Focused kramdown
> tests, `bun run typecheck`, and `bun run lint` pass locally.

> [!SUCCESS] Steps E-L local gate - 2026-05-13
> Lint/typecheck, code-quality, security, full unit, integration, and BDD
> sweeps passed. Step K and validation-test Step L are N/A because no
> `src/test/verification/` or `src/test/validation/` suites exist. No new
> findings or tickets were opened during sweeps.

> [!INFO] In review - 2026-05-13
> PR #81 opened against `develop` and CI run `25831274609` passed all checks.
> Child TASK and CHORE tickets moved to `done`; FEAT-056 remains `in-review`
> until merge.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The RED → GREEN split was clean: the RED commit covered parser, diagnostics,
completion, document symbols, folding, semantic tokens, spawned-server counts,
inactive Obsidian syntax, and local kramdown boundary classification; the GREEN
commit implemented exactly those local surfaces. The previous Pandoc,
MultiMarkdown, and MDX phase patterns transferred directly.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | N/A | Steps E, F, G, I, J, K, and L found no new defects or sweep findings. | +0 h |

The only notable implementation choice was keeping kramdown local to source
syntax: Ruby/Jekyll execution, renderer output, syntax highlighting, conversion,
and sanitization remain explicitly outside Phase 30.

### Process observations

The A-M checklist fit this phase. Step K and the validation-directory portion
of Step L remain N/A because this repository has no `src/test/verification/` or
`src/test/validation/` suites; BDD is the active validation gate.

### Carry-forward actions

- [ ] Use the same RED surface bundle for Phase 31: parser/profile behavior,
      diagnostics, completion, symbols, folds, tokens, spawned-server counts,
      inactive syntax, and host/conversion boundary evidence.

### Rule / template amendments

- [ ] none
