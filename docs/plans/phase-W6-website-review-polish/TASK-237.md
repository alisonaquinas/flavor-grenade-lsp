---
id: "TASK-237"
title: "Normalize feature card borders"
type: task
status: open
priority: medium
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, visual-polish, cards]
aliases: ["TASK-237"]
---

# Normalize Feature Card Borders

> [!INFO] `TASK-237` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `open`

## Description

Use consistent default border colors for homepage feature proof cards instead
of varying border color by capability.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 3 | Feature proof cards | Keep card border colors consistent instead of varying them. |

## Implementation Details

Create or update tests before implementation:

- Style regression tests should guard against per-signal border color variants
  on default feature cards.

Expected behavior:

- All feature proof cards share the same default border color.
- Hover, focus, and selected states may use a shared accent treatment.
- Selection state from TASK-235 must not reintroduce per-card default border
  colors.
- The section should feel cohesive in light and dark themes.

## Definition of Done

- [ ] Failing regression test exists before implementation.
- [ ] Default card borders are consistent.
- [ ] Hover/focus/selected states remain visible.
- [ ] No per-card signal classes create different default border colors.
- [ ] Browser screenshot verifies the feature section.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from second-round browser review comment 3. Status: `open`.
