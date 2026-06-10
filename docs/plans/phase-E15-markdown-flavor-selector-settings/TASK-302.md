---
id: "TASK-302"
title: "Persist flavor overrides through .mdfattributes scopes"
type: task
status: done
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-301"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-302"]
---

# Persist Flavor Overrides Through .mdfattributes Scopes

## Description

Write flavor overrides to `.mdfattributes` for selected-file or directory scope.
Standalone files use the same selected-file `.mdfattributes` rule beside the
file.

## Work Scope

- Resolve the active Markdown document directory.
- After flavor selection, show a second prompt with `Selected file` and
  `All files in this directory`.
- For `Selected file`, write or update a file-specific `.mdfattributes` rule in
  the active file's directory.
- For `All files in this directory`, write or update an anchored `/*.md`
  `.mdfattributes` rule in the active file's directory.
- If the active Markdown document has no owning workspace folder, write the
  selected-file `.mdfattributes` rule beside the standalone file.
- When Auto Detect is selected, clear/reset the matching `.mdfattributes`
  `flavor` at the chosen scope with `!flavor` or rule removal, then recompute
  the effective flavor.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.OverridePersistence` | `GAP-E-005` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-006`, `EXT-MF-U-007`, `EXT-MF-U-008` | `extension/src/markdown-flavor.test.ts` | Selected-file, directory, standalone, and Auto reset targets. |

## Definition of Done

- [x] Workspace files write selected-file or directory `.mdfattributes` scope.
- [x] Standalone files write selected-file `.mdfattributes` beside the file.
- [x] Multi-root writes use the active document directory.
- [x] Auto clears/resets the same active `.mdfattributes` scope and does not
      replace it with an effective flavor.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for selected-file/directory `.mdfattributes` target
> selection and Auto Detect clearing/reset.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Selector persistence chooses selected-file or directory `.mdfattributes`
> targets from the active Markdown resource and clears/resets Auto Detect at the
> same scope.
> Status: `green`.
