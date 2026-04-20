---
id: "CHORE-034"
title: "Phase 12 Lint Sweep"
type: chore
status: open
priority: medium
phase: 12
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/chore, "phase/12"]
aliases: ["CHORE-034"]
---

# Phase 12 Lint Sweep

> [!INFO] `CHORE-034` · Chore · Phase 12 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Run the full linter across all files introduced or modified in Phase 12 (`src/handlers/code-action.handler.ts`, `src/code-actions/create-missing-file.action.ts`, `src/code-actions/toc-generator.action.ts`, `src/code-actions/fix-nbsp.action.ts`, `src/handlers/workspace-symbol.handler.ts`, `src/handlers/document-symbol.handler.ts`, `src/handlers/semantic-tokens.handler.ts`, and the extended `src/code-actions/tag-to-yaml.action.ts`). Resolve all lint warnings and ensure `bun run lint --max-warnings 0` exits 0 with no new suppressions added.

---

## Motivation

Keeping lint clean after each feature phase prevents warning accumulation and maintains code quality standards defined in [[requirements/code-quality]].

- Motivated by: `Quality.Lint.ZeroWarnings`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Zero lint warnings across the codebase | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/handlers/code-action.handler.ts` — lint fixes
- `src/code-actions/create-missing-file.action.ts` — lint fixes
- `src/code-actions/toc-generator.action.ts` — lint fixes
- `src/code-actions/fix-nbsp.action.ts` — lint fixes
- `src/handlers/workspace-symbol.handler.ts` — lint fixes
- `src/handlers/document-symbol.handler.ts` — lint fixes
- `src/handlers/semantic-tokens.handler.ts` — lint fixes
- `src/code-actions/tag-to-yaml.action.ts` — lint fixes

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

---

## Notes

Run after all Phase 12 TASK tickets are in `done` state.

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
> Chore created. Status: `open`. Motivation: post-Phase-12 lint sweep to reach zero warnings.
