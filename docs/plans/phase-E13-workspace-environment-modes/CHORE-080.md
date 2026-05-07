---
id: "CHORE-080"
title: "Phase E13 troubleshooting trace sweep"
type: chore
status: done
priority: medium
phase: E13
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-205", "TASK-206", "TASK-208", "CHORE-078"]
tags: [tickets/chore, "phase/E13"]
aliases: ["CHORE-080"]
---

# Phase E13 troubleshooting trace sweep

> [!INFO] `CHORE-080` - Chore - Phase E13 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Review Phase E13 status messages, README troubleshooting notes, and requirement
trace rows so environment-mode behavior is described consistently. This chore
keeps disabled states discoverable after implementation.

---

## Motivation

Workspace trust, virtual workspaces, and remote extension hosts fail in different
ways. Users need consistent status and troubleshooting language instead of raw
log interpretation.

- Motivated by: `Extension.Status.Diagnostics`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Status UI exposes actionable server, vault, and error state | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Workspace.EnvironmentModes` | Environment support is explicit and documented | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Phase E13 documentation, troubleshooting, and trace rows - documentation-only
  consistency fixes.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Troubleshooting must preserve packaged binary assumptions |

---

## Dependencies

**Blocked by:**

- [[TASK-205]] - Restricted Mode status wording must be known.
- [[TASK-206]] - virtual workspace status wording must be known.
- [[TASK-208]] - smoke-test documentation must be available.
- [[CHORE-078]] - lint and type file changes should settle first.

**Unblocks:**

- [[FEAT-031]] - phase closeout requires consistent status and docs.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Troubleshooting docs cover Restricted Mode and virtual workspaces.
- [x] Remote smoke-test docs link back to the Phase E13 plan.
- [x] Requirement trace links point to
  [[requirements/user/vscode-extension-parity]].
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] No behaviour-affecting changes in `src/`.
- [x] [[test/matrix]] updated if any test files were added or removed.
- [x] [[test/index]] updated if any test files were added or removed.

---

## Notes

This chore should run last in Phase E13.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E13 status and
> troubleshooting trace consistency.

> [!SUCCESS] In Review - 2026-05-07
> Troubleshooting, environment smoke-test docs, test matrix, test index, and
> extension parity plan now agree on E13 workspace behavior.

> [!SUCCESS] Done - 2026-05-07
> PR #45 CI is green and the sweep remains complete.
