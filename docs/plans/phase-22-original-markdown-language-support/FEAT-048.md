---
id: "FEAT-048"
title: "Original Markdown Language Support"
type: feature
status: in-progress
priority: high
phase: 22
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-044"]
tags: [tickets/feature, "phase/22", markdown-flavor, "original"]
aliases: ["FEAT-048"]
---

# Original Markdown Language Support

> [!INFO] FEAT-048 - Feature - Phase 22 - Status: in-progress

## Description

Implement first-class original language support for Original Markdown, using [[docs/research/commonmark-and-original-markdown]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Original Markdown.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-315]] | Implement Original Markdown parser semantics | Task | in-progress |
| [[TASK-316]] | Add Original Markdown diagnostics and LSP features | Task | in-progress |
| [[TASK-317]] | Add Original Markdown tests and validation evidence | Task | in-progress |
| [[CHORE-115]] | Phase 22 trace and documentation sweep | Chore | open |
| [[CHORE-116]] | Phase 22 verification and closeout sweep | Chore | open |

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

- [ ] original has source-backed parser/profile behavior.
- [ ] original satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] original behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Step A-C - 2026-05-13
> Phase 21 PR #71 is open with green CI. Step A confirmed Phase 22 tickets and
> the source trace in `docs/research/commonmark-and-original-markdown.md`; Step
> B found no missing ticket cross-references; Step C scopes implementation to
> `src/parser/ofm-parser.ts`, `src/markdown-flavor/markdown-flavor-profiles.ts`,
> `src/resolution/diagnostic-service.ts`, `src/completion/completion-router.ts`,
> `src/parser/__tests__/markdown-flavor-parser-analysis.test.ts`, existing
> diagnostics/completion tests, `src/test/integration/markdown-flavor.test.ts`,
> and validation evidence under `docs/test/evidence/`.

> [!WARNING] RED - 2026-05-13
> Added failing Phase 22 coverage for Original Markdown parser/profile behavior,
> portability diagnostics, and inactive Obsidian completions before
> implementation.
