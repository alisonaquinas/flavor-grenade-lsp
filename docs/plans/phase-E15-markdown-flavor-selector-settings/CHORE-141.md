---
id: "CHORE-141"
title: "Refactor E15 markdown flavor helpers under function-size guideline"
type: chore
status: done
priority: medium
phase: E15
parent: "FEAT-045"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045"]
tags: [tickets/chore, "phase/E15", code-quality]
aliases: ["CHORE-141"]
---

# Refactor E15 Markdown Flavor Helpers Under Function-Size Guideline

## Description

Step F code-quality sweep found new helper functions in
`extension/src/markdown-flavor.ts` that exceed the phase checklist's 40-line
function guideline.

## Scope

- Split flavor resolution and configuration-notification construction into
  smaller pure helpers.
- Preserve the existing E15 selector, persistence, and propagation behavior.
- Re-run extension unit tests and compile after the refactor.

## Definition of Done

- [x] New helper functions stay under the checklist guideline.
- [x] `npm test` passes from `extension/`.
- [x] `npm run compile` passes from `extension/`.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Opened during Step F before refactoring the oversized helper functions.

> [!SUCCESS] Done - 2026-05-13
> Split flavor resolution and propagation payload assembly into smaller pure
> helpers. `npm test` and `npm run compile` pass from `extension/`.
