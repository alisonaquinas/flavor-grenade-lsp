---
id: "TASK-311"
title: "Wire extension flavor tests into local and CI gates"
type: task
status: open
priority: high
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310"]
tags: [tickets/task, "phase/E17", ci, markdown-flavor]
aliases: ["TASK-311"]
---

# Wire Extension Flavor Tests Into Local And CI Gates

## Description

Ensure extension flavor unit, host, marketplace, compile, and CI checks are
wired into verification.

## Work Scope

- Update CI workflow tests if needed.
- Ensure `npm test` runs `markdown-flavor.test.ts`.
- Ensure `npm run test:host` runs `markdown-flavor.test.js`.
- Keep package and marketplace verification commands active.
- Cross-link server-side `GAP-S-010` so CI protection covers the root unit,
  integration, BDD, and extension host flavor suites together.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Tests.HostCoverage` | `GAP-E-013` |
| `CICD.Workflow.BDDGate` | `GAP-S-010` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/test/ci-workflow.test.ts` | CI includes extension flavor commands. |

## Definition of Done

- [ ] Local extension commands include flavor tests.
- [ ] CI verification detects missing host flavor suite.
- [ ] CI verification detects missing root flavor BDD/spec wiring and missing
      extension host flavor wiring.
- [ ] Extension verification spec rows are updated.
