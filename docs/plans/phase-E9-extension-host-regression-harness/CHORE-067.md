---
id: "CHORE-067"
title: "Phase E9 Test Matrix Sweep"
type: chore
status: open
priority: medium
phase: E9
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-190", "TASK-191", "TASK-192", "CHORE-066"]
tags: [tickets/chore, "phase/E9"]
aliases: ["CHORE-067"]
---

# Phase E9 Test Matrix Sweep

> [!INFO] `CHORE-067` - Chore - Phase E9 - Priority: `medium` - Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Update the test matrix and test index for every Phase E9 extension-host test
file, fixture, and requirement row. The trace must show which host tests cover
activation, membership, command payloads, status, and failure states.

---

## Motivation

Traceability keeps host coverage auditable when extension behavior changes.

- Motivated by: `Extension.Tests.HostCoverage`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host coverage rows must be represented in trace docs | [[requirements/functional/vscode-extension-parity]] |
| `Extension.LanguageMode.MembershipRefresh` | Membership refresh host tests must be traceable | [[requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.PayloadValidation` | Command payload host tests must be traceable | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - Phase E9 requirement rows
- `docs/test/index.md` - Phase E9 test file inventory

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

- [[TASK-190]] - activation and membership test paths must settle
- [[TASK-191]] - command bridge test paths must settle
- [[TASK-192]] - status and failure test paths must settle
- [[CHORE-066]] - CI command status should be known

**Unblocks:**

- [[CHORE-068]] - documentation trace sweep should reference final trace rows

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] [[test/matrix]] includes Phase E9 rows for all linked requirements
- [ ] [[test/index]] includes every new Phase E9 host test file
- [ ] Test statuses match the actual host-test command result
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behavior-affecting changes in `src/`

---

## Notes

This chore is documentation-only unless a trace mismatch exposes a missing test.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E9 host-test traceability.
