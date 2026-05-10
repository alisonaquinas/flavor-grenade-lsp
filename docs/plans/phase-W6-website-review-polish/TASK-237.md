---
id: "TASK-237"
title: "Normalize feature card borders"
type: task
status: done
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

> [!INFO] `TASK-237` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

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

- [x] Failing regression test exists before implementation.
- [x] Default card borders are consistent.
- [x] Hover/focus/selected states remain visible.
- [x] No per-card signal classes create different default border colors.
- [x] Browser screenshot verifies the feature section.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from second-round browser review comment 3. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added style coverage forbidding per-signal default feature card border
> overrides.

> [!SUCCESS] Green · 2026-05-09
> Removed per-signal default border overrides and kept a shared accent treatment
> for hover, focus, and selected feature cards.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
