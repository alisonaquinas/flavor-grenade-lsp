---
id: "CHORE-097"
title: "Phase W8 code quality sweep"
type: chore
status: done
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-11"
dependencies: ["CHORE-096"]
tags: [tickets/chore, "phase/W8", website, code-quality]
aliases: ["CHORE-097"]
---

# Phase W8 Code Quality Sweep

> [!INFO] `CHORE-097` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `done`

## Description

Run the Step F code quality sweep for W8 after the lint sweep passes.

## Scope of Change

- `website/src/content/pipeline/**`
- `website/src/content/*.manifest.ts`
- `website/scripts/content/**`
- generated-content call sites under `website/src/**`
- W8 tests under `website/tests/**`

## Acceptance Criteria

- [x] Website adapter code does not recreate local Commonloom source under
  `website/src/content/pipeline/commonloom`.
- [x] Exported adapter symbols have clear names and comments where useful.
- [x] Functions and modules remain small enough to review.
- [x] `cd website && npm run typecheck` passes after any fixes.
- [x] Any issue found during the sweep is ticketed before it is fixed.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Chore added for required Phase Execution Step F.

> [!SUCCESS] Code quality sweep complete · 2026-05-10
> Checked Commonloom imports for Svelte, route modules, wiki modules, page
> modules, and Flavor Grenade product data; no core boundary violations found.
> `npm run typecheck` passed from `website/`. Status: `done`.

> [!INFO] External package update · 2026-05-11
> Future code quality sweeps should check Commonloom package integration and
> website adapter boundaries. They should not require local Commonloom library
> source in this repository.
