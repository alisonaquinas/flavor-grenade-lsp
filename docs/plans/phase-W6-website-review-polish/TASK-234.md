---
id: "TASK-234"
title: "Collapse narrow navigation into hamburger menu"
type: task
status: done
priority: high
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-039"]
tags: [tickets/task, "phase/W6", website, navigation, mobile, accessibility]
aliases: ["TASK-234"]
---

# Collapse Narrow Navigation Into Hamburger Menu

> [!INFO] `TASK-234` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

## Description

Collapse the primary navigation into a hamburger icon at the top right on
narrow viewports so the header does not consume excessive vertical space or
wrap into a dense link block.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| W6 extra 1 | Primary navigation | Reduce to a hamburger icon top right when narrow |

## Implementation Details

Create or update tests before implementation:

- `website/tests/mobile-layout.test.ts`
- Add a focused navigation test if source contracts need coverage.

Expected behavior:

- Narrow viewports show one hamburger/menu icon in the header.
- Desktop viewports keep the visible primary navigation.
- The menu exposes Home, Quickstart, How-To, Concepts, Advanced Usage, and FAQ.
- GitHub is not part of desktop or mobile primary navigation; it remains
  reachable from the hero CTA and footer project links.
- The hamburger has an accessible name and exposes expanded/collapsed state.
- Menu links remain keyboard reachable and focus-visible.

## Definition of Done

- [x] Failing regression test exists before implementation.
- [x] Narrow header shows a hamburger icon instead of the full wrapped nav.
- [x] Desktop header still shows primary navigation links.
- [x] Menu state is keyboard and screen-reader accessible.
- [x] Browser screenshot verifies the narrow header region.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from additional browser review feedback on narrow primary
> navigation. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added shell coverage requiring a hamburger nav control with expanded-state
> semantics on narrow viewports.

> [!SUCCESS] Green · 2026-05-09
> Added a mobile hamburger control with `aria-expanded` state and narrow-width
> menu styling while preserving desktop primary navigation.

> [!SUCCESS] Nav scope polish · 2026-05-09
> Removed GitHub from desktop and mobile primary navigation. Repository access
> remains available through the hero CTA and footer project links.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
