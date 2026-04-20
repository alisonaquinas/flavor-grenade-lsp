---
id: "CHORE-041"
title: "Exclude colocated test files from tsc compilation"
type: chore
status: done
priority: "medium"
phase: "1"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/1"]
aliases: ["CHORE-041"]
---

# Exclude colocated test files from tsc compilation

> [!INFO] `CHORE-041` · Chore · Phase 1 · Priority: `medium` · Status: `open`

> [!NOTE] Discovered during Step F (Code Quality Sweep) of Phase 1. Opened per Rule 5 before any fix applied.

---

## Description

`tsconfig.json` currently excludes `src/test/**/*` but not colocated test files such as `src/lsp/lsp.module.test.ts`. This means `tsc` compiles test files and emits corresponding `.js` files into `dist/`, bloating the build output with test artefacts. Add `**/*.test.ts` and `**/*.spec.ts` glob patterns to the `exclude` array in `tsconfig.json`.

---

## Motivation

- Motivated by: Step F code quality sweep — test files should not be included in the production build output

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Build hygiene; no functional requirement | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `tsconfig.json` — add `"src/**/*.test.ts"` and `"src/**/*.spec.ts"` to `exclude` array

---

## Acceptance Criteria

- [ ] `tsconfig.json` excludes `src/**/*.test.ts` and `src/**/*.spec.ts`
- [ ] `bun run build` still exits 0
- [ ] `bun test` still exits 0 (bun test does not use tsconfig for test discovery)
- [ ] No test artefacts emitted to `dist/`

---

## Workflow Log

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Discovered during Phase 1 Step F code quality sweep. Rule 5 compliance: ticket opened before fix applied.

> [!SUCCESS] Done — 2026-04-17
> Sweep complete. All findings ticketed and resolved. Status: `done`.
