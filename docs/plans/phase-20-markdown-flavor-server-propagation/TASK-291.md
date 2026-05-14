---
id: "TASK-291"
title: "Gate Obsidian-only analysis by dialect profile"
type: task
status: done
priority: high
phase: 20
parent: "FEAT-043"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-290"]
tags: [tickets/task, "phase/20", markdown-flavor]
aliases: ["TASK-291"]
---

# Gate Obsidian-Only Analysis By Dialect Profile

## Description

Use profile capabilities so Original Markdown and CommonMark do not treat
Obsidian-only constructs as core Markdown behavior, while preserving room for
non-Obsidian dialect projections.

## Work Scope

- Gate wiki links, embeds, block anchors, tags, and callouts for non-Obsidian
  profiles where behavior would be misleading.
- Preserve current OFM behavior for effective flavor `obsidian`.
- Keep future dialect expansion possible through `MarkdownDoc` /
  `MarkdownIndex` instead of forcing all syntax into OFM-only aggregates.
- Keep syntax-only dialect constructs in BC2; emit BC3 refs/defs only for
  constructs with navigation/reference semantics.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-007` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/integration/markdown-flavor.test.ts` | CommonMark excludes Obsidian wiki-link behavior until flavor changes to Obsidian. |

## Implementation Notes

- Gate OFM-only token parsers inside `src/parser/ofm-parser.ts` using Phase 19 profile capabilities.
- Keep default parser behavior compatible for direct unit tests by resolving absent context as `obsidian`.
- Verify CommonMark suppresses wiki links, embeds, tags, block anchors, and callouts when the server provides a CommonMark parse context.

## Definition of Done

- [x] CommonMark analysis does not enable Obsidian-only syntax as core.
- [x] Obsidian analysis preserves current OFM intelligence.
- [x] Tests cover flavor change from CommonMark to Obsidian.
- [x] Non-Obsidian dialect work is not forced into OFM-only aggregates.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing parser assertions prove CommonMark must suppress Obsidian-only tokens before gating exists.

> [!SUCCESS] GREEN - 2026-05-13
> Wiki links, embeds, tags, callouts, and block anchors now parse only when the
> effective flavor is `obsidian`; CommonMark/GFM examples suppress those tokens.
