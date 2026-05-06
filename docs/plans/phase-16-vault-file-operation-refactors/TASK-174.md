---
id: "TASK-174"
title: "Add file operation regression suite"
type: task
status: open
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-173"]
tags: [tickets/task, "phase/16"]
aliases: ["TASK-174"]
---

# Add file operation regression suite

> [!INFO] `TASK-174` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `open`

## Description

Add regression coverage that exercises the full file operation flow across
wiki-links, embeds, Markdown inline links, reference definitions, and Markdown
image links. The suite must verify successful vault-local moves, folder moves,
escaping-path rejection, and preservation of headings, blocks, aliases, and
title text.

---

## Implementation Notes

- Extend `docs/bdd/features/ofmarkdown-parity.feature` scenarios when needed
- Add focused unit coverage for planner, rewriter, validator, and refresh seams
- Keep test matrix and test index rows synchronized
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.AtomicRefactor` | Regression suite proves atomic move refactors | [[requirements/ofmarkdown-parity]] |
| `Rename.Refactoring.Completeness` | Existing rename coverage remains green | [[requirements/rename]] |
| `Security.Vault.RenameConfinement` | Escaping moves are refused | [[requirements/security/vault-confinement]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/test/bdd/steps/ofmarkdown-parity.steps.ts` | BDD | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |
| `src/resolution/file-operation-regression.spec.ts` | Integration | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Regression tests must cover the complete file operation pipeline |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- [[TASK-173]] — regression suite needs handler, planner, rewriter, validator,
  and refresh behavior

**Unblocks:**

- [[CHORE-050]] — lint sweep should run after regression changes land
- [[CHORE-051]] — test matrix sweep depends on final Phase 16 test inventory
- [[CHORE-052]] — security sweep depends on final path confinement coverage

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] File and folder move scenarios pass in `docs/bdd/features/ofmarkdown-parity.feature`
- [ ] Existing heading and file rename behavior remains green
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

This is the final implementation task for the phase. Use it to prove the
complete implementation sequence, not to introduce new production architecture.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ →
`in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-023]].
