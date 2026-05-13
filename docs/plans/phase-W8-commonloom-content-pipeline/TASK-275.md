---
id: "TASK-275"
title: "Wire scripts, gitignore, tests, and build gates"
type: task
status: done
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-273", "TASK-274"]
tags: [tickets/task, "phase/W8", website, tests, build]
aliases: ["TASK-275"]
---

# Wire Scripts, Gitignore, Tests, And Build Gates

> [!INFO] `TASK-275` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Make content generation part of normal website development and CI.

## Work Scope

- Add `website/src/content/generated/` to git ignore rules.
- Ensure build, typecheck, and tests generate or validate content before use.
- Add unit tests for core compiler behavior and adapter validation.
- Add stale-output checks for `content:check`.
- Update website CI docs or scripts as needed.

## Implementation Notes

Create or modify:

- `.gitignore`
- `website/package.json`
- `website/package-lock.json`
- `website/vitest.config.ts`
- `.github/workflows/ci.yml`
- `website/tests/content-pipeline-scripts.test.ts`
- `website/tests/content-pipeline-generated-ts.test.ts`
- `website/scripts/content/generate.ts`
- `website/scripts/content/check.ts`

Script behavior:

- `npm run content:generate` writes `website/src/content/generated`.
- `npm run content:check` regenerates in memory or a temp directory and fails
  if tracked generated output is stale, missing, committed, or inconsistent.
- `npm run build` must either run generation first or depend on already-current
  generated files with an actionable error.

## Linked Requirements

- [[website/docs/requirements/technical/source-layout-and-documentation]]
- [[website/docs/requirements/technical/ci-cd]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-scripts.test.ts` | Build and CI scripts include content generation or checking. |
| `website/tests/content-pipeline-generated-ts.test.ts` | `website/src/content/generated/` is git-ignored and stale output fails checks. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [x] Fresh clone plus install can build without committed generated content.
- [x] `content:check` fails when generated TypeScript is stale.
- [x] Website tests fail on broken content references.
- [x] Normal `npm run build` works without manual preconditions.

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.

> [!FAILURE] Red test · 2026-05-10
> Added failing coverage requiring normal website gates to run content
> generation/checking, generated output to be git-ignored, and `content:check`
> to execute successfully. Status: `red`.

> [!SUCCESS] Green implementation · 2026-05-10
> Added generated-output gitignore rules, website generated module build
> helpers, content script execution, and package gates for build, test, and
> typecheck. Verified with `npm test -- --run content-pipeline-scripts`, `npm
> run content:generate`, `npm run lint`, and `npm run typecheck`. Status:
> `green`.

> [!SUCCESS] Closed · 2026-05-11
> PR #64 merged W8 into `develop` with green CI, and the current branch passed
> `npm run content:generate`, `npm run content:check`, `npm run lint`,
> `npm run typecheck`, `npm test`, `npm run build`, and `bun run lint:docs`.
> Status: `done`.
