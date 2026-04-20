---
id: "CHORE-002"
title: "Phase 1 Code Quality Sweep"
type: chore
# status: open | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "1"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["CHORE-001"]
tags: [tickets/chore, "phase/1"]
aliases: ["CHORE-002"]
---

# Phase 1 Code Quality Sweep

> [!INFO] `CHORE-002` · Chore · Phase 1 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all new `src/` files introduced during Phase 1 for naming consistency, module boundary violations, and code smells. Specifically check for: deep nesting (more than 3 levels of indentation), functions longer than 40 lines, magic numbers (numeric literals not assigned to named constants), and naming inconsistencies relative to `[[ddd/ubiquitous-language]]`. For each issue found, either fix it in-place (if the fix is a pure refactor with no behaviour change) or open a new BUG or CHORE ticket describing the issue and the required fix.

---

## Motivation

Phase 1 skeleton code is intentionally minimal, but patterns established in the scaffold (naming, structure, nesting) become templates for all subsequent phases. Catching and correcting quality issues at this stage prevents technical debt from propagating into Phase 2 and beyond.

- Motivated by: [[requirements/code-quality]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code quality requirements to be authored in Phase 0; this sweep enforces them retroactively on Phase 1 output | [[requirements/code-quality]] |

---

## Scope of Change

> List every file or directory that will be modified, created, or deleted.

**Files modified:**

- `src/main.ts` — review for code smells; refactor in-place if found
- `src/lsp/lsp.module.ts` — review for naming and module boundary issues
- Any other `src/**/*.ts` file introduced during Phase 1

**Files created:**

- BUG/CHORE tickets (in `docs/plans/phase-01-scaffold/`) for any issues that cannot be fixed in-place without risk

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR001-stdio-transport]] | Module boundaries must respect the layering defined in [[architecture/overview]]; `src/lsp/` must not directly import from `src/vault/` or `src/parser/` at this phase |

---

## Dependencies

**Blocked by:**

- [[CHORE-001]] — Lint must be clean before code quality review begins; lint warnings can mask real code smells.

**Unblocks:**

- [[CHORE-003]] — Security sweep follows code quality sweep.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] All `src/` files reviewed against code smell checklist (nesting > 3, function length > 40 lines, magic numbers, naming)
- [ ] All fixable issues resolved in-place with no behaviour changes
- [ ] All non-fixable issues have corresponding BUG or CHORE tickets opened with full descriptions
- [ ] `bun run lint --max-warnings 0` still passes after any in-place fixes
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

At Phase 1, the `src/` codebase is minimal (two files: `main.ts` and `lsp/lsp.module.ts`). This sweep is expected to be fast. Its main value is establishing the review habit and the ticket-creation pattern for future phases with larger codebases.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant: [[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Chore created. Status: `open`. Motivation: [[requirements/code-quality]]. Blocked until CHORE-001 (Lint Sweep) is done.

> [!SUCCESS] Done — 2026-04-17
> Sweep complete. All findings ticketed and resolved. Status: `done`.
