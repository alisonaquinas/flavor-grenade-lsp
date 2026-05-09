---
id: "FEAT-039"
title: "Website Review Polish"
type: feature
status: in-progress
priority: high
phase: W6
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-038"]
tags: [tickets/feature, "phase/W6", website, visual-polish, review]
aliases: ["FEAT-039"]
---

# Website Review Polish

> [!INFO] `FEAT-039` · Feature · Phase W6 · Priority: `high` · Status: `in-progress`

## Goal

Resolve the first browser review feedback for the public website so the
homepage and footer are visually credible, accessible, and ready for release
review.

## Scope

**In scope:**

- Broken header, footer, and hero proof images from browser review comments 1,
  2, and 5.
- Compact icon-based theme control from browser review comment 3.
- Iconified and equal-width stacked hero actions from browser review comment 4.
- Footer creator and project link icons from browser review comments 6, 7, and
  8.
- Footer mobile spacing and brand-block readability from browser review comment
  2.
- Narrow primary navigation hamburger behavior from the additional browser
  review comment.
- Tests and browser smoke evidence for the reviewed UI regions.

**Out of scope:**

- New public docs content.
- GitHub Pages release automation changes.
- Full visual redesign outside the reviewed homepage and footer regions.

## Linked Requirements

| Requirement | Source |
|---|---|
| Visual polish review requirements | [[../../../website/docs/requirements/design/index]] |
| Product identity assets | [[../../../website/docs/requirements/functional/product-identity-assets]] |
| Theme modes | [[../../../website/docs/requirements/functional/theme-modes]] |
| Attribution links | [[../../../website/docs/requirements/functional/attribution]] |
| Homepage UX | [[../../../website/docs/requirements/user/homepage]] |
| Accessibility and usability | [[../../../website/docs/requirements/user/accessibility-and-usability]] |

## Acceptance Criteria

- [ ] Header and footer product icons load without broken-image indicators.
- [ ] Homepage proof image loads without a broken-image indicator.
- [ ] Footer brand text has enough space on narrow viewports.
- [ ] Theme mode interaction is reduced to one compact icon control while
  preserving system, light, and dark modes.
- [ ] Hero action buttons include icons.
- [ ] Hero action buttons have equal widths when stacked.
- [ ] Footer creator and project links include icons with accessible names.
- [ ] Narrow viewports collapse primary navigation into a hamburger menu.
- [ ] Browser screenshots verify the reviewed homepage and footer regions.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-229]] | Repair homepage and footer image rendering | `red` |
| [[TASK-230]] | Replace segmented theme control with compact icon toggle | `red` |
| [[TASK-231]] | Add icon affordances and equal stacked widths to hero actions | `red` |
| [[TASK-232]] | Add icon affordances to footer links | `red` |
| [[TASK-233]] | Improve footer brand spacing on mobile | `red` |
| [[TASK-234]] | Collapse narrow navigation into hamburger menu | `red` |
| [[CHORE-092]] | Phase W6 visual verification sweep | `open` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created from browser review feedback captured on the local preview
> server. Status: `ready`.

> [!INFO] Added nav feedback · 2026-05-09
> Added TASK-234 for the narrow-header hamburger menu feedback captured after
> the initial W6 review comments.

> [!INFO] Started · 2026-05-09
> Phase W6 execution started on `feature/phase-w6-website-visual-feedback`.

> [!FAILURE] Red tests · 2026-05-09
> Added regression coverage for the reviewed asset, theme, CTA, footer, spacing,
> and narrow-navigation contracts. Child implementation tasks moved to `red`.
