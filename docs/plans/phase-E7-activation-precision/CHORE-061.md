---
id: "CHORE-061"
title: "Phase E7 Test Trace Sweep"
type: chore
status: done
priority: medium
phase: E7
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-181", "TASK-182", "TASK-183"]
tags: [tickets/chore, "phase/E7"]
aliases: ["CHORE-061"]
---

# Phase E7 Test Trace Sweep

> [!INFO] `CHORE-061` - Chore - Phase E7 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process.

---

## Description

Audit Phase E7 test references after implementation so activation marker,
startup gating, and wake path coverage are represented in the test matrix and
test index.

---

## Motivation

The activation precision requirements are measured by fixture outcomes, so test
traceability must show which cases prove each signal.

- Motivated by: `Extension.Activation.MarkerEvents`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.MarkerEvents` | Activation fixtures must trace to marker, language, and command signals | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.VaultPrecision` | Vault and generic Markdown outcomes must be traced | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - Phase E7 rows only
- `docs/test/index.md` - Phase E7 test file entries only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| - | N/A |

---

## Dependencies

**Blocked by:**

- [[TASK-181]] - marker tests should exist
- [[TASK-182]] - startup gating tests should exist
- [[TASK-183]] - wake path tests should exist

**Unblocks:**

- [[CHORE-062]] - documentation trace sweep can reference final test rows

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Phase E7 test rows exist in [[test/matrix]]
- [x] Phase E7 test files are listed in [[test/index]]
- [x] Requirement tags map to passing or planned evidence consistently
- [x] No runtime behavior files are changed
- [x] Markdown lint passes for changed docs

---

## Notes

This chore should not add new runtime tests. Missing tests should be sent back
to the relevant task ticket.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E7 test traceability.

> [!INFO] In Review - 2026-05-07
> Added Phase E7 rows to [[test/matrix]] and listed
> `extension/src/activation-gate.test.ts` in [[test/index]].

> [!SUCCESS] Done - 2026-05-07
> PR #39 CI passed; test trace sweep is complete.
