---
id: "TASK-282"
title: "Add full local test battery to CI"
type: task
status: done
priority: high
phase: "18"
parent: "FEAT-033"
created: "2026-05-12"
updated: "2026-05-12"
dependencies: ["CHORE-102", "BUG-039"]
tags: [tickets/task, "phase/18", ci, verification, bdd, extension]
aliases: ["TASK-282"]
---

# Add Full Local Test Battery To CI

> [!INFO] `TASK-282` · Task · Phase 18 · Parent: [[FEAT-033]] · Status: `done`

## Description

Extend GitHub Actions CI so the PR gate executes the same full verification
battery used locally during Phase 18/W8 closeout, not only the current root
subset.

## Scope of Change

**Files modified:**

- `.github/workflows/ci.yml` — add jobs or steps for the missing gates.
- `docs/requirements/ci-cd.md` — update CI meter/source if job names change.
- `docs/test/matrix.md` and `docs/test/index.md` — update traceability if new
  workflow verification tests are added.

**Required CI coverage:**

- Root: `bun run lint`, `bun run typecheck`, `bun run format:check`,
  `bun run lint:dependencies`, `bun run lint:docs`, `bun run build`,
  `bun test`, and `bun run bdd`.
- Extension: `npm run compile`, `npm test`, `npm run test:host`,
  `npm run verify:marketplace-assets`, and `npm run verify:package-targets`.
- Website: keep existing `npm run lint`, `npm run typecheck`, `npm test`, and
  `npm run build` coverage.

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `CICD.Workflow.PRGate` | Every PR must pass all required CI checks before merge. | [[requirements/ci-cd]] |
| `CICD.Workflow.BDDGate` | The default BDD gate must execute in CI. | [[requirements/ci-cd]] |
| `Extension.Tests.HostCoverage` | Extension-host behavior must be covered by executable tests. | [[requirements/functional/vscode-extension-parity]] |

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `.github/workflows/ci.yml` | Workflow | `CICD.Workflow.PRGate` | passing in CI |
| `docs/bdd/features/**/*.feature` | BDD | `CICD.Workflow.BDDGate` | passing in CI |
| `extension/src/test/suite/*.js` | Extension host | `Extension.Tests.HostCoverage` | passing in CI |
| `src/test/ci-workflow.test.ts` | Unit | `CICD.Workflow.PRGate`, `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage` | passing |

## Definition of Done

- [x] CI runs `bun run bdd` on pull requests.
- [x] CI runs extension compile, unit, host, marketplace asset, and package
  target verification on pull requests.
- [x] Existing website CI coverage is preserved.
- [x] CI job names are reflected in requirements/test traceability docs.
- [x] PR #65 or successor PR has green CI after the battery is expanded.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-12
> User requested ticket tracking for adding the full local test battery to CI.
> Status: `open`.

> [!FAILURE] Red · 2026-05-12
> Added `src/test/ci-workflow.test.ts` to assert the CI workflow runs the root,
> BDD, extension, and website verification battery. The new test fails because
> `.github/workflows/ci.yml` does not yet include `bun run bdd` or extension
> verification commands.
> Status: `red`.

> [!SUCCESS] Green · 2026-05-12
> Added the `BDD scenarios` and `Extension checks` CI jobs, preserved website
> checks, gated release publishing on the expanded battery, and updated
> CI/CD requirements plus test traceability. `bun test
> src/test/ci-workflow.test.ts` passes.
> Status: `green`.

> [!INFO] In review · 2026-05-12
> Full local battery passed: `bun run lint`, `bun run typecheck`,
> `bun run format:check`, `bun run lint:dependencies`, `bun run lint:docs`,
> `bun run build`, `bun test` (674 tests), `bun run bdd` (149 scenarios, 891
> steps), extension compile/unit/host/marketplace/package-target checks, and
> website lint/typecheck/test/build. Awaiting PR CI evidence.
> Status: `in-review`.

> [!WARNING] CI findings · 2026-05-12
> PR #65 run `25708443397` failed the expanded `Extension checks` and `BDD
> scenarios` jobs. Tracked as [[BUG-040]] and [[BUG-041]] before fixes.
> Status: `in-review`.

> [!SUCCESS] CI findings fixed locally · 2026-05-12
> BUG-040 and BUG-041 fixes are implemented. Targeted checks passed:
> `bun test src/test/ci-workflow.test.ts`, targeted `workspace.feature`
> Cucumber scenario, `bun run build:binary:win`, and extension
> `npm run verify:package-targets`.
> Status: `in-review`.

> [!SUCCESS] CI retry fixes updated · 2026-05-12
> Follow-up fixes staged both Linux and Windows extension server binaries and
> made the BDD watcher precondition use a deterministic startup scan. Rechecked:
> `bun run lint`, `bun run typecheck`, `bun test`, `bun run bdd`,
> `npm run test:host`, and `npm run verify:package-targets`.
> Status: `in-review`.

> [!SUCCESS] Done · 2026-05-12
> PR #65 CI run `25709023741` passed the expanded battery: root checks, BDD
> scenarios, extension checks, website checks, docs lint, dependency policy,
> format, tests, typecheck, and build. BUG-040 and BUG-041 are verified.
> Status: `done`.
