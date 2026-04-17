---
id: "TASK-086"
title: "Implement FG005 diagnostic"
type: task
status: open
priority: "high"
phase: "8"
parent: "FEAT-009"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-085"]
tags: [tickets/task, "phase/8"]
aliases: ["TASK-086"]
---

# Implement FG005 diagnostic

> [!INFO] `TASK-086` · Task · Phase 8 · Parent: [[tickets/FEAT-009]] · Status: `open`

## Description

Update `DiagnosticService` to emit the FG005 BrokenBlockRef diagnostic for block references where `CrossBlockRef.diagnostic === 'FG005'`. FG005 has severity Error (more severe than FG004 Warning) because block refs typically carry semantic meaning. In single-file mode, FG005 is suppressed for cross-file refs (where `targetDocId` is non-null) but is not suppressed for intra-document refs (where `targetDocId === null`).

---

## Implementation Notes

- Diagnostic code: `FG005`
- Severity: `DiagnosticSeverity.Error`
- Message format: `Cannot resolve block reference '^{anchorId}' in '[[{target}]]'`
- Single-file mode suppression logic:
  - If `crossBlockRef.targetDocId !== null` (cross-file) → suppress (no vault context)
  - If `crossBlockRef.targetDocId === null` (intra-document) → emit even in single-file mode
- Discrimination from FG001: FG001 is for a missing target document; FG005 is for a missing anchor within a found (or same) document
- Linked BDD: [[bdd/features/block-references]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | FG005 BrokenBlockRef diagnostic | [[requirements/block-references]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/block-references]] | `Missing anchor emits FG005` |
| [[bdd/features/block-references]] | `FG005 suppressed for cross-file refs in single-file mode` |
| [[bdd/features/block-references]] | `FG005 not suppressed for intra-document refs in single-file mode` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/__tests__/block-ref-resolver.test.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR006-block-ref-indexing]] | Block anchor ID format and indexing strategy |

---

## Parent Feature

[[tickets/FEAT-009]] — Block References

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-085]] — `LinkResolver` must write `CrossBlockRef.diagnostic = 'FG005'` before `DiagnosticService` can read it

**Unblocks:**

- [[tickets/TASK-091]] — integration tests for FG005 depend on the diagnostic being emitted

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-009]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-009]].
