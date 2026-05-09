---
id: "TASK-236"
title: "Hide mobile hero category eyebrow"
type: task
status: red
priority: medium
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, mobile, hero]
aliases: ["TASK-236"]
---

# Hide Mobile Hero Category Eyebrow

> [!INFO] `TASK-236` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `red`

## Description

Hide the long homepage hero category eyebrow on narrow mobile viewports where it
looks visually out of place and crowds the first viewport.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 2 | Mobile hero category eyebrow | Long category text can be hidden in mobile mode because it looks out of place. |

## Implementation Details

Create or update tests before implementation:

- Mobile layout tests should require the homepage hero eyebrow to hide at the
  narrow breakpoint.
- Desktop layout must keep the category available for product positioning.

Expected behavior:

- Desktop retains the category label.
- Narrow mobile hides the long category label.
- H1, value statement, CTAs, and product proof remain visible and meaningful.
- SEO metadata and accessible page structure still communicate the product
  category outside the hidden mobile label.

## Definition of Done

- [ ] Failing regression test exists before implementation.
- [ ] Hero category eyebrow is hidden on narrow mobile viewports.
- [ ] Desktop category eyebrow remains visible.
- [ ] Mobile first viewport feels less crowded.
- [ ] Browser screenshot verifies the mobile hero region.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from second-round browser review comment 2. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added mobile layout coverage requiring the hero category eyebrow to hide at
> the narrow breakpoint.
