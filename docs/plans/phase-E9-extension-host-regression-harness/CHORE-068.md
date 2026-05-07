---
id: "CHORE-068"
title: "Phase E9 Documentation Trace Sweep"
type: chore
status: open
priority: medium
phase: E9
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["CHORE-067"]
tags: [tickets/chore, "phase/E9"]
aliases: ["CHORE-068"]
---

# Phase E9 Documentation Trace Sweep

> [!INFO] `CHORE-068` - Chore - Phase E9 - Priority: `medium` - Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Sweep Phase E9 documentation after host tests land so the phase plan, extension
parity plan, and fixture notes all describe the final regression harness
accurately.

---

## Motivation

The extension-host harness becomes maintenance-critical once added, so the docs
must name the real command, fixture layout, and trace targets.

- Motivated by: `Extension.Tests.HostCoverage`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host test command, fixtures, and coverage must be documented | [[requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- `docs/plans/phase-E9-extension-host-regression-harness.md` - final command and evidence notes
- `extension/docs/plans/vscode-extension-parity.md` - E9 slice status if needed
- Phase E9 fixture README files - fixture purpose notes if created by tasks

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[adr/ADR019-vscode-command-bridges-and-client-ux]] | Client behavior docs must stay aligned with bridge tests |

---

## Dependencies

**Blocked by:**

- [[CHORE-067]] - test matrix and index rows must be final

**Unblocks:**

- Phase E10 - status UX work can rely on documented host-test behavior

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Phase E9 plan names the local host-test command and CI status
- [ ] Fixture documentation explains each workspace marker and expected state
- [ ] Extension parity plan remains aligned with the E9 delivery slice
- [ ] `bun run lint --max-warnings 0` passes with no new suppressions added
- [ ] `tsc --noEmit` exits 0
- [ ] `bun test` passes (no regressions introduced)
- [ ] No behavior-affecting changes in `src/`

---

## Notes

Keep this sweep scoped to Phase E9 documentation and fixtures. Do not edit
other phase ticket folders.

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
> Chore created. Status: `open`. Motivation: Phase E9 final documentation trace.
