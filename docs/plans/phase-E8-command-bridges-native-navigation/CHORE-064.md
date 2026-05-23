---
id: "CHORE-064"
title: "Phase E8 Test Trace Sweep"
type: chore
status: done
priority: medium
phase: E8
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-185", "TASK-186", "TASK-187"]
tags: [tickets/chore, "phase/E8"]
aliases: ["CHORE-064"]
---

# Phase E8 Test Trace Sweep

> [!INFO] `CHORE-064` - Chore - Phase E8 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process.

---

## Description

Audit Phase E8 test references after implementation so native UI, payload
validation, and graph action coverage are represented in the test matrix and
test index.

---

## Motivation

Command bridge correctness is measured by registered command behavior and
payload outcomes, so test traceability must stay exact.

- Motivated by: `Extension.CommandBridges.PayloadValidation`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.NativeUI` | Native UI bridge tests must be traced | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Valid and invalid payload tests must be traced | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Graph action command tests must be traced | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - Phase E8 rows only
- `docs/test/index.md` - Phase E8 test file entries only

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

- [[TASK-185]] - native bridge tests should exist
- [[TASK-186]] - payload validation tests should exist
- [[TASK-187]] - graph action tests should exist

**Unblocks:**

- [[CHORE-065]] - documentation trace sweep can reference final test rows

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Phase E8 test rows exist in [[docs/test/matrix]]
- [x] Phase E8 test files are listed in [[docs/test/index]]
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
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E8 test traceability.

> [!INFO] In Review - 2026-05-07
> Added Phase E8 rows to [[docs/test/matrix]] and listed
> `extension/src/command-bridges.test.ts` in [[docs/test/index]].

> [!SUCCESS] Done - 2026-05-07
> PR #40 CI passed; test trace sweep is complete.
