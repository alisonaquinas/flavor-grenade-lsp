---
id: "CHORE-007"
title: "Phase 3 Lint Sweep"
type: chore
status: open
priority: high
phase: 3
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-030", "TASK-031", "TASK-032", "TASK-033", "TASK-034", "TASK-035", "TASK-036", "TASK-037", "TASK-038", "TASK-039", "TASK-040", "TASK-041", "TASK-042", "TASK-043", "TASK-044"]
tags: [tickets/chore, "phase/3"]
aliases: ["CHORE-007"]
---

# Phase 3 Lint Sweep

> [!INFO] `CHORE-007` · Chore · Phase 3 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run `bun run lint --max-warnings 0` across all Phase 3 source files and resolve every warning and error introduced during the phase. This sweep covers all files in `src/parser/`, `src/parser/__tests__/`, and the updated handler files in `src/lsp/handlers/`. The sweep ensures the codebase enters Phase 4 with a clean lint baseline.

---

## Motivation

Code-quality requirement: every phase must close with zero lint warnings. Lint debt left unresolved at phase boundaries compounds and becomes harder to attribute to a specific change. This chore is a mandatory gate before the Phase 3 feature ticket can move to `in-review`.

- Motivated by: `Quality.Lint.ZeroWarnings` (code-quality requirement)

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero-warning lint gate per phase | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/parser/**/*.ts` — lint fixes as needed
- `src/lsp/handlers/did-open.handler.ts` — lint fixes for Phase 3 wiring additions
- `src/lsp/handlers/did-change.handler.ts` — lint fixes for Phase 3 wiring additions

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

- All Phase 3 TASK tickets (TASK-030 through TASK-044) must be `done` before lint sweep

**Unblocks:**

- Phase 3 feature ticket [[tickets/FEAT-004]] can transition to `in-review` once all three Phase 3 chores are `done`

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

If lint rules require suppression comments, each must be accompanied by a justification comment.

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
> Chore created. Status: `open`. Motivation: code-quality requirement; blocked by all Phase 3 TASKs done.
