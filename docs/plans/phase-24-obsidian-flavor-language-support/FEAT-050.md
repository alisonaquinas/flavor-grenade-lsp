---
id: "FEAT-050"
title: "Obsidian Flavor Language Support"
type: feature
status: in-review
priority: high
phase: 24
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-049", "FEAT-045"]
tags: [tickets/feature, "phase/24", markdown-flavor, "obsidian"]
aliases: ["FEAT-050"]
---

# Obsidian Flavor Language Support

> [!INFO] FEAT-050 - Feature - Phase 24 - Status: in-review

## Description

Implement first-class obsidian language support for Obsidian, using [[docs/ofm-spec/index]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Obsidian.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-321]] | Rebase existing OFM parser behavior onto the Obsidian flavor | Task | done |
| [[TASK-322]] | Gate Obsidian diagnostics and LSP features by flavor | Task | done |
| [[TASK-323]] | Add Obsidian flavor regression and selector-mode coverage | Task | done |
| [[CHORE-119]] | Phase 24 trace and documentation sweep | Chore | done |
| [[CHORE-120]] | Phase 24 verification and closeout sweep | Chore | done |
| [[CHORE-142]] | Clarify Phase 24 Obsidian parser test title | Chore | done |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[docs/requirements/functional/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/functional/ofmarkdown-language-mode]] |
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

- [x] obsidian has source-backed parser/profile behavior.
- [x] obsidian satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [x] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [x] obsidian behavior is covered at every required test level.
- [x] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Started - 2026-05-13
> Phase 24 started after Phase 23 and Phase E15 had open, CI-green stacked PRs.
> Branch `feature/FEAT-050-phase-24-obsidian-flavor-language-support` was
> fast-forwarded onto `feature/FEAT-045-phase-E15-markdown-flavor-selector-settings`
> so the Obsidian phase uses the selector/settings contract from PR #74.

> [!SUCCESS] Local gate - 2026-05-13
> Phase 24 passed the exact gate commands from the phase plan plus the broader
> A-M lint, typecheck, audit, unit, integration, and BDD checks. Verification
> and validation test directories are absent, so those steps are recorded as
> N/A before the BDD gate.

> [!SUCCESS] CI green - 2026-05-13
> PR #75 CI run `25824356496` passed, including root tests, BDD, docs lint,
> website checks, build, and extension checks. Phase 24 is ready for review.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

Existing OFM parser and LSP behavior already matched the intended Obsidian
flavor shape once E15 supplied selector-driven effective flavor state. The main
implementation change was intentionally small: mark the Obsidian profile
surfaces implemented and add regression evidence around the existing behavior.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| CHORE-142 | Chore | Step F found a new parser test title that claimed host-syntax coverage while asserting active Obsidian syntax and opaque-region behavior. | +0.1 h |

### Process observations

Stacking Phase 24 after E15 was the right order. It avoided recreating a
flavor-selection path and let Phase 24 focus on server/profile behavior instead
of extension language-mode migration.

### Carry-forward actions

- [ ] In Phase 25, keep GFM host references non-local unless a separate
      authenticated GitHub integration explicitly owns live lookup behavior.
- [ ] Reuse the Phase 24 pattern for each remaining dialect: RED evidence for
      parser/diagnostic/completion behavior, then profile surface status and
      trace updates.

### Rule / template amendments

- [ ] none
