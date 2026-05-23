---
id: "TASK-233"
title: "Improve footer brand spacing on mobile"
type: task
status: done
priority: medium
phase: W6
parent: "FEAT-039"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-229", "TASK-232"]
tags: [tickets/task, "phase/W6", website, footer, mobile]
aliases: ["TASK-233"]
---

# Improve Footer Brand Spacing On Mobile

> [!INFO] `TASK-233` · Task · Phase W6 · Parent: [[FEAT-039]] · Status: `done`

## Description

Improve footer brand layout on narrow viewports so the product icon, product
name, and byline have enough room and do not crowd or wrap awkwardly.

## Browser Review Feedback

| Comment | Region | Finding |
|---|---|---|
| 2 | Footer brand block | Image is broken and text does not have enough space |

## Implementation Details

Create or update tests before implementation:

- `website/tests/footer.test.ts`
- `website/tests/mobile-layout.test.ts` or `website/tests/docs-mobile-layout.test.ts`

Expected behavior:

- Footer brand image has a stable size.
- Brand text column has enough inline space on mobile.
- Footer layout may stack or reflow, but text must not be squeezed into a
  narrow column beside the image.
- Creator byline remains visible without interaction.

## Definition of Done

- [x] Failing regression test exists before implementation.
- [x] Footer brand block has stable image dimensions.
- [x] Footer brand text has enough space on mobile.
- [x] Creator byline remains visible.
- [x] Browser screenshot verifies the reviewed mobile footer region.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review comment 2. Status: `open`.

> [!FAILURE] Red test · 2026-05-09
> Added mobile layout coverage requiring footer brand copy spacing hooks.

> [!SUCCESS] Green · 2026-05-09
> Added footer brand copy spacing hooks and min-width constraints so mobile
> footer text keeps readable space beside the product icon.

> [!CHECK] CI verified · 2026-05-09
> PR #58 merged with green CI. Website checks, tests, typecheck, lint, docs lint,
> and build passed for the W6 implementation branch.
