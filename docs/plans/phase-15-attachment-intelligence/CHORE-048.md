---
id: "CHORE-048"
title: "Phase 15 Test Matrix Sweep"
type: chore
status: open
priority: medium
phase: 15
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-168"]
tags: [tickets/chore, "phase/15"]
aliases: ["CHORE-048"]
---

# Phase 15 Test Matrix Sweep

> [!INFO] `CHORE-048` · Chore · Phase 15 · Priority: `medium` · Status: `open`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Audit Phase 15 tests against [[test/matrix]] and [[test/index]]. Every new or
updated unit, integration, and BDD test covering attachment indexing,
completion, diagnostics, navigation, hover, and config must have trace rows with
accurate requirement tags and passing status.

---

## Motivation

Attachment intelligence spans multiple LSP surfaces, so traceability can drift
unless the matrix is reconciled after the implementation tasks finish.

- Motivated by: [[test/matrix]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.Intelligence` | Attachment behavior has test evidence | [[requirements/functional/ofmarkdown-parity]] |
| `Embed.Resolution.ImageTarget` | Image attachment resolution has test evidence | [[requirements/embed-resolution]] |
| `Diagnostic.Severity.Embed` | Broken attachment diagnostics have severity evidence | [[requirements/diagnostics]] |
| `Navigation.Definition.AllLinkTypes` | Attachment definition has test evidence | [[requirements/navigation]] |
| `HV-002` | Attachment hover has test evidence | [[requirements/hover]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` — Phase 15 requirement-to-test trace rows.
- `docs/test/index.md` — Phase 15 test file inventory rows.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| — | None |

---

## Dependencies

**Blocked by:**

- [[TASK-168]] — final test surface must exist before the trace sweep.

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] [[test/matrix]] includes Phase 15 rows for all linked requirements.
- [ ] [[test/index]] includes every new Phase 15 test file.
- [ ] Test rows use current pass/fail status after local verification.
- [ ] `bun test` passes with no regressions introduced.
- [ ] `bun run test:bdd` passes relevant attachment scenarios or documents a
  named blocker.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] No behaviour-affecting changes in `src/`; convert to TASK if needed.

---

## Notes

Run this after implementation, not before. Task tickets list likely test
locations, but this chore records the actual files that landed.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-15 test trace sweep.
