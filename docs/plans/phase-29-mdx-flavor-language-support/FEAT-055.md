---
id: "FEAT-055"
title: "MDX Flavor Language Support"
type: feature
status: draft
priority: high
phase: 29
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-054"]
tags: [tickets/feature, "phase/29", markdown-flavor, "mdx"]
aliases: ["FEAT-055"]
---

# MDX Flavor Language Support

> [!INFO] FEAT-055 - Feature - Phase 29 - Status: draft

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
| [[TASK-336]] | Implement MDX flavor parser semantics | Task | open |
| [[TASK-337]] | Add MDX diagnostics and LSP features | Task | open |
| [[TASK-338]] | Add MDX tests, host safety, and validation evidence | Task | open |
| [[CHORE-129]] | Phase 29 trace and documentation sweep | Chore | open |
| [[CHORE-130]] | Phase 29 verification and closeout sweep | Chore | open |

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
