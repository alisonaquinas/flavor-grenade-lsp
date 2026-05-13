---
id: "FEAT-054"
title: "MultiMarkdown Language Support"
type: feature
status: in-progress
priority: high
phase: 28
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-053"]
tags: [tickets/feature, "phase/28", markdown-flavor, "multimarkdown"]
aliases: ["FEAT-054"]
---

# MultiMarkdown Language Support

> [!INFO] FEAT-054 - Feature - Phase 28 - Status: in-progress

## Implementation Plan

Phase 28 is stacked after Phase 27 because MultiMarkdown overlaps with Pandoc
metadata, citation, footnote, and cross-reference surfaces while retaining its
own document-production syntax. Implementation will model source-local syntax:
metadata blocks, tables, footnotes, bibliography/citation references, labels,
cross-references, and table/figure-style anchors. It will not run
MultiMarkdown, Pandoc, BibTeX, transclusion, export writers, or generated
output processors.

Primary source paths:

- `src/parser/multimarkdown-parser.ts`
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

Implement first-class multimarkdown language support for MultiMarkdown, using [[docs/research/multimarkdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for MultiMarkdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-016 - MultiMarkdown Parser And Analysis|MF-U-016]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-333]] | Implement MultiMarkdown parser semantics | Task | green |
| [[TASK-334]] | Add MultiMarkdown diagnostics and LSP features | Task | green |
| [[TASK-335]] | Add MultiMarkdown tests and validation evidence | Task | green |
| [[CHORE-127]] | Phase 28 trace and documentation sweep | Chore | open |
| [[CHORE-128]] | Phase 28 verification and closeout sweep | Chore | open |
| [[CHORE-145]] | Shorten MultiMarkdown table parser helper | Chore | done |

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

- [ ] multimarkdown has source-backed parser/profile behavior.
- [ ] multimarkdown satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] multimarkdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Added concrete implementation and RED test paths
> for TASK-333 through TASK-335. MultiMarkdown export, transclusion,
> bibliography processor, and generated-output behavior remain deferred unless
> a separate integration ticket owns those operations.

> [!INFO] Step D GREEN - 2026-05-13
> TASK-333 through TASK-335 reached `green`. Targeted parser, diagnostics,
> completion, document-symbol, folding-range, semantic-token, and spawned-server
> integration tests pass for MultiMarkdown.

> [!INFO] Step F finding - 2026-05-13
> Opened and closed CHORE-145 for the code-quality function-length finding in
> `MultimarkdownParser.parseTables`.
