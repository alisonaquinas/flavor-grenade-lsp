---
id: "CHORE-083"
title: "Phase E14 compatibility documentation sweep"
type: chore
status: in-review
priority: medium
phase: E14
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-209", "TASK-210", "TASK-211", "TASK-212", "CHORE-081"]
tags: [tickets/chore, "phase/E14"]
aliases: ["CHORE-083"]
---

# Phase E14 compatibility documentation sweep

> [!INFO] `CHORE-083` - Chore - Phase E14 - Priority: `medium` - Status: `in-review`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Update compatibility and troubleshooting documentation so membership refresh
triggers, guarded language reversion, server version warnings, and package target
checks are discoverable.

---

## Motivation

Long-running language-mode behavior and package mismatch warnings are only useful
if users and release agents know how to interpret them.

- Motivated by: `Extension.LanguageMode.MembershipRefresh`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.LanguageMode.MembershipRefresh` | Language-mode membership refresh behavior is explicit | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Status.Diagnostics` | Version and target mismatch states are visible and explainable | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Packaging.TargetBinaryValidation` | Packaged binary checks are documented before release | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Phase E14 documentation, troubleshooting notes, and trace rows -
  documentation-only consistency fixes.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Compatibility docs must describe target-specific package checks |

---

## Dependencies

**Blocked by:**

- [[TASK-209]] - server and index refresh behavior must be known.
- [[TASK-210]] - workspace and editor refresh behavior must be known.
- [[TASK-211]] - guarded reversion behavior must be known.
- [[TASK-212]] - version and target metadata behavior must be known.
- [[CHORE-081]] - lint and type file changes should settle first.

**Unblocks:**

- [[FEAT-032]] - phase closeout requires coherent docs and troubleshooting.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Documentation lists every membership refresh trigger.
- [x] Documentation explains guarded `ofmarkdown` to `markdown` reversion.
- [x] Troubleshooting covers client/server version mismatch.
- [x] Release docs cover packaged target binary validation.
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] No behaviour-affecting changes in `src/`.
- [x] [[test/matrix]] updated if any test files were added or removed.
- [x] [[test/index]] updated if any test files were added or removed.

---

## Notes

This chore should run after the behavior and compatibility tasks have stabilized.

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
> Chore created. Status: `open`. Motivation: Phase E14 compatibility and
> troubleshooting documentation consistency.

> [!INFO] In Review - 2026-05-07
> Troubleshooting now documents membership refresh triggers, guarded downgrade,
> and version mismatch diagnostics. ADR015 documents the shared package-target
> validator used before release artifact upload.
