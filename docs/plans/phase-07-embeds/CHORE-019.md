---
id: "CHORE-019"
title: "Phase 7 Lint Sweep"
type: chore
status: done
priority: normal
phase: 7
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/7"]
aliases: ["CHORE-019"]
---

# Phase 7 Lint Sweep

> [!INFO] `CHORE-019` · Chore · Phase 7 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full lint suite (`bun run lint --max-warnings 0`) across all Phase 7 source files and resolve every new warning introduced during Phase 7 development. No new lint suppressions may be added; all warnings must be fixed at the source.

---

## Motivation

Phase 7 introduces new source files (`src/resolution/embed-resolver.ts`, `src/handlers/hover.handler.ts`) and updates to existing files (`src/vault/vault-scanner.ts`, `src/resolution/ref-graph.ts`, `DiagnosticService`). A dedicated lint sweep ensures consistent code style is enforced before Phase 7 is merged.

- Motivated by: `bun run lint --max-warnings 0` CI gate

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Lint-clean codebase at zero warnings | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/resolution/embed-resolver.ts` — fix any lint warnings
- `src/resolution/ref-graph.ts` — fix any lint warnings
- `src/vault/vault-scanner.ts` — fix any lint warnings
- `src/handlers/hover.handler.ts` — fix any lint warnings

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | No behaviour changes; lint fixes only |

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

---

## Notes

Run after all Phase 7 TASK tickets are complete and before Phase 7 is merged to `develop`.

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
> Chore created. Status: `open`. Motivation: lint sweep for all Phase 7 source files.

> [!SUCCESS] Done — 2026-04-17
> `bun run lint --max-warnings 0` passes with zero warnings. One unused import (`fromDocId`) and one unused parameter (`vaultRoot`) found in `hover.handler.ts` and fixed before GREEN commit. `tsc --noEmit` exits 0. Status: `done`.
