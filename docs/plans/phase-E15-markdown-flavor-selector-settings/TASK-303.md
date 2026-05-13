---
id: "TASK-303"
title: "Resolve Auto Detect from workspace and membership signals"
type: task
status: open
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-300"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-303"]
---

# Resolve Auto Detect From Workspace And Membership Signals

## Description

Implement extension-side `auto` resolution from marker, settings, and server
membership inputs.

## Work Scope

- `.obsidian/` resolves to Obsidian.
- `.flavor-grenade.toml` can resolve `auto` to each supported explicit flavor
  when the project config names that flavor.
- Workspace setting resolution covers every explicit flavor id.
- Precedence is explicit: manual override, workspace setting/project config,
  vault marker, then generic fallback.
- Invalid configured flavors are rejected or ignored with fallback behavior.
- Generic Markdown resolves to CommonMark.
- Explicit settings win over detection.
- Server membership can contribute vault/context evidence without changing
  language id.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-E-004` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-004`, `EXT-MF-U-005` | `extension/src/markdown-flavor.test.ts` | Obsidian, config, membership, and generic fallback detection. |
| `EXT-MF-U-004` | `extension/src/markdown-flavor.test.ts` | Parameterized `.flavor-grenade.toml` and workspace-setting cases resolve `auto` to every required explicit flavor id; invalid values fall back without language promotion. |

## Definition of Done

- [ ] Auto detection resolves expected effective flavor.
- [ ] `.flavor-grenade.toml` and workspace settings can resolve `auto` to each
      required explicit flavor id.
- [ ] Invalid configured flavor values preserve prior state or fall back to the
      documented default without changing language id.
- [ ] Generic Markdown does not auto-detect as Obsidian.
- [ ] Membership fallback does not trigger language promotion.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
