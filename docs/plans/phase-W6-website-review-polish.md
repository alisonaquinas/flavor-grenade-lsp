---
title: "Phase W6: Website Review Polish"
phase: W6
status: planned
tags: [plans, website, visual-polish, accessibility, review]
aliases: [Phase W6, Website Review Polish]
updated: 2026-05-09
---

# Phase W6: Website Review Polish

| Field | Value |
|---|---|
| Phase | W6 |
| Title | Website Review Polish |
| Status | planned |
| Gate | Browser-reviewed homepage visual feedback is implemented, tested, and verified on mobile and desktop |
| Depends on | Phase W5 implementation review state |

## Objective

Resolve the first browser review feedback for the website homepage and footer
before release. This phase focuses on visual correctness, icon affordances,
responsive spacing, and image reliability rather than new content scope.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[../website/docs/requirements/design/index]] | Apply homepage and footer visual feedback requirements |
| [[../website/docs/requirements/functional/product-identity-assets]] | Ensure product images and screenshots render without broken icons |
| [[../website/docs/requirements/functional/theme-modes]] | Replace the segmented theme mode control with a compact icon toggle |
| [[../website/docs/requirements/functional/attribution]] | Add recognizable icons to footer creator and project links |
| [[../website/docs/requirements/user/accessibility-and-usability]] | Preserve accessible names, spacing, and keyboard support |
| [[../website/docs/requirements/user/homepage]] | Improve CTA iconography and stacked mobile button widths |

## Scope

### In Scope

- Fix broken product logo/icon rendering in the header and footer.
- Fix broken product proof screenshot rendering in the homepage hero.
- Replace the three-button theme segmented control with a single icon control
  that toggles or opens the three theme modes.
- Add icons to homepage primary action buttons.
- Ensure stacked hero action buttons render at equal widths.
- Add icons to footer creator and project links.
- Improve footer brand spacing on narrow viewports so image and text do not
  crowd or overlap.
- Collapse narrow primary navigation into a hamburger icon/menu at the top
  right.
- Add tests or visual smoke evidence for the affected UI contracts.

### Out of Scope

- New website content pages.
- Release workflow changes.
- Major visual redesign beyond the reviewed homepage and footer feedback.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Asset reliability | Header, footer, and proof images load without broken-image icons |
| Theme interaction | Compact icon-based theme control preserves system/light/dark behavior |
| CTA affordance | Hero actions use icons and equal stacked widths |
| Footer affordance | Creator and project footer links use icons and preserve readable spacing |
| Responsive navigation | Narrow header uses a hamburger menu instead of wrapped full navigation |
| Verification | Tests and browser screenshots cover desktop and mobile review targets |

## Acceptance

- Header logo/icon loads visibly in light and dark mode.
- Footer product icon loads and leaves enough text space on mobile.
- Homepage proof visual loads visibly and keeps meaningful alt text.
- Theme control is reduced to one compact icon affordance while retaining
  system, light, and dark selection.
- Hero primary actions include icons and stack at equal widths on narrow
  viewports.
- Footer creator and project links include icons with accessible names.
- Narrow viewports show a hamburger menu instead of wrapped primary navigation.
- Browser review shows no broken image icons in the reviewed homepage regions.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

Browser verification must capture the homepage at mobile and desktop widths and
confirm the reviewed regions no longer show broken images, cramped footer text,
or missing icon affordances.

## Tickets

- [[plans/phase-W6-website-review-polish/FEAT-039]]
- [[plans/phase-W6-website-review-polish/TASK-229]]
- [[plans/phase-W6-website-review-polish/TASK-230]]
- [[plans/phase-W6-website-review-polish/TASK-231]]
- [[plans/phase-W6-website-review-polish/TASK-232]]
- [[plans/phase-W6-website-review-polish/TASK-233]]
- [[plans/phase-W6-website-review-polish/TASK-234]]
- [[plans/phase-W6-website-review-polish/CHORE-092]]

## Related

- [[../website/docs/requirements/design/index]]
- [[../website/docs/requirements/functional/product-identity-assets]]
- [[../website/docs/requirements/functional/theme-modes]]
- [[../website/docs/requirements/functional/attribution]]
- [[../website/docs/requirements/user/homepage]]
