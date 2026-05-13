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
- Read and write resource-scoped configuration through
  `workspace.getConfiguration("flavorGrenade", document.uri)` so multi-root
  workspaces resolve the correct folder-specific effective value.
- If the active Markdown document belongs to a workspace folder and VS Code has
  more than one workspace folder, write explicit flavor overrides with
  `ConfigurationTarget.WorkspaceFolder` for that document resource.
- If the active Markdown document belongs to a workspace folder and there is
  only one workspace folder, write explicit flavor overrides with
  `ConfigurationTarget.Workspace` unless an existing folder-level value already
  applies to that resource; in that case update `WorkspaceFolder`.
- If the active Markdown document has no owning workspace folder, write
  explicit flavor overrides with `ConfigurationTarget.Global` for the standalone
  user setting. Do not create workspace settings for standalone files.
- When Auto Detect is selected, clear the same target that the active explicit
  override came from by updating that key to `undefined`; if no explicit
  override exists, leave settings unchanged and recompute the effective flavor.

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
- [ ] Multi-root writes use the active document resource URI.
- [ ] Auto clears the same active scope by writing `undefined` and does not
      replace it with a literal `auto` override.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for workspace-folder/workspace/global override target
> selection and Auto Detect clearing through `undefined`.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Selector persistence chooses workspace-folder, workspace, or global targets
> from the active Markdown resource and clears Auto Detect with `undefined`.
> Status: `green`.
