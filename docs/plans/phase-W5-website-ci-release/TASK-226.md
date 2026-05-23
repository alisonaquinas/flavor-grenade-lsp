---
id: "TASK-226"
title: "Add website CI gates"
type: task
status: done
priority: high
phase: W5
parent: "FEAT-038"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-037"]
tags: [tickets/task, "phase/W5", website, ci]
aliases: ["TASK-226"]
---

# Add Website CI Gates

> [!INFO] `TASK-226` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `done`

## Description

Add repository CI jobs that run website install, lint, typecheck, tests, build,
and metadata verification on pull requests and protected branch pushes.

## Implementation Details

Create and wire:

- `.github/workflows/ci.yml`
- `website/tests/ci-workflow.test.ts`

Expected workflow shape:

- `website-checks` job runs on existing PR, branch, and tag triggers.
- Job uses locked website dependencies with `npm ci`.
- Job runs website lint, typecheck, tests, and build from `website/`.
- Job uploads `website/dist/` as `website-dist` for inspection.

## Definition of Done

- [x] PRs to `develop` and `main` run website checks.
- [x] Pushes to `develop` and `main` run website checks.
- [x] Website checks use locked dependencies.
- [x] Website lint fails on warnings.
- [x] Website build artifact is uploaded when useful for inspection.
- [x] Parent feature child row is updated.

## Linked Tests

| Test | Status | Requirement |
|---|---|---|
| `website/tests/ci-workflow.test.ts` | ✅ passing | `Website.CICD.PRGate` |

## Lifecycle

Full state machine: [[docs/templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!WARNING] Red · 2026-05-09
> Added `website/tests/ci-workflow.test.ts`, which expects a website CI job
> before it exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added the `website-checks` CI job with `npm ci`, lint, typecheck, tests,
> build, and `website-dist` artifact upload. Status: `green`.

> [!INFO] In Review · 2026-05-09
> Updated DoD and test traceability after local website lint, typecheck, and
> tests passed. Status: `in-review`.

> [!CHECK] Done · 2026-05-09
> PR #55 CI passed, including Website checks. Status: `done`.
