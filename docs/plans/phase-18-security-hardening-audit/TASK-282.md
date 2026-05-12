---
id: "TASK-282"
title: "Add full local test battery to CI"
type: task
status: red
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

> [!INFO] `TASK-282` · Task · Phase 18 · Parent: [[FEAT-033]] · Status: `red`

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
| `.github/workflows/ci.yml` | Workflow | `CICD.Workflow.PRGate` | pending |
| `docs/bdd/features/**/*.feature` | BDD | `CICD.Workflow.BDDGate` | pending in CI |
| `extension/src/test/suite/*.js` | Extension host | `Extension.Tests.HostCoverage` | pending in CI |
| `src/test/ci-workflow.test.ts` | Unit | `CICD.Workflow.PRGate`, `CICD.Workflow.BDDGate`, `Extension.Tests.HostCoverage` | failing as expected |

## Definition of Done

- [ ] CI runs `bun run bdd` on pull requests.
- [ ] CI runs extension compile, unit, host, marketplace asset, and package
  target verification on pull requests.
- [ ] Existing website CI coverage is preserved.
- [ ] CI job names are reflected in requirements/test traceability docs.
- [ ] PR #65 or successor PR has green CI after the battery is expanded.

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
