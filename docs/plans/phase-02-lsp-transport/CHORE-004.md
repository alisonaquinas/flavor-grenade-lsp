---
id: "CHORE-004"
title: "Phase 2 Lint Sweep"
type: chore
status: open
priority: high
phase: 2
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-017", "TASK-018", "TASK-019", "TASK-020", "TASK-021", "TASK-022", "TASK-023", "TASK-024", "TASK-025", "TASK-026", "TASK-027", "TASK-028", "TASK-029"]
tags: [tickets/chore, "phase/2"]
aliases: ["CHORE-004"]
---

# Phase 2 Lint Sweep

> [!INFO] `CHORE-004` · Chore · Phase 2 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run `bun run lint --max-warnings 0` across all Phase 2 source files and resolve every warning and error introduced during the phase. This sweep ensures the codebase enters Phase 3 with a clean lint baseline, preventing lint debt from accumulating across phases. The sweep covers all files in `src/transport/`, `src/lsp/`, and their test counterparts.

---

## Motivation

Code-quality requirement: every phase must close with zero lint warnings. Lint debt left unresolved at phase boundaries compounds and becomes harder to attribute to a specific change. This chore is a mandatory gate before the Phase 2 feature ticket can move to `in-review`.

- Motivated by: `Quality.Lint.ZeroWarnings` (code-quality requirement)

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero-warning lint gate per phase | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/transport/*.ts` — lint fixes as needed
- `src/lsp/**/*.ts` — lint fixes as needed
- `tests/**/*.spec.ts` (Phase 2 test files) — lint fixes as needed

**Files created:**

- None expected

**Files deleted:**

- None expected

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | No architectural constraints; lint-only changes |

---

## Dependencies

**Blocked by:**

- All Phase 2 TASK tickets (TASK-017 through TASK-029) must be `done` before lint sweep

**Unblocks:**

- Phase 2 feature ticket [[tickets/FEAT-003]] can transition to `in-review` once all three Phase 2 chores are `done`

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

If lint rules require suppression comments (`// eslint-disable-line`), each suppression must be accompanied by a comment explaining why the suppression is justified.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method, stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: code-quality requirement; blocked by all Phase 2 TASKs done.
