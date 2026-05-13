---
id: "TASK-293"
title: "Refresh open document diagnostics after flavor changes"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-288", "TASK-290"]
tags: [tickets/task, "phase/20", markdown-flavor]
aliases: ["TASK-293"]
---

# Refresh Open Document Diagnostics After Flavor Changes

## Description

Ensure flavor changes cause affected open documents to re-run diagnostics and
feature analysis without requiring a server restart.

## Work Scope

- Identify open documents affected by flavor state changes.
- Reparse or re-analyze them with the new effective flavor.
- Publish updated diagnostics.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Refresh` | `GAP-S-004` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-007 - Flavor Change Refresh|MF-U-007]] | Flavor changes mark documents for refresh. |

## Definition of Done

- [ ] Open document diagnostics refresh after flavor change.
- [ ] Refresh does not require process restart.
- [ ] Tests cover unchanged flavor as a no-op.
