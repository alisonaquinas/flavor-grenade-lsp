---
id: "CHORE-097"
title: "Phase W8 code quality sweep"
type: chore
status: open
priority: high
phase: W8
parent: "FEAT-041"
created: "2026-05-10"
updated: "2026-05-10"
dependencies: ["CHORE-096"]
tags: [tickets/chore, "phase/W8", website, code-quality]
aliases: ["CHORE-097"]
---

# Phase W8 Code Quality Sweep

> [!INFO] `CHORE-097` · Chore · Phase W8 · Parent: [[FEAT-041]] · Status: `open`

## Description

Run the Step F code quality sweep for W8 after the lint sweep passes.

## Scope of Change

- `website/src/content/pipeline/**`
- `website/src/content/*.manifest.ts`
- `website/scripts/content/**`
- generated-content call sites under `website/src/**`
- W8 tests under `website/tests/**`

## Acceptance Criteria

- [ ] Commonloom core has no imports from Svelte, route modules, or Flavor
  Grenade product data.
- [ ] Exported Commonloom and adapter symbols have clear names and comments
  where useful.
- [ ] Functions and modules remain small enough to review.
- [ ] `cd website && npm run typecheck` passes after any fixes.
- [ ] Any issue found during the sweep is ticketed before it is fixed.

## Workflow Log

> [!INFO] Opened · 2026-05-10
> Chore added for required Phase Execution Step F.
