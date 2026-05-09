---
title: "Phase W3: Homepage And Design System"
phase: W3
status: planned
tags: [plans, website, design, homepage]
aliases: [Phase W3, Website Homepage]
updated: 2026-05-09
---

# Phase W3: Homepage And Design System

| Field | Value |
|---|---|
| Phase | W3 |
| Title | Homepage And Design System |
| Status | planned |
| Gate | Homepage, theme modes, responsive shell, product assets, and footer pass tests and visual smoke checks |
| Depends on | Phase W2 |

## Objective

Implement the public homepage and design system shell: responsive navigation,
light/dark/system theme modes, product logo usage, homepage proof sections, and
the footer byline and attribution system.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[../website/docs/requirements/design/index]] | Apply UI/UX, layout, typography, theme, and footer requirements |
| [[../website/docs/requirements/functional/theme-modes]] | Implement light, dark, and system theme behavior |
| [[../website/docs/requirements/functional/product-identity-assets]] | Reuse product logo and icon assets |
| [[../website/docs/requirements/functional/attribution]] | Implement inspiration links and creator byline |
| [[../website/docs/requirements/functional/mobile-and-responsive]] | Keep homepage usable on mobile |

## Scope

### In Scope

- App shell layout, header, footer, and mobile navigation.
- Theme control with light, dark, and system modes.
- Homepage hero with product identity and real product proof.
- Feature overview sections.
- Footer with "Vibe-coded by: Alison Aquinas" and public links.
- Accessibility and responsive smoke tests.

### Out of Scope

- Full quickstart and how-to content.
- Production Pages deployment.
- Advanced search.

## Workstreams

| Workstream | Deliverable |
|---|---|
| Shell | Header, navigation, footer, skip link, and layout primitives |
| Theme | System default and manual light/dark controls |
| Homepage | Hero, product demo panel, feature sections, Marketplace CTA |
| Visual QA | Mobile and desktop smoke checks |

## Acceptance

- Homepage first viewport communicates product, category, value, and next
  action.
- Theme mode control defaults to system and persists manual selection.
- Product assets render with useful alt text.
- Footer contains project metadata, creator byline, profile links, GitHub,
  Marketplace, and inspiration links.
- Mobile viewport has no horizontal page overflow or overlapping controls.

## Gate Verification

```bash
cd website
npm run lint
npm run typecheck
npm test
npm run build
```

## Tickets

- [[plans/phase-W3-homepage-design-system/FEAT-036]]
- [[plans/phase-W3-homepage-design-system/TASK-220]]
- [[plans/phase-W3-homepage-design-system/TASK-221]]
- [[plans/phase-W3-homepage-design-system/TASK-222]]
- [[plans/phase-W3-homepage-design-system/CHORE-089]]

## Related

- [[../website/docs/requirements/design/index]]
- [[../website/docs/requirements/functional/theme-modes]]
