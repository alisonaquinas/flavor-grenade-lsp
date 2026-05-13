---
id: "TASK-292"
title: "Add spawned-server flavor propagation tests"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-288", "TASK-291"]
tags: [tickets/task, "phase/20", markdown-flavor, integration]
aliases: ["TASK-292"]
---

# Add Spawned-Server Flavor Propagation Tests

## Description

Implement `src/test/integration/markdown-flavor.test.ts` for real LSP process
flavor transitions.

## Work Scope

- Spawn server with CommonMark configuration.
- Change configuration to Obsidian with an open document.
- Iterate all required explicit flavor ids.
- Test unsupported flavor rejection.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-008` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/integration/markdown-flavor.test.ts` | MF-I-001 through MF-I-004. |

## Definition of Done

- [ ] Spawned integration tests cover supported ids.
- [ ] Invalid id path is tested.
- [ ] Tests run in local root test battery or documented integration gate.
