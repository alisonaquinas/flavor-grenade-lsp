---
id: "FEAT-056"
title: "kramdown Language Support"
type: feature
status: draft
priority: high
phase: 30
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/30", markdown-flavor, "kramdown"]
aliases: ["FEAT-056"]
---

# kramdown Language Support

> [!INFO] FEAT-056 - Feature - Phase 30 - Status: draft

## Description

Implement first-class kramdown language support for kramdown, using [[research/kramdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for kramdown.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-339]] | Implement kramdown parser semantics | Task | open |
| [[TASK-340]] | Add kramdown diagnostics and LSP features | Task | open |
| [[TASK-341]] | Add kramdown tests and validation evidence | Task | open |
| [[CHORE-131]] | Phase 30 trace and documentation sweep | Chore | open |
| [[CHORE-132]] | Phase 30 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] kramdown has source-backed parser/profile behavior.
- [ ] kramdown satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] kramdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
