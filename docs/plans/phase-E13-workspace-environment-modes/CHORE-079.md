---
id: "CHORE-079"
title: "Phase E13 manual verification ledger sweep"
type: chore
status: in-review
priority: medium
phase: E13
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-208"]
tags: [tickets/chore, "phase/E13"]
aliases: ["CHORE-079"]
---

# Phase E13 manual verification ledger sweep

> [!INFO] `CHORE-079` - Chore - Phase E13 - Priority: `medium` - Status: `in-review`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Collect and normalize manual verification evidence for local, WSL, SSH, and Dev
Container environment checks. The sweep should make phase closeout auditable
without adding new extension behavior.

---

## Motivation

Some VS Code environment modes cannot be created reliably in CI. Phase E13 needs
a clear ledger of manual evidence so unsupported modes and supported remote
modes are not accepted by assumption.

- Motivated by: `Extension.Workspace.EnvironmentModes`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Workspace.EnvironmentModes` | Environment modes have documented tested or manually verified behavior | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Phase E13 verification notes and test matrix rows - evidence-only updates.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Manual evidence must identify the packaged platform target tested |

---

## Dependencies

**Blocked by:**

- [[TASK-208]] - smoke-test documentation must exist before evidence is swept.

**Unblocks:**

- [[FEAT-031]] - phase closeout requires remote-mode evidence.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Manual verification rows cover local Windows, macOS, Linux, WSL, SSH, and
  Dev Containers.
- [x] Each row records expected server-start behavior and observed status UI.
- [x] Unsupported modes record no-spawn evidence.
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] [[test/matrix]] updated if any test files were added or removed.
- [x] [[test/index]] updated if any test files were added or removed.

---

## Notes

This chore may record skipped CI status only when a named manual environment is
required.

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
> Chore created. Status: `open`. Motivation: Phase E13 remote-mode manual
> verification evidence.

> [!SUCCESS] In Review - 2026-05-07
> `extension/docs/features/workspace-environments.md` records manual smoke-test
> evidence expectations for local OS, WSL, SSH, Dev Container, Restricted Mode,
> and virtual workspace modes.
