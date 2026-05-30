---
id: "TASK-289"
title: "Resolve effective flavor for explicit and auto modes"
type: task
status: done
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

Implement BC4-owned effective flavor resolution for `.fgignore`,
`.fgattributes`, and `auto` detection using marker, membership, and
syntax/context signals.

## Work Scope

- `.fgignore` matches return inactive before parsing or indexing.
- `.fgattributes` concrete flavor values resolve to that explicit flavor.
- `.fgattributes flavor=auto`, `!flavor`, and absent config files invoke Auto
  Detect.
- `.obsidian/` resolves to `obsidian` inside Auto Detect.
- Generic single-file Markdown resolves to `commonmark`.
- Invalid configured flavor values are rejected or ignored without mutating the
  active effective flavor.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-S-005` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[docs/test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]] | Resolves `.fgignore` inactive state, `.fgattributes` concrete values, Obsidian Auto Detect, syntax/context inference, invalid configured flavor, and CommonMark fallback. |
| [[docs/test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]] | Parameterized `.fgattributes` cases prove concrete values bypass Auto Detect, while `flavor=auto`, `!flavor`, and absent config invoke Auto Detect. |

## Implementation Notes

- Implement `resolveEffectiveFlavor(input)` in `src/markdown-flavor/markdown-flavor-state.ts`.
- Use `MarkdownFlavorSelection` and `MarkdownFlavorId` from the Phase 19 contract.
- Return `inactive` for non-Markdown language ids or non-file schemes.
- Resolve visibility first, then concrete `.fgattributes` flavor, then Auto
  Detect through Obsidian marker/membership, syntax/context inference, and
  CommonMark fallback.

## Definition of Done

- [x] Resolver outputs an explicit effective flavor.
- [x] Auto detection does not infer Obsidian for generic Markdown.
- [x] `.fgattributes` resolution covers every required explicit flavor id.
- [x] `.fgignore`, `.fgattributes` precedence, `flavor=auto`, `!flavor`, and
      invalid-value fallback behavior are tested.
- [x] Existing vault detection inputs are reused where appropriate.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing resolver assertions added before `src/markdown-flavor/markdown-flavor-state.ts` exists.

> [!SUCCESS] GREEN - 2026-05-13
> `MarkdownFlavorState` resolves explicit selections, resource propagation,
> `.fgattributes`, Obsidian markers, and CommonMark fallback.
