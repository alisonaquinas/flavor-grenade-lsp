---
id: "FEAT-060"
title: "Stack Overflow Markdown Language Support"
type: feature
status: in-progress
priority: high
phase: 34
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-059"]
tags: [tickets/feature, "phase/34", markdown-flavor, "stack-overflow"]
aliases: ["FEAT-060"]
---

# Stack Overflow Markdown Language Support

> [!INFO] FEAT-060 - Feature - Phase 34 - Status: in-progress

## Implementation Plan

Phase 34 is stacked after Phase 33 because the ledger's near-term roadmap keeps
the server flavor chain contiguous. Implementation will model source-local
Stack Overflow Markdown syntax: Stack Exchange tag references, spoiler
blockquotes, language-highlighting directives, fence language hints, GFM-style
pipe tables, and comment-surface portability limits. It will not call Stack
Exchange APIs, resolve tags/questions/answers/users/comments, inspect site
metadata, or claim rendered post/comment HTML behavior.

Primary source paths:

- `src/parser/stack-overflow-parser.ts`
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

Implement first-class stack-overflow language support for Stack Overflow Markdown, using [[docs/research/stack-overflow-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Stack Overflow Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-022 - Stack Overflow Markdown Parser And Analysis|MF-U-022]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-351]] | Implement Stack Overflow Markdown parser semantics | Task | red |
| [[TASK-352]] | Add Stack Overflow diagnostics and LSP features | Task | red |
| [[TASK-353]] | Add Stack Overflow tests and validation evidence | Task | red |
| [[CHORE-139]] | Phase 34 trace and documentation sweep | Chore | open |
| [[CHORE-140]] | Phase 34 verification and closeout sweep | Chore | open |

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

- [ ] stack-overflow has source-backed parser/profile behavior.
- [ ] stack-overflow satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] stack-overflow behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 33 PR #84 CI is green and added
> concrete implementation and RED test paths for TASK-351 through TASK-353.
> Live Stack Exchange tag, question, answer, user, comment, site metadata, and
> rendered post/comment HTML behavior remain deferred unless separate
> integration tickets own them.

> [!FAIL] Step D RED - 2026-05-13
> Added failing coverage for Stack Overflow parser analysis, diagnostics,
> completions, document symbols, folding, semantic tokens, and spawned-server
> counts. Focused RED command failed with 8 expected failures and `bun run lint
> --max-warnings 0` passed.
