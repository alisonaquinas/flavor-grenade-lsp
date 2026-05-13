---
id: "TASK-297"
title: "Add flavor verification gate checks"
type: task
status: open
priority: medium
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-295", "TASK-296"]
tags: [tickets/task, "phase/21", verification]
aliases: ["TASK-297"]
---

# Add Flavor Verification Gate Checks

## Description

Ensure CI/local verification checks fail when flavor BDD or flavor test layers
are removed.

## Work Scope

- Update `src/test/ci-workflow.test.ts` or equivalent checks.
- Verify Cucumber config includes the flavor feature files.
- Add file-presence checks for root flavor unit/integration specs where useful.
- Cross-link extension host flavor suite protection through Phase E17/TASK-311
  so `GAP-S-010` covers root unit, integration, BDD, and extension host
  coverage without duplicating host implementation in Phase 21.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `CICD.Workflow.BDDGate` | `GAP-S-010` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/ci-workflow.test.ts` | Flavor test gates are wired into CI. |

## Definition of Done

- [ ] CI verification checks include flavor feature files.
- [ ] Local checks fail on missing flavor test wiring.
- [ ] Phase E17/TASK-311 is linked as the extension host gate for `GAP-S-010`.
- [ ] Verification spec rows are updated.
