---
id: "{{TICKET-ID}}"
title: "{{TICKET-TITLE}}"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: draft
priority: "{{PRIORITY}}"
phase: "{{PHASE-NUMBER}}"
created: "{{DATE}}"
updated: "{{DATE}}"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/feature, "phase/{{PHASE-NUMBER}}"]
aliases: ["{{TICKET-ID}}"]
---

# {{TICKET-TITLE}}

> [!INFO] `{{TICKET-ID}}` · Feature · Phase {{PHASE-NUMBER}} · Priority: `{{PRIORITY}}` · Status: `draft`

## Goal

> Write one paragraph describing the user-visible outcome this feature delivers. Use vocabulary from [[ddd/ubiquitous-language]]. No implementation terms (TypeScript, NestJS, JSON-RPC) in this section — describe what vault authors or LSP users gain.

{{GOAL-DESCRIPTION}}

---

## Scope

**In scope:**

- {{SCOPE-ITEM-1}}
- {{SCOPE-ITEM-2}}

**Out of scope (explicitly excluded):**

- {{OUT-OF-SCOPE-ITEM-1}}
- {{OUT-OF-SCOPE-ITEM-2}}

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| `{{USER-REQ-TAG}}` | {{USER-REQ-GOAL}} | [[requirements/user/{{THEME-FILE}}]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| `{{FR-TAG}}` | {{FR-GIST}} | [[requirements/{{FEATURE-FILE}}]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| [[bdd/features/{{FEATURE-NAME}}]] | {{BDD-FEATURE-DESCRIPTION}} |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-{{NN}}-{{PHASE-SLUG}}]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] All scenarios in linked BDD feature files pass in CI
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]])
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0
- [ ] {{ADDITIONAL-CRITERION}}

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[tickets/{{TASK-ID}}]] | {{TASK-TITLE}} | `open` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- [[tickets/{{BLOCKING-TICKET-ID}}]] — {{REASON}}
- Phase {{N}} (see [[plans/execution-ledger]]) — {{REASON}}

**Unblocks:**

- [[tickets/{{UNBLOCKED-TICKET-ID}}]] — {{REASON}}

---

## Notes

> Optional section for design decisions, open questions, or context that does not belong in the Workflow Log.

{{NOTES}}

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

<!-- TEMPLATE USAGE: Replace the entry below with a real date when creating the ticket. -->

> [!INFO] Opened — {{DATE}}
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.
