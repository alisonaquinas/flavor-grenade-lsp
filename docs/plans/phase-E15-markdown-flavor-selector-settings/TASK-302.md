---
id: "TASK-302"
title: "Persist flavor overrides at the correct settings scope"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-301"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-302"]
---

# Persist Flavor Overrides At The Correct Settings Scope

## Description

Write flavor overrides to workspace-folder or workspace settings for
folder-owned documents and user settings for standalone files.

## Work Scope

- Resolve owning workspace folder for active Markdown document.
- Write explicit flavor to workspace-folder or workspace target.
- Write standalone file override to user target.
- Clear/reset same target when Auto Detect is selected.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.OverridePersistence` | `GAP-E-005` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-006`, `EXT-MF-U-007`, `EXT-MF-U-008` | `extension/src/markdown-flavor.test.ts` | Workspace, standalone, and Auto reset targets. |

## Definition of Done

- [ ] Workspace files write workspace-folder or workspace scope.
- [ ] Standalone files write user scope.
- [ ] Auto clears or resets the same active scope.
