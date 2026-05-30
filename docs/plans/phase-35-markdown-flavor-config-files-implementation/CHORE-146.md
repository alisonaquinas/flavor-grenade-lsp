---
id: "CHORE-146"
title: "Phase 35 trace and matrix sweep"
type: chore
status: open
priority: medium
phase: 35
parent: "FEAT-061"
created: "2026-05-29"
updated: "2026-05-29"
dependencies: ["TASK-360"]
tags: [tickets/chore, "phase/35", docs, traceability]
aliases: ["CHORE-146"]
---

# Phase 35 Trace And Matrix Sweep

## Work Scope

- Update requirement, test, and evidence matrices after implementation tests
  exist.
- Remove stale claims that legacy config paths configure file/directory flavor.
- Confirm planned rows become implemented only when backed by passing tests.

## Definition of Done

- [ ] `docs/test/matrix.md` matches implemented behavior.
- [ ] `docs/test/index.md` names real test evidence.
- [ ] `extension/docs/tests/matrix.md` matches extension evidence.
- [ ] No stale legacy flavor-assignment docs remain.
