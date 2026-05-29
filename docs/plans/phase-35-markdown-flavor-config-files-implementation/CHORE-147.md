---
id: "CHORE-147"
title: "Phase 35 security and confinement sweep"
type: chore
status: open
priority: high
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-355", "TASK-356", "TASK-359"]
tags: [tickets/chore, "phase/35", security, confinement]
aliases: ["CHORE-147"]
---

# Phase 35 Security And Confinement Sweep

## Work Scope

- Review every config-file read and write for realpath confinement.
- Confirm invalid config contents do not leak user file content into logs.
- Confirm extension writes cannot target paths outside the active file's
  directory.
- Confirm unsupported schemes, virtual workspaces, restricted mode, and
  untrusted contexts are inactive.

## Definition of Done

- [ ] Path-confinement tests cover config-file read candidates.
- [ ] Extension write tests cover unsafe resource rejection.
- [ ] Security-sensitive errors avoid absolute path and content leakage.
- [ ] No new dependency is added without documented rationale.
