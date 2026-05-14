---
id: "FEAT-059"
title: "Reddit Markdown Language Support"
type: feature
status: in-progress
priority: high
phase: 33
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/feature, "phase/33", markdown-flavor, "reddit"]
aliases: ["FEAT-059"]
---

# Reddit Markdown Language Support

> [!INFO] FEAT-059 - Feature - Phase 33 - Status: in-progress

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
| [[TASK-348]] | Implement Reddit Markdown parser semantics | Task | open |
| [[TASK-349]] | Add Reddit diagnostics and LSP features | Task | open |
| [[TASK-350]] | Add Reddit tests and validation evidence | Task | open |
| [[CHORE-137]] | Phase 33 trace and documentation sweep | Chore | open |
| [[CHORE-138]] | Phase 33 verification and closeout sweep | Chore | open |

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

- [ ] reddit has source-backed parser/profile behavior.
- [ ] reddit satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] reddit behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 32 PR #83 CI is green and added
> concrete implementation and RED test paths for TASK-348 through TASK-350.
> Live Reddit user, subreddit, post, comment, moderation, and Rich Text editor
> rendering behavior remain deferred unless separate integration tickets own
> them.
