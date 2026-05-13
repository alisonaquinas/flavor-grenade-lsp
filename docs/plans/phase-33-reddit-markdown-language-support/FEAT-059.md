---
id: "FEAT-059"
title: "Reddit Markdown Language Support"
type: feature
status: draft
priority: high
phase: 33
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-058"]
tags: [tickets/feature, "phase/33", markdown-flavor, "reddit"]
aliases: ["FEAT-059"]
---

# Reddit Markdown Language Support

> [!INFO] FEAT-059 - Feature - Phase 33 - Status: draft

## Description

Implement first-class reddit language support for Reddit Markdown, using [[docs/research/reddit-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Reddit Markdown.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[docs/plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[docs/test/markdown-flavor-unit-spec#MF-U-021 - Reddit Markdown Parser And Analysis|MF-U-021]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-348]] | Implement Reddit Markdown parser semantics | Task | open |
| [[TASK-349]] | Add Reddit diagnostics and LSP features | Task | open |
| [[TASK-350]] | Add Reddit tests and validation evidence | Task | open |
| [[CHORE-137]] | Phase 33 trace and documentation sweep | Chore | open |
| [[CHORE-138]] | Phase 33 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[docs/requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[docs/requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] reddit has source-backed parser/profile behavior.
- [ ] reddit satisfies every required surface in [[docs/plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] reddit behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.
