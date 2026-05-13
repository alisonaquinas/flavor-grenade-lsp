---
id: "FEAT-057"
title: "Markdown Extra Language Support"
type: feature
status: in-progress
priority: high
phase: 31
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-056"]
tags: [tickets/feature, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["FEAT-057"]
---

# Markdown Extra Language Support

> [!INFO] FEAT-057 - Feature - Phase 31 - Status: in-progress

## Implementation Plan

Phase 31 is stacked after Phase 30 because the ledger's near-term roadmap keeps
the server flavor chain contiguous. Implementation will model source-local
Markdown Extra syntax: pipe tables, definition lists, footnotes,
abbreviations, fenced code blocks, fenced/block attributes, malformed local
attribute or abbreviation boundaries, and inactive Obsidian syntax. It will not
run PHP Markdown Extra, convert HTML, call renderers, load syntax highlighters,
or infer generated output.

Primary source paths:

- `src/parser/markdown-extra-parser.ts`
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

Implement first-class markdown-extra language support for Markdown Extra, using [[docs/research/markdown-extra-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Markdown Extra.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-342]] | Implement Markdown Extra parser semantics | Task | done |
| [[TASK-343]] | Add Markdown Extra diagnostics and LSP features | Task | done |
| [[TASK-344]] | Add Markdown Extra tests and validation evidence | Task | done |
| [[CHORE-133]] | Phase 31 trace and documentation sweep | Chore | done |
| [[CHORE-134]] | Phase 31 verification and closeout sweep | Chore | done |

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

- [x] markdown-extra has source-backed parser/profile behavior.
- [x] markdown-extra satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [x] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [x] markdown-extra behavior is covered at every required test level.
- [x] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 30 PR #81 CI is green and added
> concrete implementation and RED test paths for TASK-342 through TASK-344.
> PHP Markdown Extra execution, HTML conversion, renderer output, syntax
> highlighting, and generated-output inference remain deferred unless separate
> integration tickets own them.

> [!FAILURE] Step D RED - 2026-05-13
> Focused Markdown Extra RED suite fails in the expected parser, diagnostics,
> completion, document-symbol, folding, semantic-token, and integration
> assertions. TASK-342 through TASK-344 moved to `red` before implementation.

> [!SUCCESS] Step D GREEN - 2026-05-13
> Markdown Extra parser, diagnostics, completions, symbols, folds, semantic
> tokens, query counts, and profile surface status are implemented. Focused
> Markdown Extra tests, `bun run typecheck`, and `bun run lint` pass locally.

> [!SUCCESS] Steps E-L local gate - 2026-05-13
> Lint/typecheck, code-quality, security, full unit, integration, and BDD
> sweeps passed. Step K and validation-test Step L are N/A because no
> `src/test/verification/` or `src/test/validation/` suites exist. No new
> findings or tickets were opened during sweeps.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The RED -> GREEN bundle stayed aligned with Phase 30: parser/profile behavior,
diagnostics, completion, document symbols, folding, semantic tokens,
spawned-server counts, inactive Obsidian syntax, and local boundary evidence
all moved together. Reusing the kramdown parser's shared local constructs kept
the Markdown Extra implementation small and source-only.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | N/A | Steps E, F, G, I, J, K, and L found no new defects or sweep findings. | +0 h |

The implementation intentionally stayed away from PHP Markdown Extra execution,
HTML conversion, generated renderer output, and syntax highlighter behavior.
Those remain non-local unless a future integration ticket owns them.

### Process observations

The A-M checklist fit this phase. Step K and the validation-directory portion
of Step L remain N/A because this repository has no `src/test/verification/` or
`src/test/validation/` suites; BDD is the active validation gate.

### Carry-forward actions

- [ ] Use the same RED surface bundle for Phase 32, with extra care that
      R Markdown chunk execution and package/runtime metadata stay inert.

### Rule / template amendments

- [ ] none
