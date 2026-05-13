---
id: "TASK-175"
title: "Register structural LSP capabilities"
type: task
status: done
priority: medium
phase: 17
parent: "FEAT-024"
created: "2026-05-06"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/17"]
aliases: ["TASK-175"]
---

# Register structural LSP capabilities

> [!INFO] `TASK-175` - Task - Phase 17 - Parent: [[FEAT-024]] - Status: `done`

## Description

Update the capability registration path so `initialize` advertises `documentLinkProvider`, `foldingRangeProvider`, and `selectionRangeProvider` before any structural handlers are implemented. This makes the structural feature surface visible through the existing capability registry and API-layer contract.

---

## Implementation Notes

- Update [lsp.module.ts](../../../src/lsp/lsp.module.ts) capability registration
  to include `documentLinkProvider`, `foldingRangeProvider`, and
  `selectionRangeProvider`.
- Register structural request methods with async-safe lambdas:
  `textDocument/documentLink`, `textDocument/foldingRange`, and
  `textDocument/selectionRange`.
- Keep initial request behavior minimal until [[TASK-176]], [[TASK-177]], and
  [[TASK-178]] add feature handlers.
- See also: [[docs/design/api-layer]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.StructuralLSP.CapabilityRegistration` | Structural providers are advertised consistently with implemented handlers | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.StructuralLSP.Coverage` | Structural capabilities must be advertised and implemented | [[docs/requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | Structural LSP capabilities are advertised by initialize |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/lsp/lsp.module.test.ts` | Unit | `Parity.StructuralLSP.CapabilityRegistration` | ✅ passing |

> After implementation, update the rows above and the corresponding rows in [[docs/test/matrix]] and [[docs/test/index]].

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

- [x] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] `initialize` advertises all three structural providers
- [x] `bun run lint --max-warnings 0` passes
- [x] `tsc --noEmit` exits 0
- [ ] [[docs/test/matrix]] row(s) updated to `✅ passing`
- [ ] [[docs/test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-024]] child task row updated to `in-review`

---

## Notes

This task should not add behavior for the three structural requests beyond capability advertisement.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-024]].

> [!FAILURE] Red - 2026-05-06
> Added failing module coverage for structural capability advertisement and
> structural request registration. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added minimal injectable structural handlers, registered all three structural
> LSP requests, and advertised matching initialize capabilities. Focused module
> coverage, `bun run typecheck`, and `bun run lint -- --max-warnings 0` pass.
> Status: `green`.
