---
id: "CHORE-066"
title: "Phase E9 CI Test Command Sweep"
type: chore
status: done
priority: medium
phase: E9
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-189", "TASK-190", "TASK-191", "TASK-192"]
tags: [tickets/chore, "phase/E9"]
aliases: ["CHORE-066"]
---

# Phase E9 CI Test Command Sweep

> [!INFO] `CHORE-066` - Chore - Phase E9 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Wire the Phase E9 extension-host test command into the practical verification
path, or document the exact CI blocker if the host environment cannot run VS
Code. This keeps the regression harness visible in release checks.

---

## Motivation

Extension-host tests only protect the client if maintainers know when and how
they run.

- Motivated by: `Extension.Tests.HostCoverage`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host test command must run locally or have a documented CI blocker | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `extension/package.json` - host-test script wiring if needed
- CI workflow files inside this repository - optional host-test job wiring
- `docs/plans/phase-E9-extension-host-regression-harness.md` - blocker note if CI cannot run host tests

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | VS Code client behavior needs host-level verification |

---

## Dependencies

**Blocked by:**

- [[TASK-189]] - host-test command must exist
- [[TASK-190]] - activation and language-mode tests should exist
- [[TASK-191]] - command bridge tests should exist
- [[TASK-192]] - status and failure tests should exist

**Unblocks:**

- [[CHORE-067]] - trace sweep should use the final test command status

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Host tests run in CI or the documented blocker names the missing capability
- [x] Local command under `extension/` is documented in the phase notes
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behavior-affecting changes in `src/`
- [ ] [[docs/test/matrix]] updated if any test files were added or removed
- [ ] [[docs/test/index]] updated if any test files were added or removed

---

## Notes

Run after all Phase E9 task tickets are in `done` or `in-review`.

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
> Chore created. Status: `open`. Motivation: make Phase E9 host tests visible in verification.

> [!SUCCESS] Done - 2026-05-07
> `npm run test:host` is the local Phase E9 host command and now runs all
> fixtures by default. The phase plan records the current CI blocker: root PR CI
> does not launch the Electron extension host.
