---
id: "CHORE-114"
title: "Phase E17 verification and closeout sweep"
type: chore
status: open
priority: medium
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310", "TASK-311", "TASK-312", "TASK-313", "TASK-314"]
tags: [tickets/chore, "phase/E17", verification]
aliases: ["CHORE-114"]
---

# Phase E17 Verification And Closeout Sweep

## Description

Run the complete extension flavor verification battery, including Marketplace
asset and package-target checks, and close the phase.

## Work Scope

- Run `npm run compile`, `npm test`, `npm run test:host`,
  `npm run verify:marketplace-assets`, and `npm run verify:package-targets`.
- Run root and extension docs lint.
- Confirm `extension/docs/tests/evidence/markdown-flavor-package-targets.md`
  exists or record the exact validation blocker.
- Confirm the stale `ofmarkdown` scan ownership is closed: E16 ledger for
  activation/contribution/Marketplace and E17 ledger for host proof.
- Update feature ticket and phase workflow logs.

## Definition of Done

- [ ] E17 verification commands pass: `npm run compile`, `npm test`,
      `npm run test:host`, `npm run verify:marketplace-assets`, and
      `npm run verify:package-targets`.
- [ ] Matrices and validation docs are current.
- [ ] Package-target evidence is linked from validation docs/matrices.
- [ ] Stale `ofmarkdown` scan ownership is closed or has explicit unresolved
      blockers.
- [ ] Phase is ready for review.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
