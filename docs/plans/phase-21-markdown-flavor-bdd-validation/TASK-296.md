---
id: "TASK-296"
title: "Implement dialect profile BDD steps"
type: task
status: open
priority: high
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-294", "FEAT-043"]
tags: [tickets/task, "phase/21", bdd, markdown-flavor]
aliases: ["TASK-296"]
---

# Implement Dialect Profile BDD Steps

## Description

Implement BDD steps that assert Original Markdown, CommonMark, and researched
profile source/signature behavior.

## Work Scope

- Add effective flavor analysis steps.
- Add source trace assertions for every researched profile.
- Add signature behavior assertions using the profile registry.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-009`, `GAP-S-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/bdd/features/markdown-flavor-dialects.feature` | MF-E-002 dialect profile behavior. |

## Definition of Done

- [ ] Original Markdown scenarios execute.
- [ ] CommonMark scenarios execute.
- [ ] Research source examples execute for every flavor row.
