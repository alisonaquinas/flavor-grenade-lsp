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

Run the complete extension flavor verification battery and close the phase.

## Work Scope

- Run `npm test`, `npm run test:host`, and `npm run compile`.
- Run root and extension docs lint.
- Update feature ticket and phase workflow logs.

## Definition of Done

- [ ] E17 verification commands pass.
- [ ] Matrices and validation docs are current.
- [ ] Phase is ready for review.
