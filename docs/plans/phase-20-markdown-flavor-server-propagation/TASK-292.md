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
flavor transitions. The process-boundary protocol is
`workspace/didChangeConfiguration` carrying `flavorGrenade.markdownFlavor`.

## Work Scope

- Spawn server with CommonMark configuration.
- Change configuration to Obsidian with an open document.
- Iterate all required explicit flavor ids.
- Test unsupported flavor rejection.
- Test temp workspace precedence for `.flavor-grenade.toml`, workspace setting,
  both present, invalid configured values, and fallback.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.ServerPropagation` | `GAP-S-008` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[test/markdown-flavor-integration-spec#MF-I-005|MF-I-005]] | Spawned-server temp workspace precedence cases: TOML, workspace setting, both present, invalid values, and fallback. |
| `src/test/integration/markdown-flavor.test.ts` | MF-I-001 through MF-I-004. |

## Definition of Done

- [ ] Spawned integration tests cover supported ids.
- [ ] Invalid id path is tested.
- [ ] Temp workspace precedence covers TOML, workspace setting, both present,
      invalid values, and fallback.
- [ ] Tests run in local root test battery or documented integration gate.
