---
id: "FEAT-050"
title: "Obsidian Flavor Language Support"
type: feature
status: draft
priority: high
phase: 24
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/24", markdown-flavor, "obsidian"]
aliases: ["FEAT-050"]
---

# Obsidian Flavor Language Support

> [!INFO] FEAT-050 - Feature - Phase 24 - Status: draft

## Description

Implement first-class obsidian language support for Obsidian, using [[ofm-spec/index]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Obsidian.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior where applicable.
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Type | Status |
|---|---|---|
| [[TASK-321]] | Task | open |
| [[TASK-322]] | Task | open |
| [[TASK-323]] | Task | open |
| [[CHORE-119]] | Chore | open |
| [[CHORE-120]] | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] obsidian has source-backed parser/profile behavior.
- [ ] obsidian behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
