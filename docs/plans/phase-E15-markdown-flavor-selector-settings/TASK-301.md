---
id: "TASK-301"
title: "Add Markdown flavor selector UI and quick pick"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-299", "TASK-300"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-301"]
---

# Add Markdown Flavor Selector UI And Quick Pick

## Description

Add the visible Markdown flavor selector and quick-pick menu required by
ADR020.

## Work Scope

- Add status item or equivalent selector command.
- Display Auto Detect with effective flavor when applicable.
- Show every required selector label.
- Keep selector inactive or non-applying for non-Markdown documents.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Selector` | `GAP-E-002` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-002` | `extension/src/markdown-flavor.test.ts` | Selector labels and visibility state. |

## Definition of Done

- [ ] Selector surface exists.
- [ ] Quick-pick labels match requirements.
- [ ] Selector does not use VS Code language picker for flavor.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
