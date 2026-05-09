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

- [x] Header and footer product icons load without broken-image indicators.
- [x] Homepage proof image loads without a broken-image indicator.
- [x] Footer brand text has enough space on narrow viewports.
- [x] Theme mode interaction is reduced to one compact icon control while
  preserving system, light, and dark modes.
- [x] Hero action buttons include icons.
- [x] Hero action buttons have equal widths when stacked.
- [x] Footer creator and project links include icons with accessible names.
- [x] Narrow viewports collapse primary navigation into a hamburger menu.
- [x] Browser screenshots verify the reviewed homepage and footer regions.
- [x] Homepage feature proof cards are selectable and reveal practical depth.
- [x] Mobile hero hides the long category eyebrow on narrow viewports.
- [x] Homepage feature cards use consistent default border color.
- [x] Second-round browser review feedback is verified.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-229]] | Repair homepage and footer image rendering | `green` |
| [[TASK-230]] | Replace segmented theme control with compact icon toggle | `green` |
| [[TASK-231]] | Add icon affordances and equal stacked widths to hero actions | `green` |
| [[TASK-232]] | Add icon affordances to footer links | `green` |
| [[TASK-233]] | Improve footer brand spacing on mobile | `green` |
| [[TASK-234]] | Collapse narrow navigation into hamburger menu | `green` |
| [[TASK-235]] | Make feature proof cards selectable | `green` |
| [[TASK-236]] | Hide mobile hero category eyebrow | `green` |
| [[TASK-237]] | Normalize feature card borders | `green` |
| [[CHORE-092]] | Phase W6 visual verification sweep | `done` |
| [[CHORE-093]] | Verify second-round W6 browser feedback | `done` |

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

> [!SUCCESS] Green implementation · 2026-05-09
> Implemented local website assets, icon affordances, compact theme toggle,
> equal-width stacked CTAs, mobile footer spacing, and hamburger navigation.
> Website lint, typecheck, tests, and build pass.

> [!SUCCESS] Ready for PR · 2026-05-09
> Local gate and visual smoke verification are complete. Stopped before opening
> a pull request as requested.

> [!SUCCESS] Review polish follow-up · 2026-05-09
> Widened the narrow hero action stack to match the proof card column width.

> [!INFO] Second-round feedback captured · 2026-05-09
> Added tickets for selectable proof cards with practical detail, hiding the
> mobile hero eyebrow, and normalizing feature card borders. Phase returned to
> `in-progress` until those tickets are implemented and verified.

> [!FAILURE] Red tests · 2026-05-09
> Added regression coverage for selectable feature proof detail, hidden mobile
> hero eyebrow, and consistent default feature card borders.

> [!SUCCESS] Follow-up green · 2026-05-09
> Implemented selectable feature proof cards, practical detail content, hidden
> mobile hero eyebrow, and consistent default feature card borders. Website
> gate and follow-up screenshots pass.
