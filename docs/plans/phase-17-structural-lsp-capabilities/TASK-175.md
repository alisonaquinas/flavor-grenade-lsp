---
id: "TASK-175"
title: "Register structural LSP capabilities"
type: task
status: open
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/task, "phase/17"]
aliases: ["TASK-175"]
---

# Register structural LSP capabilities

> [!INFO] `TASK-175` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `open`

## Description

Update the capability registration path so `initialize` advertises `documentLinkProvider`, `foldingRangeProvider`, and `selectionRangeProvider` before any structural handlers are implemented. This makes the structural feature surface visible through the existing capability registry and API-layer contract.

---

## Implementation Notes

- Register `documentLinkProvider` as `{ resolveProvider: false }`
- Register `foldingRangeProvider` as `true`
- Register `selectionRangeProvider` as `true`
- Keep request handler lambdas async when adding dispatch wiring later in this phase
- See also: [[design/api-layer]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.CapabilityRegistration` | Structural providers are advertised consistently with implemented handlers | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.Coverage` | Structural capabilities must be advertised and implemented | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP capabilities are advertised by initialize |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/services/capability-registry.spec.ts` | Unit | `Parity.StructuralLSP.Coverage` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| - | N/A |

---

## Parent Feature

[[FEAT-024]] - Structural LSP Capabilities

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-176]] - documentLink handler depends on advertised capability
- [[TASK-177]] - foldingRange handler depends on advertised capability
- [[TASK-178]] - selectionRange handler depends on advertised capability

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `initialize` advertises all three structural providers
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

This task should not add behavior for the three structural requests beyond capability advertisement.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-024]].
