---
id: "FEAT-059"
title: "Reddit Markdown Language Support"
type: feature
status: in-review
priority: high
phase: 33
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/feature, "phase/33", markdown-flavor, "reddit"]
aliases: ["FEAT-059"]
---

# Reddit Markdown Language Support

> [!INFO] FEAT-059 - Feature - Phase 33 - Status: in-review

## Implementation Plan

Phase 33 is stacked after Phase 32 because the ledger's near-term roadmap keeps
the server flavor chain contiguous. Implementation will model source-local
Reddit Markdown syntax: spoilers, superscript, strikethrough, pipe tables,
old-Reddit portability diagnostics for `1)` ordered-list markers, URL-scheme
diagnostics, and host-reference shapes for `r/` and `u/` references. It will
not call Reddit APIs, resolve users/subreddits/posts/comments, inspect
moderation state, or claim Rich Text editor rendering.

Primary source paths:

- `src/parser/reddit-parser.ts`
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

Implement first-class reddit language support for Reddit Markdown, using [[docs/research/reddit-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Reddit Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-348]] | Implement Reddit Markdown parser semantics | Task | done |
| [[TASK-349]] | Add Reddit diagnostics and LSP features | Task | done |
| [[TASK-350]] | Add Reddit tests and validation evidence | Task | done |
| [[CHORE-137]] | Phase 33 trace and documentation sweep | Chore | done |
| [[CHORE-138]] | Phase 33 verification and closeout sweep | Chore | done |

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

- [x] reddit has source-backed parser/profile behavior.
- [x] reddit satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [x] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [x] reddit behavior is covered at every required test level.
- [x] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 32 PR #83 CI is green and added
> concrete implementation and RED test paths for TASK-348 through TASK-350.
> Live Reddit user, subreddit, post, comment, moderation, and Rich Text editor
> rendering behavior remain deferred unless separate integration tickets own
> them.

> [!FAIL] Step D RED - 2026-05-13
> Added failing coverage for Reddit parser analysis, diagnostics, completions,
> document symbols, folding, semantic tokens, and spawned-server counts. Focused
> RED command failed with 8 expected failures and `bun run lint --max-warnings
> 0` passed.

> [!SUCCESS] Step D GREEN - 2026-05-13
> Implemented `RedditParser`, profile dispatch, `FG701` and `FG702`
> diagnostics, Reddit completions, symbols, folding, semantic tokens, and query
> counts. Focused suite passed with 142 tests, `bun run typecheck` passed, and
> `bun run lint --max-warnings 0` passed.

> [!SUCCESS] Steps E-L local gate - 2026-05-13
> Lint/typecheck, code-quality, security, full unit, integration, and BDD
> sweeps passed. Step K and validation-test Step L are N/A because no
> `src/test/verification/` or `src/test/validation/` suites exist. No new
> findings or tickets were opened during sweeps.

> [!INFO] In review - 2026-05-13
> PR #84 opened against `develop` and CI run `25834268541` passed all checks.
> Child TASK and CHORE tickets moved to `done`; FEAT-059 remains `in-review`
> until merge.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

The RED -> GREEN bundle matched the prior flavor phases: parser/profile
behavior, diagnostics, completion, document symbols, folding, semantic tokens,
spawned-server counts, inactive Obsidian syntax, and boundary evidence moved
together. The implementation stayed source-local and did not call Reddit APIs.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | N/A | Steps E, F, G, I, J, K, and L found no new defects or sweep findings. | +0 h |

Live Reddit user, subreddit, post, comment, moderation-state, and Rich Text
editor behavior remain explicitly outside Phase 33.

### Process observations

The A-M checklist fit this phase. Step K and the validation-directory portion
of Step L remain N/A because this repository has no `src/test/verification/` or
`src/test/validation/` suites; BDD is the active validation gate.

### Carry-forward actions

- [ ] Use the same RED surface bundle for Phase 34 while keeping Stack Overflow
      live platform lookups non-local.

### Rule / template amendments

- [ ] none
