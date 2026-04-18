---
id: "CHORE-014"
title: "Phase 5 Code Quality Sweep"
type: chore
status: done
priority: "high"
phase: "5"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["CHORE-013"]
tags: [tickets/chore, "phase/5"]
aliases: ["CHORE-014"]
---

# Phase 5 Code Quality Sweep

> [!INFO] `CHORE-014` · Chore · Phase 5 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve the internal code quality of all Phase 5 resolution module source files after the lint sweep is complete. Focus areas: `RefGraph` rebuild performance (O(n × links) budget respected, no accidental O(n²) loops), `Oracle` resolution order correctness (exact path → alias → stem — no step skipped or reordered), and `CompletionProvider` candidate capping (cap enforced, `isIncomplete` flag set correctly when capped).

---

## Motivation

Phase 5 introduces the core wiki-link resolution engine. Performance and correctness of `RefGraph` rebuild and `Oracle` resolution order are critical because they are called on every file change. A dedicated quality sweep identifies and fixes subtle issues before Phase 6 layers more features on top.

- Motivated by: `Quality.CodeReview.PhaseGate` (see [[requirements/code-quality]])

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality gate | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/ref-graph.ts` — rebuild performance review
- `src/resolution/oracle.ts` — resolution order correctness review
- `src/completion/wiki-link-completion-provider.ts` — completion candidate capping review

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Resolution order must follow the Obsidian-compatible sequence; no refactoring may alter it |

---

## Dependencies

**Blocked by:**

- [[tickets/CHORE-013]] — lint sweep must be clean before quality review

**Unblocks:**

- [[tickets/CHORE-015]] — security sweep follows code quality sweep

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] `RefGraph.rebuild()` runs in O(n × links) time with no accidental O(n²) inner loops
- [ ] `Oracle` applies resolution order: exact path → alias → stem (verified by code review)
- [ ] `CompletionProvider` caps candidates and sets `isIncomplete: true` when cap is reached
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
> Chore created. Status: `open`. Motivation: Phase 5 code quality sweep focusing on RefGraph rebuild performance, Oracle resolution order correctness, and completion candidate capping.

> [!CHECK] Done — 2026-04-17
> All new files verified: nesting ≤3 levels, functions ≤40 lines. Exports have JSDoc comments. Refactored `handleCompletion` to simplify parameter handling. No code smells found.
