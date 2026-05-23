---
id: "TASK-293"
title: "Refresh open document diagnostics after flavor changes"
type: task
status: done
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
- Publish updated diagnostics and invalidate/recompute completion, navigation,
  document-link, hover, semantic-token, folding, and rename safety state that
  depends on effective flavor.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Refresh` | `GAP-S-004` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-007 - Flavor Change Refresh|MF-U-007]] | Flavor changes mark documents for refresh. |
| [[docs/test/markdown-flavor-integration-spec#MF-I-006 - Handler Refresh Coverage|MF-I-006]] | Spawned-server handler refresh reaches all flavor-sensitive LSP surfaces. |

## Implementation Notes

- Configuration handler reparses open documents after accepted flavor changes.
- `DocumentStore` exposes open document iteration.
- Unchanged or rejected configuration payloads do not refresh documents.
- Diagnostics are republished through existing `DiagnosticService` only after accepted mutation.

## Definition of Done

- [x] Open document diagnostics and all flavor-sensitive LSP surfaces refresh
      after flavor change.
- [x] Refresh does not require process restart.
- [x] Tests cover unchanged flavor as a no-op.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing refresh assertions added before accepted configuration changes reparse open documents.

> [!SUCCESS] GREEN - 2026-05-13
> Accepted configuration changes now reparse open Markdown documents, update
> `ParseCache`, and republish diagnostics without restarting the server.
