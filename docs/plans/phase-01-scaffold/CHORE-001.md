---
id: "CHORE-001"
title: "Phase 1 Lint Sweep"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "1"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-002", "TASK-003", "TASK-004", "TASK-005", "TASK-006", "TASK-007", "TASK-008", "TASK-009", "TASK-010", "TASK-011", "TASK-012", "TASK-013", "TASK-014", "TASK-015", "TASK-016"]
tags: [tickets/chore, "phase/1"]
aliases: ["CHORE-001"]
---

# Phase 1 Lint Sweep

> [!INFO] `CHORE-001` · Chore · Phase 1 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run `bun run lint --max-warnings 0` across all `src/` files after all Phase 1 TASK tickets are complete and fix every ESLint warning and error until the command exits 0. This sweep is the first quality gate pass on the Phase 1 source code. No new lint suppressions (`// eslint-disable`) may be added — every warning must be resolved by fixing the underlying code. At the end of this chore, `bun run lint --max-warnings 0` must exit 0 with no suppression comments.

---

## Motivation

The Phase 1 skeleton files (`src/main.ts`, `src/lsp/lsp.module.ts`) may trigger ESLint warnings on initial creation due to decorators, unused imports, or return-type inference gaps. This chore cleans those up before Phase 2 begins, so that the zero-warnings invariant is established as a baseline from the very first source commit.

- Motivated by: [[requirements/code-quality]] `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Quality.Lint.ZeroWarnings` | ESLint must exit 0 with `--max-warnings 0` on all `src/` files | [[requirements/code-quality]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted.

**Files modified:**

- `src/main.ts` — fix any lint warnings (return types, unused imports, etc.)
- `src/lsp/lsp.module.ts` — fix any lint warnings (decorator usage, empty arrays, etc.)
- Any other `src/**/*.ts` file introduced during Phase 1 that has lint issues

**Files created:**

- None (lint fixes are in-place modifications only)

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR001-stdio-transport]] | No `any` types may be introduced; all ESLint errors must be fixed, not suppressed |

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-002]] through [[tickets/TASK-016]] — all Phase 1 TASK tickets must be done before the lint sweep can run against the complete codebase.

**Unblocks:**

- [[tickets/CHORE-002]] — Code quality sweep runs after lint is clean.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` exits 0 with no output
- [ ] No `// eslint-disable` or `// eslint-disable-next-line` comments exist in any `src/` file
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

If a lint issue in Phase 1 skeleton code cannot be fixed without changing the architecture (e.g., a NestJS decorator pattern that requires `any`), open a SPIKE ticket to investigate the correct approach rather than suppressing the warning.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: [[requirements/code-quality]] `Quality.Lint.ZeroWarnings`. Blocked until TASK-002 through TASK-016 are all done.

> [!CHECK] Done — 2026-04-17
> Sweep complete. All findings ticketed and resolved. Status: `done`.
