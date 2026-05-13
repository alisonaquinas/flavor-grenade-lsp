---
id: "FEAT-055"
title: "MDX Flavor Language Support"
type: feature
status: draft
priority: high
phase: 29
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/29", markdown-flavor, "mdx"]
aliases: ["FEAT-055"]
---

# MDX Flavor Language Support

> [!INFO] FEAT-055 - Feature - Phase 29 - Status: draft

## Description

Implement first-class mdx language support for MDX, using [[research/mdx-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for MDX.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior where applicable.
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Type | Status |
|---|---|---|
| [[TASK-336]] | Task | open |
| [[TASK-337]] | Task | open |
| [[TASK-338]] | Task | open |
| [[CHORE-129]] | Chore | open |
| [[CHORE-130]] | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] mdx has source-backed parser/profile behavior.
- [ ] mdx behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
