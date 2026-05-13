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
- Generic Markdown resolves to CommonMark.
- Explicit settings win over detection.
- Server membership can contribute vault/context evidence without changing
  language id.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-E-004` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/markdown-flavor.test.ts` | Obsidian, config, membership, and generic fallback detection. |

## Definition of Done

- [ ] Auto detection resolves expected effective flavor.
- [ ] Generic Markdown does not auto-detect as Obsidian.
- [ ] Membership fallback does not trigger language promotion.
