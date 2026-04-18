---
id: "CHORE-016"
title: "Phase 6 Lint Sweep"
type: chore
status: done
priority: normal
phase: 6
created: "2026-04-17"
updated: "2026-04-17T00:00:00Z"
dependencies: []
tags: [tickets/chore, "phase/6"]
aliases: ["CHORE-016"]
---

# Phase 6 Lint Sweep

> [!INFO] `CHORE-016` · Chore · Phase 6 · Priority: `normal` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full lint suite (`bun run lint --max-warnings 0`) across all Phase 6 source files and resolve every new warning introduced during Phase 6 development. No new lint suppressions may be added; all warnings must be fixed at the source.

---

## Motivation

Phase 6 introduces new source files (`src/tags/`, `src/completion/tag-completion-provider.ts`, `src/code-actions/tag-to-yaml.action.ts`) and updates to existing files. A dedicated lint sweep ensures consistent code style is enforced before Phase 6 is merged.

- Motivated by: `bun run lint --max-warnings 0` CI gate

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Lint-clean codebase at zero warnings | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/tags/*.ts` — fix any lint warnings in Phase 6 tag files
- `src/completion/tag-completion-provider.ts` — fix any lint warnings
- `src/code-actions/tag-to-yaml.action.ts` — fix any lint warnings

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

Run after all Phase 6 TASK tickets are complete and before Phase 6 is merged to `develop`.

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
> Chore created. Status: `open`. Motivation: lint sweep for all Phase 6 source files.

> [!SUCCESS] Done — 2026-04-17
> Phase 6 lint sweep complete. `bun run lint --max-warnings 0` passes. One warning
> (`@typescript-eslint/explicit-function-return-type` on the `R` helper in
> `tag-registry.test.ts`) was fixed by adding an explicit return type annotation.
> No new lint suppressions added. `tsc --noEmit` exits 0. 225 tests pass.
