---
id: "TASK-226"
title: "Add website CI gates"
type: task
status: open
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

> [!INFO] `TASK-226` · Task · Phase W5 · Parent: [[FEAT-038]] · Status: `open`

## Description

Add repository CI jobs that run website install, lint, typecheck, tests, build,
and metadata verification on pull requests and protected branch pushes.

## Definition of Done

- [ ] PRs to `develop` and `main` run website checks.
- [ ] Pushes to `develop` and `main` run website checks.
- [ ] Website checks use locked dependencies.
- [ ] Website lint fails on warnings.
- [ ] Website build artifact is uploaded when useful for inspection.
- [ ] Parent feature child row is updated.

## Lifecycle

Full state machine: [[templates/tickets/lifecycle/task-lifecycle]]

## Workflow Log

> [!INFO] Opened · 2026-05-09
> Ticket created. Status: `open`.
