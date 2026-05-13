---
id: "FEAT-050"
title: "Obsidian Flavor Language Support"
type: feature
status: in-progress
priority: high
phase: 24
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-049", "FEAT-045"]
tags: [tickets/feature, "phase/24", markdown-flavor, "obsidian"]
aliases: ["FEAT-050"]
---

# Obsidian Flavor Language Support

> [!INFO] FEAT-050 - Feature - Phase 24 - Status: in-progress

## Description

Implement first-class obsidian language support for Obsidian, using [[docs/ofm-spec/index]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Obsidian.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-321]] | Rebase existing OFM parser behavior onto the Obsidian flavor | Task | green |
| [[TASK-322]] | Gate Obsidian diagnostics and LSP features by flavor | Task | green |
| [[TASK-323]] | Add Obsidian flavor regression and selector-mode coverage | Task | green |
| [[CHORE-119]] | Phase 24 trace and documentation sweep | Chore | green |
| [[CHORE-120]] | Phase 24 verification and closeout sweep | Chore | open |
| [[CHORE-142]] | Clarify Phase 24 Obsidian parser test title | Chore | open |

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

- [ ] obsidian has source-backed parser/profile behavior.
- [ ] obsidian satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] obsidian behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Started - 2026-05-13
> Phase 24 started after Phase 23 and Phase E15 had open, CI-green stacked PRs.
> Branch `feature/FEAT-050-phase-24-obsidian-flavor-language-support` was
> fast-forwarded onto `feature/FEAT-045-phase-E15-markdown-flavor-selector-settings`
> so the Obsidian phase uses the selector/settings contract from PR #74.
