---
id: "FEAT-051"
title: "GitHub Flavored Markdown Language Support"
type: feature
status: in-progress
priority: high
phase: 25
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-050"]
tags: [tickets/feature, "phase/25", markdown-flavor, "gfm"]
aliases: ["FEAT-051"]
---

# GitHub Flavored Markdown Language Support

> [!INFO] FEAT-051 - Feature - Phase 25 - Status: in-progress

## Description

Implement first-class gfm language support for GitHub Flavored Markdown, using [[docs/research/github-flavored-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for GitHub Flavored Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-013 - GFM Parser And Analysis|MF-U-013]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-324]] | Implement GFM parser semantics | Task | open |
| [[TASK-325]] | Add GFM diagnostics and LSP features | Task | open |
| [[TASK-326]] | Add GFM tests and validation evidence | Task | open |
| [[CHORE-121]] | Phase 25 trace and documentation sweep | Chore | done |
| [[CHORE-122]] | Phase 25 verification and closeout sweep | Chore | open |
| [[CHORE-143]] | Document exported GFM parse result contract | Chore | done |

## Implementation Plan

Phase 25 is stacked after Phase 24 because explicit Obsidian support and the
extension selector/settings contract are now prerequisites for the GFM server
surface. GFM work extends the CommonMark base with source-backed local syntax
indices for tables, task items, strikethrough, and extended autolinks while
leaving GitHub host objects non-local.

Primary source paths:

- `src/parser/gfm-parser.ts`
- `src/parser/ofm-parser.ts`
- `src/parser/types.ts`
- `src/resolution/diagnostic-service.ts`
- `src/completion/completion-router.ts`
- `src/handlers/folding-range.handler.ts`
- `src/handlers/document-symbol.handler.ts`
- `src/handlers/hover.handler.ts`
- `src/handlers/semantic-tokens.handler.ts`
- `src/markdown-flavor/markdown-flavor-profiles.ts`
- `src/lsp/lsp.module.ts`

Primary RED test paths:

- `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`
- `src/resolution/__tests__/diagnostic-service.test.ts`
- `src/completion/__tests__/completion-router.test.ts`
- `src/handlers/__tests__/folding-range.handler.test.ts`
- `src/handlers/__tests__/document-symbol.handler.test.ts`
- `src/handlers/__tests__/hover.handler.test.ts`
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

- [ ] gfm has source-backed parser/profile behavior.
- [ ] gfm satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] gfm behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Phase order corrected to stack after Phase 24 /
> FEAT-050, matching the ledger route through Phase E15 and Phase 24. Added
> concrete implementation and RED test paths for TASK-324 through TASK-326.
