---
id: "FEAT-049"
title: "CommonMark Language Support"
type: feature
status: draft
priority: high
phase: 23
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-048"]
tags: [tickets/feature, "phase/23", markdown-flavor, "commonmark"]
aliases: ["FEAT-049"]
---

# CommonMark Language Support

> [!INFO] FEAT-049 - Feature - Phase 23 - Status: draft

## Description

Implement first-class commonmark language support for CommonMark, using [[research/commonmark-and-original-markdown]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for CommonMark.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
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
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] commonmark has source-backed parser/profile behavior.
- [ ] commonmark satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] commonmark behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.
