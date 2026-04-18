---
id: "TASK-113"
title: "Handle pipe aliases during heading rename"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-110"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-113"]
---

# Handle pipe aliases during heading rename

> [!INFO] `TASK-113` · Task · Phase 11 · Parent: [[FEAT-012]] · Status: `open`

## Description

Implement the alias identity-check rule during heading rename. When renaming heading `Old Heading` to `New Heading`: `[[doc#Old Heading]]` (no alias) → `[[doc#New Heading]]`; `[[doc#Old Heading|My Label]]` (alias differs from heading) → `[[doc#New Heading|My Label]]` (alias preserved, only target changes); `[[doc#Old Heading|Old Heading]]` (alias identical to heading text) → `[[doc#New Heading|New Heading]]` (both target and alias updated). The rule is: if the alias was identical to the old heading text, update the alias too; otherwise preserve the alias.

---

## Implementation Notes

- Extends heading rename handler (TASK-110)
- Identity check: `alias === oldHeadingText` — string equality, case-sensitive
- Three cases must all be handled correctly
- The identity check must use the raw heading text (without `##` prefix, without trailing whitespace)
- See also: `bdd/features/rename.feature`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements | [[requirements/rename]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/rename.feature` | `Heading rename with no alias updates target` |
| `bdd/features/rename.feature` | `Heading rename with non-identical alias preserves alias` |
| `bdd/features/rename.feature` | `Heading rename with alias identical to heading updates alias too` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Pipe alias syntax and binding rules |

---

## Parent Feature

[[FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[TASK-110]] — heading rename must exist before alias handling can be layered on

**Unblocks:**

- [[TASK-117]] — integration tests cover pipe alias scenarios

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
- [ ] Parent feature [[FEAT-012]] child task row updated to `in-review`

---

## Notes

The identity check is case-sensitive. `[[doc#Old Heading|old heading]]` (lowercase alias) would NOT be updated because the alias does not equal the heading text exactly.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-012]].
