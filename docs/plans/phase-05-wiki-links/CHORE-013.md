---
id: "CHORE-013"
title: "Phase 5 Lint Sweep"
type: chore
status: done
priority: "high"
phase: "5"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-066"]
tags: [tickets/chore, "phase/5"]
aliases: ["CHORE-013"]
---

# Phase 5 Lint Sweep

> [!INFO] `CHORE-013` · Chore · Phase 5 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run `bun run lint --max-warnings 0` across all new Phase 5 source files (`src/resolution/`, `src/diagnostics/`, `src/handlers/`, `src/completion/`) and resolve every linting warning or error introduced by the phase. No new lint suppressions may be added without documented justification in this ticket. This sweep ensures all wiki-link resolution modules enter the codebase at zero lint debt.

---

## Motivation

Phase 5 introduces the largest surface area of new source files in the project so far. The lint sweep consolidates all linting fixes into a single atomic commit after all TASK tickets are complete, rather than scattering lint fixes across implementation commits.

- Motivated by: `Quality.Lint.ZeroWarnings` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Lint zero-warning gate | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/*.ts` — lint fixes as needed; no behaviour changes
- `src/diagnostics/*.ts` — lint fixes as needed; no behaviour changes
- `src/handlers/*.ts` — lint fixes as needed; no behaviour changes
- `src/completion/*.ts` — lint fixes as needed; no behaviour changes

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Lint rules must not suppress resolution-correctness checks |

---

## Dependencies

**Blocked by:**

- [[TASK-066]] — all Phase 5 implementation tasks must be complete before the lint sweep

**Unblocks:**

- [[CHORE-014]] — code quality sweep proceeds after lint is clean

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
> Chore created. Status: `open`. Motivation: Phase 5 lint sweep to reach zero-warning gate.

> [!SUCCESS] Done — 2026-04-17
> `bun run lint --max-warnings 0` passes. `tsc --noEmit` exits 0. 193 unit + 6 integration tests pass. No new lint suppressions added. Fixed one `eslint-disable` comment that was redundant in integration test file.
