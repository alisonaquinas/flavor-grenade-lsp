---
id: "TASK-231"
title: "Add icon affordances and equal stacked widths to hero actions"
type: task
status: red
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

> [!INFO] `TASK-231` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `red`

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

- [ ] Failing regression test exists before implementation.
- [ ] Hero action data or rendered markup includes icons for each action.
- [ ] Stacked action buttons use equal widths.
- [ ] Mobile layout remains free of horizontal overflow.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comment 4. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added homepage CTA coverage requiring action icons and equal stacked mobile
> widths.
