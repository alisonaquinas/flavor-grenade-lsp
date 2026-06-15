---
id: "TASK-303"
title: "Resolve Auto Detect after config-file resolution"
type: task
status: done
priority: high
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-300"]
tags: [tickets/task, "phase/E15", markdown-flavor, vscode]
aliases: ["TASK-303"]
---

# Resolve Auto Detect After Config-File Resolution

## Description

Implement extension-side `auto` resolution after `.mdfattributes` resolution
requests Auto Detect. Auto Detect uses marker, server membership, and bounded
syntax/context evidence according to
[[docs/design/markdown-flavor-auto-detection]].

## Work Scope

- `.mdfattributes` concrete flavor values bypass Auto Detect.
- `.mdfattributes flavor=auto`, `!flavor`, and absent config files invoke Auto
  Detect.
- `.mdfignore` matches make the document inactive before Auto Detect.
- `.obsidian/` resolves to Obsidian inside Auto Detect.
- Server membership can contribute vault/context evidence without changing
  language id.
- Syntax/context inference runs only inside Auto Detect and never overrides a
  concrete `.mdfattributes` flavor.
- Invalid configured flavors are rejected or ignored with fallback behavior.
- Generic Markdown resolves to CommonMark.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-E-004`, `AUD-E-003`, `AUD-ET-005` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-U-004`, `EXT-MF-U-005` | `extension/src/markdown-flavor.test.ts` | `.mdfignore`, `.mdfattributes`, Obsidian, membership, syntax/context inference, and generic fallback detection. |
| `EXT-MF-U-004` | `extension/src/markdown-flavor.test.ts` | Parameterized config-resolution cases prove concrete `.mdfattributes` values bypass Auto Detect, while `flavor=auto`, `!flavor`, and absent config invoke Auto Detect. Invalid values and `.mdfignore`/`.mdfattributes` appear/disappear/change events fall back or refresh without language promotion. |

## Definition of Done

- [x] Auto Detect resolves expected effective flavor from marker, membership,
      and syntax/context evidence.
- [x] `.mdfattributes` concrete values can select each required explicit flavor
      id without invoking Auto Detect.
- [x] `.mdfattributes flavor=auto`, `!flavor`, and absent config invoke Auto
      Detect.
- [x] `.mdfignore` and `.mdfattributes` appear/disappear/change events refresh
      effective flavor or inactive state.
- [x] Invalid configured flavor values preserve prior state or fall back to the
      documented default without changing language id.
- [x] Generic Markdown does not auto-detect as Obsidian.
- [x] Membership fallback does not trigger language promotion.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!WARNING] Red - 2026-05-13
> RED coverage added for config-file resolution and Auto Detect: `.mdfignore`
> inactive state, `.mdfattributes` concrete flavor, Auto Detect trigger,
> Obsidian marker evidence, and CommonMark fallback, while non-Markdown language
> ids remain inactive.
> Status: `red`.

> [!SUCCESS] Green - 2026-05-13
> Effective flavor resolution covers `.mdfattributes` concrete selection, Auto
> Detect trigger, Obsidian marker/membership evidence, CommonMark fallback, and
> inactive non-Markdown documents without language promotion.
> Status: `green`.
