---
id: "TASK-220"
title: "Implement responsive app shell and theme modes"
type: task
status: in-review
priority: high
phase: W3
parent: "FEAT-036"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-035"]
tags: [tickets/task, "phase/W3", website, design]
aliases: ["TASK-220"]
---

# Implement Responsive App Shell And Theme Modes

> [!INFO] `TASK-220` · Task · Phase W3 · Parent: [[FEAT-036]] · Status: `in-review`

## Description

Implement the site shell with responsive navigation, skip link, and a theme
control that supports system default plus manual light and dark modes.

## Implementation Details

Create and wire:

- `website/src/shell/navigation.ts`
- `website/src/theme/theme.ts`
- `website/tests/shell-theme.test.ts`
- `website/src/App.svelte`
- `website/src/styles/global.scss`

Expected API:

- `primaryNavigation`
- `themeModes`
- `resolveTheme(mode, prefersDark)`
- `readStoredTheme(storage)`
- `writeStoredTheme(storage, mode)`

Add RED coverage in `website/tests/shell-theme.test.ts` before implementation.

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/shell-theme.test.ts` | Unit | `Website.Theme.ModeSelection` | ✅ passing |

## Definition of Done

- [x] Header exposes required primary navigation.
- [x] Mobile navigation is keyboard usable.
- [x] Theme defaults to system.
- [x] Manual light and dark selections persist.
- [x] Theme changes preserve focus and avoid layout shift.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Shell, navigation, theme module paths, exported API shape, and RED test target
> were recorded before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/shell-theme.test.ts`, which expects shell navigation and
> theme modules before they exist. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added navigation data, theme persistence helpers, responsive shell markup, and
> theme styles. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/shell-theme.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.
