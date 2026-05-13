---
id: "TASK-216"
title: "Establish source and test layout guards"
type: task
status: done
priority: medium
phase: W1
parent: "FEAT-034"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-214", "TASK-215"]
tags: [tickets/task, "phase/W1", website, documentation]
aliases: ["TASK-216"]
---

# Establish Source And Test Layout Guards

> [!INFO] `TASK-216` · Task · Phase W1 · Parent: [[FEAT-034]] · Status: `done`

## Description

Add lightweight checks or documented verification so website source remains in
`website/src`, website tests remain in `website/tests`, and implementation work
does not drift into `website/docs`.

## Linked Requirements

| Requirement | Source |
|---|---|
| Website source and test layout | [[website/docs/requirements/technical/source-layout-and-documentation]] |

## Implementation Details

Add a website-local layout guard test in `website/tests/layout.test.ts`.

The test should scan the website tree and fail if:

- implementation source appears outside `website/src`
- tests appear outside `website/tests`
- application source is added under `website/docs`

The guard must ignore:

- `node_modules`
- `dist`
- coverage output
- package lockfiles
- documentation Markdown

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/layout.test.ts` | Unit | `Website.Technical.SourceLayout` | ✅ passing |

## Definition of Done

- [x] A test, script, or documented CI-ready check validates source/test layout.
- [x] The check ignores generated output and fixtures appropriately.
- [x] `website/docs` remains documentation-only.
- [x] Architecture docs are updated if the layout changes.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> The layout guard behavior and test file were specified before implementation.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/layout.test.ts`, which expects a layout guard before the
> guard module exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added the layout guard module. The layout test now passes. Status: `green`.

> [!NOTE] Refactor · 2026-05-09
> Entered refactor to add source documentation for the exported layout guard
> helper before review. Status: `refactor`.

> [!SUCCESS] Refactor complete · 2026-05-09
> Added documentation to the exported layout validation helper. Layout tests
> remain green. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/layout.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #51 CI passed with the source-layout guard in place. Status: `done`.
