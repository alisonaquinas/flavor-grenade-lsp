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
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior where applicable.
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Type | Status |
|---|---|---|
| [[TASK-345]] | Task | open |
| [[TASK-346]] | Task | open |
| [[TASK-347]] | Task | open |
| [[CHORE-135]] | Chore | open |
| [[CHORE-136]] | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] r-markdown has source-backed parser/profile behavior.
- [ ] r-markdown behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
