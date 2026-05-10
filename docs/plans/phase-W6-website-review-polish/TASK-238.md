---
id: "TASK-238"
title: "Expand mobile feature proof cards inline"
type: task
status: done
priority: high
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-235"]
tags: [tickets/task, "phase/W6", website, mobile, interaction]
aliases: ["TASK-238"]
---

# Expand Mobile Feature Proof Cards Inline

> [!INFO] `TASK-238` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

## Description

On mobile, selecting a homepage feature proof card should expand that card
inline with its "How it works" detail instead of relying on the separate detail
panel used on desktop.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| Follow-up | Mobile feature proof interaction | In mobile mode, selecting "How it works" content should expand the card itself. Desktop should not change. |

## Implementation Details

Expected behavior:

- Desktop keeps the separate full-width "How it works" detail panel below the
  four-card row.
- Mobile hides the separate detail panel and expands the selected card inline.
- The expanded mobile card keeps the detail visually attached to the selected
  feature card.
- Expanded content includes the same practical Markdown example and outcome as
  the desktop detail panel.
- The selected card exposes accessible selected and expanded state.

## Definition of Done

- [x] Requirements are updated for desktop versus mobile behavior.
- [x] Ticket is logged under Phase W6.
- [x] Mobile selected feature cards expand inline.
- [x] Desktop feature card selection remains unchanged.
- [x] Regression coverage guards the mobile inline detail contract.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from mobile interaction follow-up feedback. Status: `done`
> because implementation and regression coverage were completed in the same
> update pass.

> [!SUCCESS] Verified · 2026-05-09
> Website lint, typecheck, tests, and build pass. Mobile screenshot confirms
> the selected card expands inline and the desktop detail-panel behavior remains
> unchanged by CSS breakpoint.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
