---
id: "FEAT-058"
title: "R Markdown Language Support"
type: feature
status: draft
priority: high
phase: 32
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/32", markdown-flavor, "r-markdown"]
aliases: ["FEAT-058"]
---

# R Markdown Language Support

> [!INFO] FEAT-058 - Feature - Phase 32 - Status: draft

## Description

Implement first-class r-markdown language support for R Markdown, using [[research/r-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for R Markdown.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[test/markdown-flavor-unit-spec#MF-U-020 - R Markdown Parser And Analysis|MF-U-020]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-345]] | Implement R Markdown parser semantics | Task | open |
| [[TASK-346]] | Add R Markdown diagnostics and LSP features | Task | open |
| [[TASK-347]] | Add R Markdown tests and validation evidence | Task | open |
| [[CHORE-135]] | Phase 32 trace and documentation sweep | Chore | open |
| [[CHORE-136]] | Phase 32 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] r-markdown has source-backed parser/profile behavior.
- [ ] r-markdown satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] r-markdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
