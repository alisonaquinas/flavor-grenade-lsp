---
id: "CHORE-005"
title: "Phase 2 Code Quality Sweep"
type: chore
status: done
priority: high
phase: 2
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-017", "TASK-018", "TASK-019", "TASK-020", "TASK-021", "TASK-022", "TASK-023", "TASK-024", "TASK-025", "TASK-026", "TASK-027", "TASK-028", "TASK-029"]
tags: [tickets/chore, "phase/2"]
aliases: ["CHORE-005"]
---

# Phase 2 Code Quality Sweep

> [!INFO] `CHORE-005` · Chore · Phase 2 · Priority: `high` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves internal quality: tooling, configuration, documentation, refactoring, or process. If a chore inadvertently changes observable LSP behaviour, convert it to a `TASK` ticket.

---

## Description

Review all Phase 2 implementation files for code quality issues that automated lint cannot catch. The primary focus areas are: verifying that `StdioReader` and `StdioWriter` have no resource leaks (event listeners are removed on close, writable streams are not written after end), and confirming that all JSON-RPC dispatcher error paths are covered by tests and handle exceptions without crashing the process. Refactor any identified issues without changing observable behaviour.

---

## Motivation

Resource leaks in stdio transport components could cause the server to malfunction in long-running sessions. Unhandled error paths in the dispatcher could crash the server on malformed client input. Both categories of issue must be eliminated before the transport layer is considered production-ready.

- Motivated by: `Quality.CodeQuality.NoResourceLeaks`, `Quality.ErrorHandling.AllPathsCovered`

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | No resource leaks; all error paths covered | [[requirements/code-quality]] |

---

## Scope of Change

**Files modified:**

- `src/transport/stdio-reader.ts` — verify listener cleanup on stream close
- `src/transport/stdio-writer.ts` — verify no writes after stream end
- `src/transport/json-rpc-dispatcher.ts` — verify all error code paths are exercised
- Related test files — add missing coverage where gaps are found

**Files created:**

- None expected

**Files deleted:**

- None expected

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR001-stdio-transport]] | Transport implementation must be robust under abnormal client behaviour |

---

## Dependencies

**Blocked by:**

- All Phase 2 TASK tickets (TASK-017 through TASK-029) must be `done`

**Unblocks:**

- Phase 2 feature ticket [[FEAT-003]] can transition to `in-review` once all three Phase 2 chores are `done`

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] `StdioReader` removes its `data` listener when the input stream emits `close` or `end`
- [ ] `StdioWriter` does not write to a stream that has already ended
- [ ] All three JSON-RPC error codes (`-32700`, `-32601`, `-32603`) are covered by tests
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behaviour-affecting changes in `src/`
- [ ] [[test/matrix]] updated if any test files were added or removed
- [ ] [[test/index]] updated if any test files were added or removed

---

## Notes

If fixing a resource leak requires adding a `close()` or `dispose()` method to a class, ensure the NestJS module calls it in an `onModuleDestroy` hook.

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
> Chore created. Status: `open`. Motivation: verify StdioReader/Writer don't leak, JSON-RPC dispatcher error paths covered.

> [!SUCCESS] Done — 2026-04-17
> Sweep complete. No violations found or fixed. Status: `done`.
