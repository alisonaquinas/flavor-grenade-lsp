---
id: "FEAT-001"
title: "Phase 0 — Documentation Scaffold"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: in-progress
priority: "high"
phase: "0"
created: "2026-04-16"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/feature, "phase/0"]
aliases: ["FEAT-001"]
---

# Phase 0 — Documentation Scaffold

> [!INFO] `FEAT-001` · Feature · Phase 0 · Priority: `high` · Status: `in-progress`

## Goal

Complete the `docs/` tree so that all quality gates in `docs/AGENTS.md` are satisfied. Every documentation layer — from `ofm-spec/` through `plans/` — must be present, internally consistent, and conformant before any implementation file is written. This phase delivers no LSP behaviour; it delivers the specification surface that makes all subsequent phases verifiable.

---

## Scope

**In scope:**

- All `docs/` layer directories populated with correctly-formed files
- Every file carrying valid YAML frontmatter per AGENTS.md conventions
- All OFM constructs assigned rule codes in `ofm-spec/`
- All Planguage requirements carrying all seven mandatory fields
- All BDD scenarios tagged with at least one `@rule:OFM-*` or `@adr:ADR*` tag
- All ADRs in `accepted` or `superseded` status (no drafts)

**Out of scope (explicitly excluded):**

- Any TypeScript implementation files in `src/`
- Any runtime configuration or infrastructure
- Phase 1 and later tasks

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Requirements layer not yet authored (Phase 0 task) | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Requirements layer not yet authored (Phase 0 task) | [[requirements/index]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | BDD layer not yet authored (Phase 0 task) |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-00-docs-scaffold]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] Every OFM construct has a rule code in `ofm-spec/` (format: `OFM-<DOMAIN>-NNN`)
- [ ] Every bounded context in `ddd/bounded-contexts` has a corresponding domain model file
- [ ] Every term in implementation documentation appears in `ddd/ubiquitous-language`
- [ ] Every ADR is in `accepted` or `superseded` status (no drafts)
- [ ] Every Planguage requirement includes all seven fields: Tag, Gist, Ambition, Scale, Meter, Fail, Goal
- [ ] Every BDD scenario references at least one OFM rule code or ADR number via `@rule:` or `@adr:` tag
- [ ] Every feature in `features/` has at least one corresponding requirement in `requirements/`
- [ ] Every phase in `plans/` maps to at least one BDD scenario

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-001]] | Complete Documentation Scaffold to AGENTS.md Quality Gates | `open` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- Nothing — this is the first phase.

**Unblocks:**

- [[tickets/FEAT-002]] — Phase 1 (Project Scaffold) cannot begin until all `docs/` quality gates pass.

---

## Notes

This feature has no TypeScript deliverables. It is complete when every checklist item in the `docs/AGENTS.md` Quality Gates section is satisfied and can be independently verified by a new agent reading the repo cold.

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

> [!INFO] Opened — 2026-04-16
> Ticket created. Status: `in-progress`. Documentation scaffold phase initiated; TASK-001 created as child task.
