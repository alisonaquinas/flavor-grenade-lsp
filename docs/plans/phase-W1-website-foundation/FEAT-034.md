---
id: "FEAT-034"
title: "Website Foundation And Toolchain"
type: feature
status: in-review
priority: high
phase: W1
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-032"]
tags: [tickets/feature, "phase/W1", website]
aliases: ["FEAT-034"]
---

# Website Foundation And Toolchain

> [!INFO] `FEAT-034` · Feature · Phase W1 · Priority: `high` · Status: `in-review`

## Goal

Contributors can work on the public website in an isolated `website/`
application with a Vite/Svelte toolchain, strict TypeScript, SCSS, tests, and
repeatable local gates.

## Scope

**In scope:**

- `website/package.json` scripts for development, build, preview, lint,
  typecheck, and test.
- Svelte and Vite configuration.
- TypeScript strict mode and linting for website source.
- SCSS entry points and starter tokens.
- `website/src` and `website/tests` source boundaries.

**Out of scope:**

- Final homepage content.
- Generated public docs pipeline.
- GitHub Pages deployment.

## Linked Requirements

| Requirement | Gist | Source |
|---|---|---|
| `Website.Technical.Stack` | Use Vite, Svelte, TypeScript, SCSS, and GitHub Pages | [[../../../website/docs/requirements/technical/index]] |
| `Website.Technical.SourceLayout` | Keep source in `website/src` and tests in `website/tests` | [[../../../website/docs/requirements/technical/source-layout-and-documentation]] |

## Phase Plan Reference

- Phase plan: [[plans/phase-W1-website-foundation]]
- Execution ledger row: [[plans/execution-ledger]]

## Acceptance Criteria

- [ ] All child tasks are `done`.
- [x] `cd website && npm run lint` passes.
- [x] `cd website && npm run typecheck` passes.
- [x] `cd website && npm test` passes.
- [x] `cd website && npm run build` produces static output.
- [x] `bun run lint:docs` passes.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-214]] | Scaffold Vite Svelte website app | `in-review` |
| [[TASK-215]] | Configure website quality gates | `in-review` |
| [[TASK-216]] | Establish source and test layout guards | `in-review` |
| [[CHORE-087]] | Phase W1 documentation and verification sweep | `in-review` |

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` -> `ready` -> `in-progress` -> `in-review` -> `done`

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created for Phase W1 website foundation. Status: `ready`.

> [!NOTE] Dependency correction · 2026-05-09
> Step A removed the Phase 18 dependency from W1. The website scaffold phase is
> docs/site tooling only and is not blocked by the server security hardening
> audit. Phase E14 remains the completed extension baseline dependency.

> [!INFO] Started · 2026-05-09
> TASK-214 entered `red` with a failing app-shell smoke test. Status:
> `in-progress`.

> [!NOTE] TASK-216 refactor · 2026-05-09
> TASK-216 entered `refactor` to add exported-helper documentation before the
> Phase W1 review sweep.

> [!SUCCESS] TASK-216 refactor complete · 2026-05-09
> TASK-216 returned to `green` after adding layout-guard helper documentation.

> [!INFO] Implementation tasks in review · 2026-05-09
> TASK-214, TASK-215, and TASK-216 moved to `in-review` after updating the
> website test index and requirements matrix entries.

> [!INFO] Verification sweep started · 2026-05-09
> CHORE-087 entered `in-progress` to run Phase W1 local gates and record Step
> E-L evidence.

> [!SUCCESS] Ready for PR · 2026-05-09
> Phase W1 local gates passed. Steps J, K, and validation-folder checks were
> N/A because `tests/integration`, `tests/verification`, and `tests/validation`
> do not contain phase-specific test files; BDD `@smoke` passed. Status:
> `in-review`.

## Retrospective

> Written after Step L passes. Date: 2026-05-09.

### What went as planned

The Vite/Svelte/TypeScript/SCSS scaffold fit the Phase W1 scope cleanly, and
the RED/GREEN commits gave quick evidence for the app shell, tooling contract,
and source-layout guard.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| None | — | No Step E-L defects were found. | 0 h |

The only process adjustment was correcting the W1 dependency to Phase E14
because the server security audit is an independent track and not a blocker for
website scaffolding.

### Process observations

Website-specific tests needed explicit entries in the repository test index and
matrix because those docs originally described `tests/` and extension tests more
than package-local suites.

### Carry-forward actions

- [ ] Keep W2 tests under `website/tests` and update the matrix in the same
  ticket-status commit when adding content-pipeline coverage.

### Rule / template amendments

- [ ] None.
