---
id: "FEAT-034"
title: "Website Foundation And Toolchain"
type: feature
status: in-progress
priority: high
phase: W1
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-032"]
tags: [tickets/feature, "phase/W1", website]
aliases: ["FEAT-034"]
---

# Website Foundation And Toolchain

> [!INFO] `FEAT-034` · Feature · Phase W1 · Priority: `high` · Status: `in-progress`

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
- [ ] `cd website && npm run lint` passes.
- [ ] `cd website && npm run typecheck` passes.
- [ ] `cd website && npm test` passes.
- [ ] `cd website && npm run build` produces static output.
- [ ] `bun run lint:docs` passes.

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-214]] | Scaffold Vite Svelte website app | `red` |
| [[TASK-215]] | Configure website quality gates | `red` |
| [[TASK-216]] | Establish source and test layout guards | `open` |
| [[CHORE-087]] | Phase W1 documentation and verification sweep | `open` |

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
