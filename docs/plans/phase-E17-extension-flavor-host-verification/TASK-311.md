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
- Ensure `npm test` runs `extension/src/markdown-flavor.test.ts`.
- Ensure `npm run test:host` runs
  `extension/src/test/suite/markdown-flavor.test.js`.
- Keep package and marketplace verification commands active.
- Enforce the host-test gate rule: CI must run host tests, or a CI detector must
  fail when required host evidence/blocker metadata is missing.
- Keep marketplace selector proof explicitly cross-linked to
  `docs/plans/phase-E16-flavor-scoped-contributions-marketplace/TASK-309.md`,
  where `extension/test/marketplace/readme-assets.test.ts` and
  `extension/test/marketplace/vsix-assets.test.ts` are updated for selector
  proof.
- Keep `bun run lint:docs` covering `extension/docs/**/*.md`.
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
- [ ] CI verification either runs host tests or fails without documented host
      flavor evidence and blocker metadata.
- [ ] CI verification detects missing marketplace selector-proof handoff.
- [ ] CI verification detects missing extension docs lint coverage.
- [ ] CI verification detects missing root flavor BDD/spec wiring and missing
      extension host flavor wiring.
- [ ] Extension verification spec rows are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
