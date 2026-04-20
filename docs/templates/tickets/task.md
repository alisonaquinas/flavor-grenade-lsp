---
id: "{{TICKET-ID}}"
title: "{{TICKET-TITLE}}"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "{{PRIORITY}}"
phase: "{{PHASE-NUMBER}}"
parent: "{{PARENT-FEAT-ID}}"
created: "{{DATE}}"
updated: "{{DATE}}"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/task, "phase/{{PHASE-NUMBER}}"]
aliases: ["{{TICKET-ID}}"]
---

# {{TICKET-TITLE}}

> [!INFO] `{{TICKET-ID}}` · Task · Phase {{PHASE-NUMBER}} · Parent: [[tickets/{{PARENT-FEAT-ID}}]] · Status: `open`

## Description

> One paragraph describing the single atomic unit of work this task performs. A task should be completable in one focused session. If more than three implementation files need to be created or modified, consider splitting into two tasks.

{{DESCRIPTION}}

---

## Implementation Notes

> Optional: design constraints, API shapes, or algorithmic hints relevant to this task. Reference [[ddd/ubiquitous-language]] terms and [[architecture/overview]] module boundaries. Do not duplicate content from design docs — link to them instead.

- {{IMPL-NOTE-1}}
- See also: [[design/{{DESIGN-FILE}}]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| `{{FR-TAG}}` | {{FR-GIST}} | [[requirements/{{FEATURE-FILE}}]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete. Link to the feature file; note the scenario title.

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/{{FEATURE-NAME}}]] | `{{SCENARIO-TITLE}}` |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task. Follow TDD: the test file row is added here *before* implementation, when the test is in RED state.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/{{TYPE}}/{{MODULE}}/{{FILE}}.spec.ts` | Unit | `` `{{FR-TAG}}` `` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR{{NNN}}-{{SLUG}}]] | {{DECISION-SUMMARY}} |

---

## Parent Feature

[[tickets/{{PARENT-FEAT-ID}}]] — {{PARENT-FEAT-TITLE}}

---

## Dependencies

**Blocked by:**

- [[tickets/{{BLOCKING-TICKET-ID}}]] — {{REASON}}

**Unblocks:**

- [[tickets/{{UNBLOCKED-TICKET-ID}}]] — {{REASON}}

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
- [ ] Parent feature [[tickets/{{PARENT-FEAT-ID}}]] child task row updated to `in-review`
- [ ] {{ADDITIONAL-CRITERION}}

---

## Notes

{{NOTES}}

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` *(optional)* → `in-review` → `done`
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

<!-- TEMPLATE USAGE: Replace the entry below with a real date when creating the ticket. -->

> [!INFO] Opened — {{DATE}}
> Ticket created. Status: `open`. Parent: [[tickets/{{PARENT-FEAT-ID}}]].
