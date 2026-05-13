---
id: "FEAT-049"
title: "CommonMark Language Support"
type: feature
status: draft
priority: high
phase: 23
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/23", markdown-flavor, "commonmark"]
aliases: ["FEAT-049"]
---

# CommonMark Language Support

> [!INFO] FEAT-049 - Feature - Phase 23 - Status: draft

## Description

Implement first-class commonmark language support for CommonMark, using [[research/commonmark-and-original-markdown]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for CommonMark.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior where applicable.
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Type | Status |
|---|---|---|
| [[TASK-318]] | Task | open |
| [[TASK-319]] | Task | open |
| [[TASK-320]] | Task | open |
| [[CHORE-117]] | Chore | open |
| [[CHORE-118]] | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] commonmark has source-backed parser/profile behavior.
- [ ] commonmark behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
