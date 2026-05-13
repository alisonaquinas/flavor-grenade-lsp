---
id: "FEAT-058"
title: "R Markdown Language Support"
type: feature
status: in-progress
priority: high
phase: 32
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-057"]
tags: [tickets/feature, "phase/32", markdown-flavor, "r-markdown"]
aliases: ["FEAT-058"]
---

# R Markdown Language Support

> [!INFO] FEAT-058 - Feature - Phase 32 - Status: in-progress

## Implementation Plan

Phase 32 is stacked after Phase 31 because the ledger's near-term roadmap keeps
the server flavor chain contiguous. Implementation will model source-local
R Markdown syntax: YAML/frontmatter metadata, fenced chunk headers, chunk
labels/options, inline R markers, malformed local chunk boundaries, inactive
Obsidian syntax, and execution-bound references. It will not run R, Python,
shell, notebooks, knitr, Pandoc, Shiny, package resolution, cache evaluation,
or generated output.

Primary source paths:

- `src/parser/r-markdown-parser.ts`
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

Implement first-class r-markdown language support for R Markdown, using [[docs/research/r-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for R Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-345]] | Implement R Markdown parser semantics | Task | green |
| [[TASK-346]] | Add R Markdown diagnostics and LSP features | Task | green |
| [[TASK-347]] | Add R Markdown tests and validation evidence | Task | green |
| [[CHORE-135]] | Phase 32 trace and documentation sweep | Chore | open |
| [[CHORE-136]] | Phase 32 verification and closeout sweep | Chore | open |

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

- [ ] r-markdown has source-backed parser/profile behavior.
- [ ] r-markdown satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] r-markdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C kickoff - 2026-05-13
> Status set to `in-progress`. Confirmed Phase 31 PR #82 CI is green and added
> concrete implementation and RED test paths for TASK-345 through TASK-347.
> R, Python, shell, notebook, knitr, Pandoc, Shiny, package, cache, and
> generated-output behavior remain deferred unless separate integration tickets
> own them.

> [!FAILURE] Step D RED - 2026-05-13
> Focused R Markdown RED suite fails in the expected parser, diagnostics,
> completion, document-symbol, semantic-token, and integration assertions.
> Folding already passes once parser data is available. TASK-345 through
> TASK-347 moved to `red` before implementation.

> [!SUCCESS] Step D GREEN - 2026-05-13
> R Markdown parser, diagnostics, completions, symbols, folds, semantic tokens,
> query counts, execution-boundary classification, and profile surface status
> are implemented. Focused R Markdown tests, `bun run typecheck`, and
> `bun run lint --max-warnings 0` pass locally.
