---
id: "FEAT-057"
title: "Markdown Extra Language Support"
type: feature
status: draft
priority: high
phase: 31
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/31", markdown-flavor, "markdown-extra"]
aliases: ["FEAT-057"]
---

# Markdown Extra Language Support

> [!INFO] FEAT-057 - Feature - Phase 31 - Status: draft

## Description

Implement first-class markdown-extra language support for Markdown Extra, using [[research/markdown-extra-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Markdown Extra.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[test/markdown-flavor-unit-spec#MF-U-019 - Markdown Extra Parser And Analysis|MF-U-019]],
  plus integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Title | Type | Status |
|---|---|---|---|
| [[TASK-342]] | Implement Markdown Extra parser semantics | Task | open |
| [[TASK-343]] | Add Markdown Extra diagnostics and LSP features | Task | open |
| [[TASK-344]] | Add Markdown Extra tests and validation evidence | Task | open |
| [[CHORE-133]] | Phase 31 trace and documentation sweep | Chore | open |
| [[CHORE-134]] | Phase 31 verification and closeout sweep | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] markdown-extra has source-backed parser/profile behavior.
- [ ] markdown-extra satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] markdown-extra behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
