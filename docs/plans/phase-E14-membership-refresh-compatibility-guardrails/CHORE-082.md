---
id: "CHORE-082"
title: "Phase E14 package smoke-test trace sweep"
type: chore
status: done
priority: medium
phase: E14
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-212", "CHORE-081"]
tags: [tickets/chore, "phase/E14"]
aliases: ["CHORE-082"]
---

# Phase E14 package smoke-test trace sweep

> [!INFO] `CHORE-082` - Chore - Phase E14 - Priority: `medium` - Status: `done`

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
| `Extension.Packaging.TargetBinaryValidation` | Packaged VSIX output contains exactly one matching server binary | [[docs/requirements/functional/vscode-extension-parity]] |

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

- [x] Package smoke-test trace covers every supported platform VSIX target.
- [x] Evidence includes missing-binary failure behavior.
- [x] Evidence includes duplicate-binary failure behavior.
- [x] Evidence includes wrong-target failure behavior.
- [x] `bun run lint --max-warnings 0` passes with no new suppressions added.
- [x] `tsc --noEmit` exits 0.
- [x] `bun test` passes with no regressions introduced.
- [x] [[docs/test/matrix]] updated if any test files were added or removed.
- [x] [[docs/test/index]] updated if any test files were added or removed.

---

## Notes

This chore records and aligns evidence. It should not change package-validation
logic.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E14 packaged VSIX trace
> evidence.

> [!INFO] In Review - 2026-05-07
> `extension/test/package-targets/server-binary.test.ts` covers target mapping,
> missing, duplicate, and wrong-target binaries plus real VSIX inspection.
> `.github/workflows/extension-release.yml` now runs the same validator for all
> seven platform targets.

> [!SUCCESS] Done - 2026-05-07
> PR #46 CI passed and phase closeout completed.
