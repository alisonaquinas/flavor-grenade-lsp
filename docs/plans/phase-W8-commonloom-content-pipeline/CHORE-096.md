---
id: "CHORE-096"
title: "Phase W8 lint sweep"
type: chore
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["TASK-267", "TASK-268", "TASK-269", "TASK-270", "TASK-271", "TASK-272", "TASK-273", "TASK-274", "TASK-275", "TASK-276"]
tags: [tickets/chore, "phase/W8", website, lint]
aliases: ["CHORE-096"]
---

# Phase W8 Lint Sweep

> [!INFO] `CHORE-096` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Run the Step E lint sweep for W8 after all implementation tasks reach `done`.

## Scope of Change

- `website/src/content/pipeline/**`
- `website/src/content/*.manifest.ts`
- `website/scripts/content/**`
- `website/tests/**`
- `website/package.json`
- `website/eslint.config.js`
- repository docs touched by W8

## Acceptance Criteria

- [ ] `cd website && npm run lint` passes.
- [ ] `cd website && npm run typecheck` passes.
- [ ] Any lint issue that changes behavior is ticketed before fixing.
- [ ] The workflow log records command evidence.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Chore added for required Phase Execution Step E.
