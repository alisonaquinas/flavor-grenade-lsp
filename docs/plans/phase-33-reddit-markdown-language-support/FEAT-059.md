---
id: "FEAT-059"
title: "Reddit Markdown Language Support"
type: feature
status: draft
priority: high
phase: 33
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-043"]
tags: [tickets/feature, "phase/33", markdown-flavor, "reddit"]
aliases: ["FEAT-059"]
---

# Reddit Markdown Language Support

> [!INFO] FEAT-059 - Feature - Phase 33 - Status: draft

## Description

Implement first-class reddit language support for Reddit Markdown, using [[research/reddit-markdown-analysis]] as the source of truth for supported syntax and portability boundaries.

## Scope

- Define parser/profile behavior for Reddit Markdown.
- Wire flavor-aware diagnostics, completion, document links, folding, semantic tokens, navigation, and hover behavior where applicable.
- Add unit, integration, BDD, verification, and validation evidence for this flavor.

## Child Tickets

| Ticket | Type | Status |
|---|---|---|
| [[TASK-348]] | Task | open |
| [[TASK-349]] | Task | open |
| [[TASK-350]] | Task | open |
| [[CHORE-137]] | Chore | open |
| [[CHORE-138]] | Chore | open |

## Linked Requirements

| Requirement | Source |
|---|---|
| Extension.MarkdownFlavor.DialectProfiles | [[requirements/ofmarkdown-language-mode]] |
| Extension.MarkdownFlavor.ServerPropagation | [[requirements/ofmarkdown-language-mode]] |

## Definition of Done

- [ ] reddit has source-backed parser/profile behavior.
- [ ] reddit behavior is covered at every required test level.
- [ ] Trace links from requirements, tests, and validation evidence are updated.
