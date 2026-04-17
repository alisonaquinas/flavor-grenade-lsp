---
id: "CHORE-010"
title: "Phase 4 Lint Sweep"
type: chore
status: done
priority: "high"
phase: "4"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-054"]
tags: [tickets/chore, "phase/4"]
aliases: ["CHORE-010"]
---

# Phase 4 Lint Sweep

> [!INFO] `CHORE-010` · Chore · Phase 4 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run `bun run lint --max-warnings 0` across all new Phase 4 source files (`src/vault/`) and resolve every linting warning or error introduced by the phase. No new lint suppressions (`// eslint-disable`) may be added without documented justification in this ticket. This sweep ensures the vault module enters the codebase at zero lint debt.

---

## Motivation

Phase 4 introduces multiple new source files. The lint sweep consolidates all linting fixes into a single atomic commit after all TASK tickets are complete, rather than scattering lint fixes across implementation commits.

- Motivated by: `Quality.Lint.ZeroWarnings` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Lint zero-warning gate | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/vault/*.ts` — lint fixes as needed; no behaviour changes

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR013-vault-root-confinement]] | Lint rules must not suppress path-safety checks |

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-054]] — all Phase 4 implementation tasks must be complete before the lint sweep

**Unblocks:**

- [[tickets/CHORE-011]] — code quality sweep proceeds after lint is clean

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Identified; no work started | Verify scope list; confirm no behaviour-affecting files; confirm no blockers |
| `in-progress` | Work underway within declared scope | Stay in scope; run `bun test` periodically; if scope grows, update list and log |
| `blocked` | Dependency unresolved | Append `[!WARNING]` with named blocker |
| `in-review` | Changes done; lint+type+test pass | Verify Acceptance Criteria; confirm no `src/` behaviour changes; update matrix/index if needed |
| `done` | CI green; no regressions | Append `[!CHECK]` with evidence |
| `cancelled` | No longer needed | Append `[!CAUTION]`; revert uncommitted partial changes if needed |

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: Phase 4 lint sweep to reach zero-warning gate.

> [!CHECK] Done — 2026-04-17
> `bun run lint --max-warnings 0` passes with 0 warnings (1 unused-import error found and fixed in initialized.handler.ts). `tsc --noEmit` exits 0. All 150 unit tests pass. No behaviour-affecting changes. Status: `done`.
