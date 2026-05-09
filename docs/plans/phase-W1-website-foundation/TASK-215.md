---
id: "TASK-215"
title: "Configure website quality gates"
type: task
status: in-review
priority: high
phase: W1
parent: "FEAT-034"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["TASK-214"]
tags: [tickets/task, "phase/W1", website, quality]
aliases: ["TASK-215"]
---

# Configure Website Quality Gates

> [!INFO] `TASK-215` · Task · Phase W1 · Parent: [[FEAT-034]] · Status: `in-review`

## Description

Add website lint, typecheck, test, build, preview, and dev scripts with strict
TypeScript and zero-warning lint behavior.

## Scope of Change

**Files created or modified:**

- `website/package.json`
- `website/tsconfig.json`
- website lint configuration
- website test configuration
- `website/tests/**`

## Implementation Details

Create website-local quality tooling:

- `website/eslint.config.js`
- `website/vitest.config.ts`
- `website/tests/app-shell.test.ts`
- `website/tests/tooling.test.ts`

`website/package.json` must expose:

- `dev`: `vite`
- `build`: `svelte-check --tsconfig ./tsconfig.json && tsc --project
  tsconfig.node.json && vite build`
- `preview`: `vite preview`
- `lint`: ESLint with zero warnings over `src`, `tests`, and config files
- `typecheck`: `svelte-check --tsconfig ./tsconfig.json` plus Node/config
  TypeScript checks
- `test`: Vitest run mode

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `website/tests/tooling.test.ts` | Unit | `Website.Technical.SourceLayout` | ✅ passing |

## Definition of Done

- [x] `npm run lint` fails on warnings.
- [x] `npm run typecheck` runs strict TypeScript checks.
- [x] `npm test` runs website tests from `website/tests`.
- [x] `npm run build` produces static output.
- [x] One smoke test proves the test runner is wired.
- [x] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.

> [!INFO] Step C details added · 2026-05-09
> Concrete scripts, config files, and test targets were recorded before
> implementation.

> [!WARNING] Red · 2026-05-09
> Added a tooling contract test that requires the website ESLint flat config
> before that config exists. Status: `red`.

> [!SUCCESS] Green · 2026-05-09
> Added the website ESLint flat config and verified the tooling contract test
> passes. Status: `green`.

> [!INFO] In review · 2026-05-09
> Test index and matrix traceability were updated for
> `website/tests/tooling.test.ts`. Definition of Done is satisfied locally.
> Status: `in-review`.
