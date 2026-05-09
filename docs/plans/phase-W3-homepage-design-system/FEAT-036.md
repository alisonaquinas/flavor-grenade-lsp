---
id: "FEAT-036"
title: "Homepage And Design System"
type: feature
status: done
priority: high
phase: W3
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-035"]
tags: [tickets/feature, "phase/W3", website, design]
aliases: ["FEAT-036"]
---

# Homepage And Design System

> [!INFO] `FEAT-036` · Feature · Phase W3 · Priority: `high` · Status: `done`

## Goal

Visitors immediately understand Flavor Grenade LSP, can reach the quickstart or
VS Code Marketplace, and can use the site comfortably on mobile, light mode,
dark mode, and system theme mode.

## Scope

**In scope:**

- Responsive app shell, header, mobile nav, and skip link.
- Light, dark, and system theme mode.
- Homepage hero and product proof sections.
- Product logo and icon usage.
- Footer creator byline, profile links, Marketplace link, and inspiration
  links.

**Out of scope:**

- Full docs content pages.
- Production deployment.

## Linked Requirements

| Requirement | Source |
|---|---|
| Design requirements | [[../../../website/docs/requirements/design/index]] |
| Homepage user requirements | [[../../../website/docs/requirements/user/homepage]] |
| Theme modes | [[../../../website/docs/requirements/functional/theme-modes]] |
| Attribution | [[../../../website/docs/requirements/functional/attribution]] |

## Acceptance Criteria

- [x] Homepage first viewport communicates product, category, value, and next
  action.
- [x] Theme modes meet the light/dark/system requirements.
- [x] Header and mobile navigation are keyboard usable.
- [x] Footer includes required byline and attribution links.
- [x] Mobile and desktop smoke tests pass.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-220]] | Implement responsive app shell and theme modes | `done` |
| [[TASK-221]] | Implement homepage hero and product proof sections | `done` |
| [[TASK-222]] | Implement footer byline and attribution links | `done` |
| [[BUG-026]] | Mobile homepage hero overflows viewport | `done` |
| [[CHORE-089]] | Phase W3 accessibility and visual QA sweep | `done` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for Phase W3 homepage and design system. Status: `ready`.

> [!INFO] Started · 2026-05-09
> Phase W3 started after W2 completed in PR #52. Status: `in-progress`.

> [!INFO] TASK-220 red · 2026-05-09
> TASK-220 entered `red` with a failing shell navigation and theme test.

> [!SUCCESS] TASK-220 green · 2026-05-09
> TASK-220 added the responsive shell, navigation data, and theme helpers.

> [!INFO] TASK-221 red · 2026-05-09
> TASK-221 entered `red` with a failing homepage content model test.

> [!SUCCESS] TASK-221 green · 2026-05-09
> TASK-221 added homepage content data, product proof, CTAs, and feature
> rendering.

> [!INFO] TASK-222 red · 2026-05-09
> TASK-222 entered `red` with a failing footer link and byline test.

> [!SUCCESS] TASK-222 green · 2026-05-09
> TASK-222 added footer link data, visible creator byline, and required
> attribution rendering.

> [!INFO] Implementation tasks in review · 2026-05-09
> TASK-220, TASK-221, and TASK-222 moved to `in-review` after updating website
> test index and matrix entries.

> [!INFO] Verification sweep started · 2026-05-09
> CHORE-089 entered `in-progress` to run Phase W3 local gates, visual checks,
> and Step E-L evidence.

> [!WARNING] BUG-026 opened · 2026-05-09
> CHORE-089 mobile visual smoke found clipped hero text at 390px width. BUG-026
> opened before fixing per Rule 5.

> [!SUCCESS] Local W3 gate · 2026-05-09
> BUG-026 fixed and reviewed locally. CHORE-089 passed website lint, typecheck,
> unit tests, build, docs lint, whitespace check, and desktop/mobile visual
> smoke. Status: `in-review` pending PR CI.

> [!SUCCESS] Repository sweep · 2026-05-09
> Broader root and package verification passed: root lint, typecheck, unit
> tests, smoke BDD, Bun audit, website npm audit, and extension npm audit.

> [!SUCCESS] Done · 2026-05-09
> PR #53 CI passed with W3 homepage, theme, responsive, footer, asset, and
> mobile regression checks. Status: `done`.
