---
id: "FEAT-002"
title: "Project Scaffold"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: in-progress
priority: "high"
phase: "1"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["FEAT-001"]
tags: [tickets/feature, "phase/1"]
aliases: ["FEAT-002"]
---

# Project Scaffold

> [!INFO] `FEAT-002` · Feature · Phase 1 · Priority: `high` · Status: `draft`

## Goal

Bootstrap a working NestJS + Bun + TypeScript project skeleton that compiles cleanly, has the correct directory structure, and is ready to receive LSP transport code in Phase 2. No LSP logic is implemented in this phase — only the project skeleton. When this feature is complete, the project can be built, linted, and tested with zero errors, providing a stable foundation for all subsequent phases.

---

## Scope

**In scope:**

- Initialising the Bun project with `package.json` correctly configured
- Installing all required runtime and development dependencies
- Configuring TypeScript (`tsconfig.json`), Bun (`bunfig.toml`), ESLint, and Prettier
- Creating the `src/main.ts` entry point and `LspModule` skeleton
- Creating the `.flavor-grenade.toml` project configuration marker
- Establishing the canonical `src/` directory structure
- Creating `.gitignore`
- Defining all `package.json` scripts including the `gate:1` command

**Out of scope (explicitly excluded):**

- Any LSP protocol handler logic (Phase 2)
- Any OFM parser implementation (Phase 3)
- Any vault indexing logic (Phase 4)
- Any actual test files with business logic (later phases)

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | No user-visible behaviour delivered in this phase | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Infrastructure scaffold; functional requirements addressed in later phases | [[requirements/index]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | No BDD scenarios target the scaffold phase directly |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-01-scaffold]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `bun run build` exits 0 (TypeScript compiles without errors)
- [ ] `bun test` exits 0 (no failing tests; zero test files is acceptable at this phase)
- [ ] `bun run lint` exits 0 (ESLint clean on all `src/` files)
- [ ] All child TASK tickets (TASK-002 through TASK-016) are in `done` state
- [ ] CHORE-001 (Lint Sweep) is in `done` state
- [ ] CHORE-002 (Code Quality Sweep) is in `done` state
- [ ] CHORE-003 (Security Sweep) is in `done` state
- [ ] [[plans/execution-ledger]] row for Phase 1 updated to `done`

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-002]] | Initialize Bun project | `open` |
| [[tickets/TASK-003]] | Install NestJS core packages | `open` |
| [[tickets/TASK-004]] | Install LSP protocol types | `open` |
| [[tickets/TASK-005]] | Install development tooling | `open` |
| [[tickets/TASK-006]] | Install test dependencies | `open` |
| [[tickets/TASK-007]] | Configure tsconfig.json | `open` |
| [[tickets/TASK-008]] | Configure bunfig.toml | `open` |
| [[tickets/TASK-009]] | Create src/main.ts — NestJS bootstrap | `open` |
| [[tickets/TASK-010]] | Create LspModule skeleton | `open` |
| [[tickets/TASK-011]] | Create .flavor-grenade.toml project config marker | `open` |
| [[tickets/TASK-012]] | Configure ESLint | `open` |
| [[tickets/TASK-013]] | Configure Prettier | `open` |
| [[tickets/TASK-014]] | Create package.json scripts | `open` |
| [[tickets/TASK-015]] | Create project directory structure | `open` |
| [[tickets/TASK-016]] | Create .gitignore | `open` |
| [[tickets/CHORE-001]] | Phase 1 Lint Sweep | `open` |
| [[tickets/CHORE-002]] | Phase 1 Code Quality Sweep | `open` |
| [[tickets/CHORE-003]] | Phase 1 Security Sweep | `open` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- [[tickets/FEAT-001]] — Phase 0 (Documentation Scaffold) must be complete; all `docs/` quality gates must pass before any `src/` files are written.

**Unblocks:**

- [[tickets/FEAT-003]] — Phase 2 (LSP Transport) can begin once the project skeleton compiles and the gate command passes.

---

## Notes

Tasks in this phase are primarily infrastructure and can be executed sequentially in the order listed (TASK-002 through TASK-016). Dependency order matters: TASK-002 (init) and TASK-003 through TASK-006 (installs) should complete before configuration tasks (TASK-007 through TASK-013), which should complete before TASK-014 (scripts), TASK-015 (dirs), and TASK-016 (gitignore). The three chores run after all TASK tickets are done.

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

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Phase 1 Project Scaffold feature defined; all child tasks (TASK-002 through TASK-016) and chores (CHORE-001 through CHORE-003) created. Blocked by FEAT-001 until Phase 0 documentation quality gates pass.

> [!INFO] In-progress — 2026-04-17
> Phase 0 documentation scaffold complete and committed. Phase 1 execution begins. Execution ledger updated: Phase 0 ✅ complete, Phase 1 🔄 in-progress. Feature branch `feature/phase-01-scaffold` created from develop. Status: `in-progress`.
