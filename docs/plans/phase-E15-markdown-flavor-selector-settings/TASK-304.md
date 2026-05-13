---
id: "TASK-304"
title: "Propagate effective flavor from extension to server"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-302", "TASK-303", "FEAT-043"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-304"]
---

# Propagate Effective Flavor From Extension To Server

## Description

Send effective flavor changes to the server and trigger refresh for open
Markdown documents.

## Work Scope

- Use initialization options, configuration changes, or a documented metadata
  request.
- Refresh server analysis after selector changes.
- Handle server unavailable state without losing selector state.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-E-006` |
| `Extension.MarkdownFlavor.Refresh` | `GAP-E-007` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Propagation call and refresh trigger behavior. |

## Definition of Done

- [ ] Flavor changes notify the server.
- [ ] Open Markdown refresh path runs after selector changes.
- [ ] Server failure preserves user-visible flavor state.
