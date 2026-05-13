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

Implement BC4-owned effective flavor resolution for explicit settings and
`auto` detection using vault/config/context signals.

## Work Scope

- Use the named `MarkdownFlavorCascade`: VS Code explicit override, VS Code
  workspace-folder/workspace setting, project TOML, vault marker, CommonMark
  fallback.
- `.obsidian/` resolves to `obsidian`.
- Generic single-file Markdown resolves to `commonmark`.
- `.flavor-grenade.toml` can contribute configured project flavor when present.
- Workspace settings can contribute configured project flavor when present.
- VS Code workspace-folder/workspace setting wins over `.flavor-grenade.toml`
  when both exist; workspace-folder wins over workspace.
- Invalid configured flavor values are rejected or ignored without mutating the
  active effective flavor.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.AutoDetection` | `GAP-S-005` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| [[test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]] | Resolves explicit, Obsidian auto, `.flavor-grenade.toml`, workspace setting, precedence, invalid configured flavor, and CommonMark fallback. |
| [[test/markdown-flavor-unit-spec#MF-U-008 - Auto Flavor Resolution|MF-U-008]] | Parameterized `.flavor-grenade.toml` and workspace-setting cases resolve `auto` to every required explicit flavor id. |

## Definition of Done

- [ ] Resolver outputs an explicit effective flavor.
- [ ] Auto detection does not infer Obsidian for generic Markdown.
- [ ] `.flavor-grenade.toml` and workspace setting resolution cover every
      required explicit flavor id.
- [ ] VS Code setting vs TOML tie-breakers and invalid-value fallback behavior are tested.
- [ ] Existing vault detection inputs are reused where appropriate.
