---
id: "CHORE-035"
title: "Phase 12 Code Quality Sweep"
type: chore
status: open
priority: medium
phase: 12
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/12"]
aliases: ["CHORE-035"]
---

# Phase 12 Code Quality Sweep

> [!INFO] `CHORE-035` · Chore · Phase 12 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review and improve internal code quality across all Phase 12 implementation files without altering observable LSP behaviour. Focus areas: exhaustiveness of the codeAction dispatcher switch statement, correctness of semantic token delta encoding, and quality of workspace symbol fuzzy match ranking.

---

## Motivation

Code quality review after feature implementation catches logical gaps and structural weaknesses before they become bugs in later phases.

- Motivated by: `Quality.CodeReview.PostPhase`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Post-phase code quality and structural soundness | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/code-action.handler.ts` — verify switch exhaustiveness for all diagnostic codes
- `src/handlers/semantic-tokens.handler.ts` — verify delta encoding integer array correctness
- `src/handlers/workspace-symbol.handler.ts` — assess and improve fuzzy match ranking quality

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | No behaviour-affecting changes permitted |

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/` (if any sneak in, convert to TASK ticket)
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed
- [ ] codeAction dispatcher switch covers all seven FG diagnostic codes exhaustively
- [ ] Semantic token delta encoding verified against at least one multi-token integration test
- [ ] Workspace symbol fuzzy match ranking documented in code comments

---

## Notes

Run after CHORE-034 (Lint Sweep) is complete. Focus: correctness, not performance. If performance issues are found, open a separate TASK ticket.

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
> Chore created. Status: `open`. Motivation: post-Phase-12 code quality sweep focusing on dispatcher exhaustiveness, semantic token delta encoding, and workspace symbol fuzzy match quality.
