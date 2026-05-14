---
id: "TASK-301"
title: "Add Markdown flavor selector UI and quick pick"
type: task
status: done
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

- [x] Selector surface exists.
- [x] Quick-pick labels match requirements.
- [x] Selector does not use VS Code language picker for flavor.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for selector quick-pick ids and labels in
> `extension/src/markdown-flavor.test.ts`. Expected to fail until the selector
> item model and command are implemented.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> `flavorGrenade.selectMarkdownFlavor` is contributed, activated, registered,
> and backed by quick-pick rows for `auto` plus every explicit flavor id.
> Status: `green`.
