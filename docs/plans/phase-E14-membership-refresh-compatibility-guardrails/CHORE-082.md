---
id: "CHORE-082"
title: "Phase E14 package smoke-test trace sweep"
type: chore
status: open
priority: medium
phase: E14
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-212", "CHORE-081"]
tags: [tickets/chore, "phase/E14"]
aliases: ["CHORE-082"]
---

# Phase E14 package smoke-test trace sweep

> [!INFO] `CHORE-082` - Chore - Phase E14 - Priority: `medium` - Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Review package smoke-test evidence and traceability for version, target, and
bundled server binary checks. The sweep should ensure missing, duplicate, and
wrong-target binaries are represented before release.

---

## Motivation

Platform-specific VSIX distribution avoids runtime downloads, but it creates a
packaging correctness risk. Phase E14 needs visible package evidence before
publish.

- Motivated by: `Extension.Packaging.TargetBinaryValidation`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Packaging.TargetBinaryValidation` | Packaged VSIX output contains exactly one matching server binary | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Package smoke-test trace rows and release-check documentation - evidence-only
  updates.

**Files created:**

- None.

**Files deleted:**

- None.

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR015-platform-specific-vsix]] | Each platform VSIX contains exactly one matching server binary |

---

## Dependencies

**Blocked by:**

- [[TASK-212]] - package validation behavior must exist.
- [[CHORE-081]] - lint and type file changes should settle first.

**Unblocks:**

- [[FEAT-032]] - phase closeout requires package smoke-test evidence.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Package smoke-test trace covers every supported platform VSIX target.
- [ ] Evidence includes missing-binary failure behavior.
- [ ] Evidence includes duplicate-binary failure behavior.
- [ ] Evidence includes wrong-target failure behavior.
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [ ] `tsc --noEmit` exits 0.
- [ ] `bun test` passes with no regressions introduced.
- [ ] [[test/matrix]] updated if any test files were added or removed.
- [ ] [[test/index]] updated if any test files were added or removed.

---

## Notes

This chore records and aligns evidence. It should not change package-validation
logic.

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
> Chore created. Status: `open`. Motivation: Phase E14 packaged VSIX trace
> evidence.
