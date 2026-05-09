---
id: "CHORE-089"
title: "Phase W3 accessibility and visual QA sweep"
type: chore
status: in-review
priority: high
phase: W3
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-220", "TASK-221", "TASK-222", "BUG-026"]
tags: [tickets/chore, "phase/W3", website, verification]
aliases: ["CHORE-089"]
---

# Phase W3 Accessibility And Visual QA Sweep

> [!INFO] `CHORE-089` · Chore · Phase W3 · Status: `in-review`

## Description

Verify the homepage, shell, footer, theme modes, mobile layout, keyboard
behavior, and product imagery before Phase W3 moves to review.

## Acceptance Criteria

- [x] Website lint, typecheck, tests, and build pass.
- [x] Mobile viewport has no horizontal overflow.
- [x] Theme modes pass automated or manual smoke checks.
- [x] Footer links and byline are visible on mobile and desktop.
- [x] Design requirements are updated if implementation decisions changed.
- [x] `FEAT-036` acceptance checklist is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/chore-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Chore created for the Phase W3 verification sweep. Status: `open`.

> [!INFO] Started · 2026-05-09
> Began the Phase W3 accessibility and visual QA sweep after TASK-220,
> TASK-221, and TASK-222 reached `in-review`. Status: `in-progress`.

> [!WARNING] Finding · 2026-05-09
> Mobile visual smoke at 390px found clipped hero text and horizontal overflow.
> Opened BUG-026 before fixing.

> [!SUCCESS] Mobile recheck · 2026-05-09
> BUG-026 fix rebuilt successfully and the 390px mobile screenshot no longer
> shows clipped category, CTA, or proof content.

> [!SUCCESS] Local gate · 2026-05-09
> Passed `npm run lint`, `npm run typecheck`, `npm test` (10 files, 20 tests),
> `npm run build`, `bun run lint:docs`, and `git diff --check`. Desktop and
> mobile Chrome screenshots were captured after the BUG-026 fix. Status:
> `in-review`.

> [!SUCCESS] Repository sweep · 2026-05-09
> Passed `bun run lint --max-warnings 0`, `bun run typecheck`,
> `bun test src/` (668 tests), `bun run bdd --tags "@smoke"` (13 scenarios),
> `bun audit`, website `npm audit`, and extension `npm audit`.
