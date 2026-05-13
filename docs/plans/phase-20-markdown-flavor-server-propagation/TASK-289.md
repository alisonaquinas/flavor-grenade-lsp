---
id: "TASK-289"
title: "Resolve effective flavor for explicit and auto modes"
type: task
status: open
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-288"]
tags: [tickets/task, "phase/20", markdown-flavor]
aliases: ["TASK-289"]
---

# Resolve Effective Flavor For Explicit And Auto Modes

## Description

Implement effective flavor resolution for explicit settings and `auto`
detection using vault/config/context signals.

## Work Scope

- Explicit override wins over detection.
- `.obsidian/` resolves to `obsidian`.
- Generic single-file Markdown resolves to `commonmark`.
- `.flavor-grenade.toml` can contribute configured project flavor when present.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-S-005` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/lsp/handlers/__tests__/configuration.handler.test.ts` | Resolves explicit, Obsidian auto, and CommonMark fallback. |

## Definition of Done

- [ ] Resolver outputs an explicit effective flavor.
- [ ] Auto detection does not infer Obsidian for generic Markdown.
- [ ] Existing vault detection inputs are reused where appropriate.
