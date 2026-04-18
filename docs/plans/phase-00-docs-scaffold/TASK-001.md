---
id: "TASK-001"
title: "Complete Documentation Scaffold to AGENTS.md Quality Gates"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "0"
parent: "FEAT-001"
created: "2026-04-16"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/task, "phase/0"]
aliases: ["TASK-001"]
---

# Complete Documentation Scaffold to AGENTS.md Quality Gates

> [!INFO] `TASK-001` · Task · Phase 0 · Parent: [[tickets/FEAT-001]] · Status: `open`

## Description

Ensure every file in `docs/` satisfies the quality gates enumerated in `docs/AGENTS.md`. Specifically: every file must have correct YAML frontmatter (title, tags, aliases); every OFM spec file must have rule codes in the format `OFM-<DOMAIN>-NNN`; every BDD feature file must carry `@adr:ADRXXX` or `@rule:OFM-*` tags on every scenario; and every Planguage requirement must have all seven mandatory fields (Tag, Gist, Ambition, Scale, Meter, Fail, Goal). This task is complete when a cold-read agent can verify all quality gate checkboxes in `AGENTS.md` without finding any violations.

---

## Implementation Notes

- Work through each `docs/` subdirectory in the implementation order specified in `AGENTS.md`: `ofm-spec/` → `ddd/` → `architecture/` → `adr/` → `concepts/` → `design/` → `requirements/` → `bdd/` → `features/` → `plans/`
- For each file, check that frontmatter contains at minimum `title`, `tags`, and `aliases`
- For ADR files, confirm status is `accepted` or `superseded` — no `draft` ADRs may remain
- For Planguage requirements, all seven fields are mandatory: a requirement missing even one field is a documentation defect
- For BDD scenarios, the `@rule:` or `@adr:` tag must reference a rule code or ADR that actually exists
- See also: [[AGENTS]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Requirements layer is authored as part of this task; no pre-existing tags to link | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete. Link to the feature file; note the scenario title.

| Feature File | Scenario Title |
|---|---|
| — | BDD layer is authored as part of this task |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task. Follow TDD: the test file row is added here *before* implementation, when the test is in RED state.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — documentation-only task; no test files | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| — | No ADRs constrain documentation authoring; ADRs are an output of this task |

---

## Parent Feature

[[tickets/FEAT-001]] — Phase 0 — Documentation Scaffold

---

## Dependencies

**Blocked by:**

- Nothing — this is the first task in the project.

**Unblocks:**

- [[tickets/FEAT-002]] — Phase 1 can begin once this task is done and FEAT-001 is marked `done`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Every file in `docs/` has YAML frontmatter with `title`, `tags`, and `aliases`
- [ ] Every OFM construct in `ofm-spec/` has a rule code in format `OFM-<DOMAIN>-NNN`
- [ ] Every BDD scenario in `bdd/` has a `@rule:OFM-*` or `@adr:ADR*` tag
- [ ] Every Planguage requirement in `requirements/` has all seven fields: Tag, Gist, Ambition, Scale, Meter, Fail, Goal
- [ ] Every ADR in `adr/` is in `accepted` or `superseded` status (zero `draft` ADRs)
- [ ] Every feature in `features/` has at least one linked requirement in `requirements/`
- [ ] Every bounded context in `ddd/bounded-contexts` has a corresponding domain model file
- [ ] Every term used in implementation docs appears in `ddd/ubiquitous-language`
- [ ] Parent feature [[tickets/FEAT-001]] child task row updated to `in-review`

---

## Notes

This task has no `src/` deliverables and no test files. The Definition of Done is verified by structured review of the `docs/` tree, not by a CI test runner. A second agent performing a cold read of the repository and finding no AGENTS.md quality gate violations constitutes the acceptance signal.

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

> [!INFO] Opened — 2026-04-16
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-001]].

> [!CHECK] Done — 2026-04-17
> All 8 AGENTS.md quality gates verified passing. Gate 3: 14 missing ubiquitous-language terms added. Gate 5: 23 user requirements converted to full 7-field Planguage format. Gate 7: requirements created for code-actions, hover, semantic-tokens. Gate 8: transport.feature, code-actions.feature, and scaffold BDD scenario created. Remaining gates 1, 2, 4, 6 were already passing. Status: `done`.
