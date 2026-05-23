---
id: "CHORE-071"
title: "Phase E10 Documentation Trace Sweep"
type: chore
status: done
priority: medium
phase: E10
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["CHORE-070"]
tags: [tickets/chore, "phase/E10"]
aliases: ["CHORE-071"]
---

# Phase E10 Documentation Trace Sweep

> [!INFO] `CHORE-071` - Chore - Phase E10 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Sweep Phase E10 documentation after implementation so the phase plan,
troubleshooting docs, extension parity plan, and support-facing command names all
describe the same status behavior.

---

## Motivation

Troubleshooting docs are only useful if they match the final status text,
tooltip fields, and quick-action commands.

- Motivated by: `Extension.Status.QuickActions`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Documentation must explain known status and error states | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.QuickActions` | Documentation must name recovery and diagnostic actions accurately | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/plans/phase-E10-status-ux-troubleshooting.md` - final evidence notes
- `extension/docs/plans/vscode-extension-parity.md` - E10 slice status if needed
- Extension troubleshooting docs - final recovery copy and links

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | Status recovery actions should use native VS Code command surfaces |

---

## Dependencies

**Blocked by:**

- [[CHORE-070]] - test matrix and index rows must be final

**Unblocks:**

- Phase E11 - Marketplace status proof can rely on final troubleshooting copy
- Phase E13 - environment-mode docs can reuse final disabled-state language

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Phase E10 plan names final status states, actions, and verification evidence
- [x] Troubleshooting docs match final command names and status text
- [x] Extension parity plan remains aligned with the E10 delivery slice
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added
- [x] `tsc --noEmit` exits 0
- [x] `bun test` passes (no regressions introduced)
- [x] No behavior-affecting changes in `src/`

---

## Notes

Keep this sweep scoped to Phase E10 documentation and support copy. Do not edit
other phase ticket folders.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

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
> See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E10 final documentation trace.

> [!SUCCESS] Done - 2026-05-07
> Swept Phase E10 plan evidence, extension parity slice status, activation
> command docs, and troubleshooting copy against the final status states and
> command names.
