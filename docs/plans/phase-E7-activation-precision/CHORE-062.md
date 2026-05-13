---
id: "CHORE-062"
title: "Phase E7 Documentation Trace Sweep"
type: chore
status: done
priority: medium
phase: E7
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-184", "CHORE-061"]
tags: [tickets/chore, "phase/E7"]
aliases: ["CHORE-062"]
---

# Phase E7 Documentation Trace Sweep

> [!INFO] `CHORE-062` - Chore - Phase E7 - Priority: `medium` - Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process.

---

## Description

Review Phase E7 documentation links so the phase plan, feature docs, extension
docs, requirements, and ticket set all describe the same activation behavior.

---

## Motivation

Activation precision affects user expectations directly, so stale docs would be
more damaging than a missing internal note.

- Motivated by: `Extension.Activation.VaultPrecision`

---

## Linked Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Activation.VaultPrecision` | Documentation must match active and idle startup behavior | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Scope of Change

**Files modified:**

- Phase E7 documentation files - trace and wording fixes only

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR019-vscode-command-bridges-and-client-ux]] | Document client UX contracts where users encounter them |

---

## Dependencies

**Blocked by:**

- [[TASK-184]] - activation behavior docs should be drafted
- [[CHORE-061]] - final test trace links should be available

**Unblocks:**

- [[FEAT-026]] - next phase can rely on accurate activation docs

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [x] Phase E7 docs link to relevant requirements and feature docs
- [x] Extension docs and README agree on marker, language, and command signals
- [x] No stale references to generic Markdown indexing remain
- [x] Markdown lint passes for changed docs
- [x] No runtime behavior files are changed

---

## Notes

Limit this chore to documentation trace fixes. New activation behavior belongs
in the Phase E7 task tickets.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behavior-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened - 2026-05-07
> Chore created. Status: `open`. Motivation: Phase E7 documentation trace.

> [!INFO] In Review - 2026-05-07
> Reviewed Phase E7 activation docs and requirement wording; docs are ready
> for PR review.

> [!SUCCESS] Done - 2026-05-07
> PR #39 CI passed; documentation trace sweep is complete.
