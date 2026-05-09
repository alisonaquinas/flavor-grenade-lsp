---
id: "TASK-215"
title: "Configure website quality gates"
type: task
status: open
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

> [!INFO] `TASK-215` · Task · Phase W1 · Parent: [[FEAT-034]] · Status: `open`

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

## Definition of Done

- [ ] `npm run lint` fails on warnings.
- [ ] `npm run typecheck` runs strict TypeScript checks.
- [ ] `npm test` runs website tests from `website/tests`.
- [ ] `npm run build` produces static output.
- [ ] One smoke test proves the test runner is wired.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.
