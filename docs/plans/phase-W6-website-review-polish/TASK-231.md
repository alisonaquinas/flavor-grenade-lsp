---
id: "TASK-231"
title: "Add icon affordances and equal stacked widths to hero actions"
type: task
status: done
priority: medium
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, cta, responsive]
aliases: ["TASK-231"]
---

# Add Icon Affordances And Equal Stacked Widths To Hero Actions

> [!INFO] `TASK-231` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

## Description

Add icons to the homepage hero action buttons and make stacked buttons render
with equal widths on narrow viewports.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 4 | Primary actions | Include icons on buttons; when stacked, make widths equal |

## Implementation Details

Create or update tests before implementation:

- `website/tests/homepage.test.ts`
- `website/tests/mobile-layout.test.ts`

Expected behavior:

- Quickstart, Visual Studio Marketplace, and GitHub actions each include a
  recognizable icon.
- Icons are decorative only when the visible label already names the action;
  otherwise they have accessible names.
- When hero action buttons stack, each button uses the same inline size.
- Button text remains readable and does not overflow.

## Definition of Done

- [x] Failing regression test exists before implementation.
- [x] Hero action data or rendered markup includes icons for each action.
- [x] Stacked action buttons use equal widths.
- [x] Mobile layout remains free of horizontal overflow.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comment 4. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added homepage CTA coverage requiring action icons and equal stacked mobile
> widths.

> [!SUCCESS] Green · 2026-05-09
> Added action icon metadata and rendered icons in all hero CTAs with a shared
> stacked width rule for narrow viewports.

> [!SUCCESS] Mobile width polish · 2026-05-09
> Updated the narrow homepage hero stack so action buttons use the full content
> column width and visually align with the proof card below.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
