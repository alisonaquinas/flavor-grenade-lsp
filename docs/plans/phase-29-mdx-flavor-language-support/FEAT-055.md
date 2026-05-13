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

Implement first-class mdx language support for MDX, using [[research/mdx-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for MDX.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior according to [[plans/markdown-flavor-lsp-applicability-matrix]].
- Add unit evidence via
  [[test/markdown-flavor-unit-spec#MF-U-017 - MDX Parser And Analysis|MF-U-017]],
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
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] mdx has source-backed parser/profile behavior.
- [ ] mdx satisfies every required surface in [[plans/markdown-flavor-lsp-applicability-matrix]] or records a deferred/not-applicable reason.
- [ ] mdx behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.

## Workflow Log

> [!INFO] Drafted - 2026-05-13
> Status set to `draft`. Feature ticket created in draft state for phase lifecycle tracking.
