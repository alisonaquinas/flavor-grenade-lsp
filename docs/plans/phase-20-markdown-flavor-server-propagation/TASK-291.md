---
id: "TASK-291"
title: "Gate Obsidian-only analysis by dialect profile"
type: task
status: open
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

## Definition of Done

- [ ] CommonMark analysis does not enable Obsidian-only syntax as core.
- [ ] Obsidian analysis preserves current OFM intelligence.
- [ ] Tests cover flavor change from CommonMark to Obsidian.
- [ ] Non-Obsidian dialect work is not forced into OFM-only aggregates.
