---
id: "CHORE-109"
title: "Phase E15 extension trace and docs sweep"
type: chore
status: green
priority: medium
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045"]
tags: [tickets/chore, "phase/E15", operations]
aliases: ["CHORE-109"]
---

# Phase E15 Extension Trace And Docs Sweep

## Description

Keep extension docs and traceability synchronized while selector/settings work
lands.

## Work Scope

- Update extension-local tests index and matrix.
- Update root test docs if new files are introduced.
- Record any protocol choice for server propagation.
- Record the final resource-aware server propagation payload shape and link it
  to Phase 20.
- Record the `.flavor-grenade.toml` ownership decision: extension consumes
  marker/project-config evidence; BC4/server owns authoritative TOML parsing
  unless a shared parser/contract is introduced.

## Definition of Done

- [x] Docs trace new extension unit tests.
- [x] Phase plan reflects final protocol choice.
- [x] Selector/schema/profile compatibility trace is linked from E15 docs.
- [x] No completed roadmap phases are modified.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Green - 2026-05-13
> Extension test index, matrix, unit spec, integration spec, and settings-scope
> evidence now trace E15 selector/schema/profile compatibility and
> `workspace/didChangeConfiguration` payload shape.
> Status: `green`.
