---
id: "FEAT-049"
title: "CommonMark Language Support"
type: feature
status: in-progress
priority: high
phase: 23
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/feature, "phase/23", markdown-flavor, "commonmark"]
aliases: ["FEAT-049"]
---

# CommonMark Language Support

> [!INFO] FEAT-049 - Feature - Phase 23 - Status: in-progress

## Description

Implement first-class commonmark language support for CommonMark, using [[docs/research/commonmark-and-original-markdown]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for CommonMark.
- Wire flavor-aware diagnostics, completion, definition, references, document links, document symbols, folding, semantic tokens, hover, rename, and host/conversion boundary behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-318]] | Implement CommonMark parser semantics | Task | open |
| [[TASK-319]] | Add CommonMark diagnostics and LSP features | Task | open |
| [[TASK-320]] | Add CommonMark tests and validation evidence | Task | open |
| [[CHORE-117]] | Phase 23 trace and documentation sweep | Chore | open |
| [[CHORE-118]] | Phase 23 verification and closeout sweep | Chore | open |

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

- [ ] commonmark has source-backed parser/profile behavior.
- [ ] commonmark satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] Navigation sub-surfaces, rename disposition, host/conversion boundaries, and negative cross-flavor fixtures are explicitly covered.
- [ ] commonmark behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.

> [!INFO] Started - 2026-05-13
> Phase 23 started from Phase 22 branch `feature/FEAT-048-phase-22-original-markdown-language-support`.
> Scope confirmed against [[docs/plans/phase-execution]], [[docs/plans/execution-ledger]], and this phase plan.
> Implementation will keep CommonMark syntax active while GFM and Obsidian extensions remain inert or portability-diagnosed.
> Status: `in-progress`.

> [!SUCCESS] Local gate - 2026-05-13
> CommonMark parser semantics, FG102 diagnostics, non-Obsidian completion
> gating, spawned-server coverage, trace evidence, and the full documented gate
> are ready for PR review. BUG-046 was opened and fixed during Step L before
> rerunning BDD.

## Retrospective

> Written after Step L passes. Date: 2026-05-13.

### What went as planned

CommonMark reused the Phase 22 flavor dispatch structure cleanly. The RED
tests isolated the expected surface gaps: profile status, autolinks, FG102
portability diagnostics, and inactive Obsidian completion suppression.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-046 | Bug | Existing watcher BDD asserted wiki-link completions from a workspace that now correctly defaulted to CommonMark. | +0.5 h |

### Process observations

The A-M sweep caught a cross-feature fixture assumption that the focused Phase
23 gate did not. The missing `docs/requirements/operational/phase-execution.md`
path in the user prompt did not block execution because the repo's actual
procedure lives at `docs/plans/phase-execution.md`.

### Carry-forward actions

- [ ] In Phase 24, make Obsidian-specific BDD fixtures explicitly select
      `obsidian` when asserting wiki links, embeds, tags, or callouts.

### Rule / template amendments

- [ ] none
