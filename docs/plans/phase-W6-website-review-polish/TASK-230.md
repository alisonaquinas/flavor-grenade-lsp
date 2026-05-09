---
id: "TASK-230"
title: "Replace segmented theme control with compact icon toggle"
type: task
status: red
priority: high
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, theme, accessibility]
aliases: ["TASK-230"]
---

# Replace Segmented Theme Control With Compact Icon Toggle

> [!INFO] `TASK-230` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `red`

## Description

Replace the visible System / Light / Dark segmented control with one compact
icon affordance. The control must still allow system, light, and dark mode
selection and remain accessible to keyboard and screen-reader users.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 3 | Theme control | Reduce to a single icon with click toggle |

## Implementation Details

Create or update tests before implementation:

- `website/tests/shell-theme.test.ts`
- Potentially add `website/tests/theme-control.test.ts` if the behavior needs
  its own source contract.

Expected behavior:

- A single icon button is visible in the header.
- Click behavior either cycles `system → light → dark → system` or opens a
  compact menu containing the three modes.
- The active mode is exposed in the accessible name, `aria-label`, or
  equivalent state.
- Existing persistence and system-default behavior remains intact.

## Definition of Done

- [ ] Failing regression test exists before implementation.
- [ ] Only one compact visible theme control affordance appears in the header.
- [ ] System, light, and dark modes remain reachable.
- [ ] Keyboard operation and focus behavior are verified.
- [ ] Theme persistence tests still pass.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comment 3. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added theme-cycle coverage requiring a compact single-control flow for
> system, light, and dark modes.
