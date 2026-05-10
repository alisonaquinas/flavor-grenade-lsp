---
id: "TASK-275"
title: "Wire scripts, gitignore, tests, and build gates"
type: task
status: open
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

> [!INFO] `TASK-275` · Task · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

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

- [[../../../website/docs/requirements/technical/source-layout-and-documentation]]
- [[../../../website/docs/requirements/technical/ci-cd]]

## Linked Tests

| Test file | Expected first assertion |
|---|---|
| `website/tests/content-pipeline-scripts.test.ts` | Build and CI scripts include content generation or checking. |
| `website/tests/content-pipeline-generated-ts.test.ts` | `website/src/content/generated/` is git-ignored and stale output fails checks. |

## Linked BDD

N/A. W8 is covered by website Vitest tests rather than Cucumber BDD scenarios.

## Definition of Done

- [ ] Fresh clone plus install can build without committed generated content.
- [ ] `content:check` fails when generated TypeScript is stale.
- [ ] Website tests fail on broken content references.
- [ ] Normal `npm run build` works without manual preconditions.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Ticket normalized for Phase Execution Step C. Status: `open`.
