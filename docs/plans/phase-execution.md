---
title: Phase Execution Procedure
tags: [plans/meta, planning, process, phases, ops]
aliases: [Phase Ops, Execution Procedure, Phase Lifecycle]
---

# Phase Execution Procedure

This document defines the operational rules for executing implementation phases in `flavor-grenade-lsp`. All agents and human reviewers must follow this procedure when working through a phase.

---

## Rule 1 — Phases Execute Sequentially

Phases execute strictly one at a time. No phase begins until the previous phase's gate is passing in CI. See the dependency graph and gate commands in [[plans/execution-ledger]].

**Exception:** Phases 6, 7, and 8 may proceed in parallel once Phase 5 is complete (see [[plans/execution-ledger]] Phase Dependencies).

---

## Rule 2 — Tickets Within a Phase May Run in Parallel

Implementation `TASK` tickets within a phase may be executed in parallel using:

- **Subagents**: separate Claude Code sessions coordinated by a parent agent, each owning one or more TASK tickets
- **Git worktrees**: `git worktree` checkouts so each agent works on an isolated branch, merged back via PR after the gate passes

**Coordination rules:**

- Each agent takes exclusive ownership of specific TASK ticket(s); no two agents own the same ticket simultaneously
- Agents must not modify `src/` files that belong to another agent's active ticket
- `CHORE` tickets (lint sweep, code quality sweep, security sweep) run **after** all `TASK` tickets in the phase are `done`; they run serially to avoid merge conflicts

---

## Rule 3 — Ticket Lifecycle is Mandatory

Each ticket type has a defined lifecycle state machine. Agents must follow it without skipping states.

| Ticket Type | Lifecycle Document | Initial State |
|---|---|---|
| Feature | [[templates/tickets/lifecycle/feature-lifecycle]] | `draft` |
| Task | [[templates/tickets/lifecycle/task-lifecycle]] | `open` |
| Bug | [[templates/tickets/lifecycle/bug-lifecycle]] | `open` |
| Chore | [[templates/tickets/lifecycle/chore-lifecycle]] | `open` |
| Spike | [[templates/tickets/lifecycle/spike-lifecycle]] | `open` |

The `TASK` lifecycle enforces a strict **RED → GREEN** TDD cycle. The failing test commit must precede the implementation commit in git history. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Rule 4 — No Phase is Complete with Open Tickets

A phase cannot be marked `complete` in [[plans/execution-ledger]] if any ticket in its phase folder has a non-terminal status. Terminal statuses are: `done`, `wont-fix`, `duplicate`, `cancelled`, `output-delivered`, `inconclusive`.

---

## Rule 5 — Every Issue Found in Steps E–L Must Be Ticketed Before It Is Fixed

Any defect, warning, code smell, security finding, or test failure discovered during steps E through L must be captured as a ticket **before** any corrective action is taken. Silent fixes — edits made without a corresponding ticket — are a process violation.

**Applies to all sweep and test steps:**

| Step | Ticket type to open | Severity guidance |
|---|---|---|
| E (Lint sweep) | `CHORE-NNN` or `BUG-NNN` | Lint errors that change behaviour → BUG; style/config → CHORE |
| F (Code quality sweep) | `CHORE-NNN` or `BUG-NNN` | Structural violations → CHORE; logic defects → BUG |
| G (Security sweep) | `BUG-NNN` with `severity: high` or `critical` | All security findings are BUGs, never CHOREs |
| H (Fix sweep tickets) | Follow existing ticket lifecycle | No new code outside a ticket's declared scope |
| I (Unit tests) | `BUG-NNN` per non-trivial failure | Trivial fixture typos may be fixed inline; logic failures require a ticket |
| J (Integration tests) | `BUG-NNN` per failure | All integration failures require a ticket |
| K (Verification tests) | `BUG-NNN` per failure | All verification failures require a ticket |
| L (Validation / BDD) | `BUG-NNN` per failing scenario | Each failing BDD scenario is a separate ticket |

**Workflow for each finding:**

1. Open the ticket (assign next globally-sequential ID for that type)
2. Set status to `open`
3. Transition to `triaged` once root cause is confirmed
4. Fix via the ticket's lifecycle (regression test first for BUGs)
5. Close the ticket before moving to the next phase step
6. Append the ticket ID to the relevant step's output in the Workflow Log of the phase's FEAT ticket

> [!WARNING] An agent that fixes a failing test, lint error, or security finding without first opening a ticket is in violation of this rule. The corrective commit will be rejected in code review.

---

## Phase Lifecycle Checklist

Every phase must complete steps A through M in order. No step may be skipped.

### Step A — Evaluate Phase Tickets

1. Read the phase folder index: `docs/plans/phase-NN-*/index.md`
2. Read each `FEAT-NNN` and `TASK-NNN` ticket in the phase
3. Confirm all tickets have accurate descriptions, linked requirements, and linked BDD scenarios
4. Identify any gaps (missing tasks, incorrect scope) and **open new tickets** as needed before proceeding
5. If any prerequisite phase is not `complete` in [[plans/execution-ledger]], **stop** — do not begin implementation

### Step B — Update Phase Tickets

1. Update any ticket whose scope has shifted since creation (mark changes in the Workflow Log)
2. Resolve all `{{PLACEHOLDER}}` text in `TASK` tickets
3. Confirm all cross-references (requirements, BDD features, ADRs) are correct and the linked files exist
4. If a task is superseded by events (e.g., a dependency changed its API), update the ticket description and open a `SPIKE` if the approach needs re-evaluation

### Step C — Add Implementation Details to Tickets

Before any coding begins, update each `TASK` ticket with:

1. Specific file paths to create or modify (`src/...`)
2. API shapes: TypeScript interfaces, function signatures, class structure
3. Test file paths (to be written **RED** before any implementation code)
4. Any ADR constraints that apply to this task's implementation

A task should not transition from `open` to `red` until this step is complete for that task.

### Step D — Implement Tickets

Execute `TASK` tickets, following the TDD lifecycle (`open → red → green → refactor → in-review → done`):

1. Write the failing test first; commit alone (**RED** commit)
2. Write minimum implementation to make the test pass; commit (**GREEN** commit)
3. Refactor if needed — all tests must remain green
4. Update `Linked Tests` rows in the ticket and the corresponding rows in [[test/matrix]] and [[test/index]]
5. Open additional `TASK` or `BUG` tickets as implementation reveals new requirements or defects
6. Mark tickets `done` only after CI confirms green — not just local green

### Step E — Lint Sweep

Work through the phase's lint `CHORE` ticket (`CHORE-NNN — Lint Sweep`):

1. Run `bun run lint --max-warnings 0`
2. Fix all warnings and errors; commit each fix
3. If a lint fix would change observable LSP behavior, convert it to a `TASK` ticket instead
4. Re-run until `bun run lint --max-warnings 0` exits 0
5. Also run `tsc --noEmit` — exits 0 required
6. Mark the lint `CHORE` ticket `done`

### Step F — Code Quality Sweep

Work through the phase's code quality `CHORE` ticket (`CHORE-NNN — Code Quality Sweep`):

1. Review all new `src/` files introduced in this phase for:
   - Naming consistency with [[ddd/ubiquitous-language]]
   - Module boundary violations (cross-module imports that bypass barrel `index.ts` files)
   - Code smells: deep nesting (> 3 levels), functions > 40 lines, magic numbers without named constants
   - Missing JSDoc on exported symbols
2. Open a `BUG` or `CHORE` ticket for each issue found
3. Fix all issues opened in this sweep
4. Re-run `tsc --noEmit` after changes
5. Mark the code quality `CHORE` ticket `done`

### Step G — Security Sweep

Work through the phase's security `CHORE` ticket (`CHORE-NNN — Security Sweep`):

1. Review all new code for:
   - **Path traversal risks**: verify every file path operation is confined to vault root (see [[adr/ADR013-vault-root-confinement]])
   - **Input validation**: all LSP-received strings must be validated before use in file paths or `eval`-adjacent operations
   - **Supply chain**: any new `npm` dependencies added this phase must have a rationale comment; check for known vulnerabilities via `bun audit`
   - **Information disclosure**: error messages must not leak absolute host paths or vault content to LSP clients
2. Open `BUG` tickets (severity `high` or `critical`) for each finding
3. Fix all security `BUG` tickets before proceeding to step H

### Step H — Fix All New Tickets

After steps E, F, and G, there will typically be new `BUG` and `CHORE` tickets. Work through all of them:

1. Triage each `BUG` ticket (`open → triaged`)
2. Implement fixes using the bug lifecycle (regression test first)
3. Do not proceed to step I until **all tickets opened in steps E, F, and G are closed**

### Step I — Run Unit Tests

1. Run `bun test src/`
2. Fix all failing tests; open `BUG` tickets for each non-trivial failure
3. Update [[test/matrix]] and [[test/index]] rows
4. Repeat until `bun test src/` exits 0 with zero failures and zero skipped tests

### Step J — Run Integration Tests

1. Check whether `tests/integration/` contains any `.test.ts` or `.spec.ts` files
   - **If no test files exist:** mark this step **N/A** — note "no integration tests in this phase" in the Step M retrospective; proceed to Step K
   - **If test files exist:** run `bun test tests/integration/`
2. Fix all failures; open `BUG` tickets as needed (Rule 5)
3. Repeat until clean

### Step K — Run Verification Tests

1. Check whether `tests/verification/` contains any `.test.ts` or `.spec.ts` files
   - **If no test files exist:** mark this step **N/A** — note in retrospective; proceed to Step L
   - **If test files exist:** run `bun test tests/verification/`
2. Fix all failures; open `BUG` tickets as needed (Rule 5)
3. Repeat until clean

### Step L — Run Validation Tests

1. Check whether `tests/validation/` contains any `.test.ts` or `.spec.ts` files
   - **If no test files exist:** mark this step **N/A** — note in retrospective; proceed to BDD check
   - **If test files exist:** run `bun test tests/validation/`; fix all failures
2. Run all BDD `@smoke` scenarios: `bun run bdd -- --tags @smoke`
   - **If cucumber is not yet configured for this phase:** mark BDD check **N/A** and note in retrospective
3. Fix any failing BDD scenarios; open `BUG` tickets per Rule 5
4. Repeat until all pass

### Step M — Phase Retrospective

Document what was learned during this phase. The retrospective is written directly into the phase's `FEAT-NNN.md` ticket under a `## Retrospective` section appended to the file. It is **not** a separate document.

The retrospective must cover:

1. **What went as planned** — tasks or estimates that proved accurate; approaches that worked well
2. **What deviated from the plan** — tasks that took longer or shorter than expected; approaches that had to change mid-flight; tickets that were opened during sweeps or tests (list by ID)
3. **Process observations** — anything the A–M checklist did not anticipate; steps that felt redundant or were missing
4. **Carry-forward actions** — concrete changes to apply to the *next* phase's planning: updated time estimates, scope adjustments, new SPIKE tickets opened, ADR amendments needed
5. **Rule or template updates** — if any process rule (Rules 1–5), ticket template, or lifecycle document should be amended based on this phase's experience, open a documentation CHORE ticket and reference it here

**Format:** append to `FEAT-NNN.md` as follows:

```markdown
## Retrospective

> Written after Step L passes. Date: YYYY-MM-DD.

### What went as planned
...

### Deviations and surprises
| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-NNN | Bug | ... | +N h |
| CHORE-NNN | Chore | ... | +N h |

### Process observations
...

### Carry-forward actions
- [ ] ...

### Rule / template amendments
- [ ] CHORE-NNN — <description> (or "none")
```

> [!NOTE] A retrospective with all sections left blank is a documentation defect. Write at least one sentence per section. "Nothing to report" is acceptable only for carry-forward actions and rule amendments when truly nothing changed.

---

## Phase Completion

A phase is complete **only** when ALL of the following are true:

- [ ] Steps A through **M** executed to completion (no step skipped)
- [ ] All `TASK`, `CHORE`, and `BUG` tickets in the phase folder are in a terminal state
- [ ] The phase gate command passes in CI on all three platforms (linux-x64, darwin-arm64, win-x64)
- [ ] The execution ledger row shows `✅ complete` with a completion date
- [ ] A PR linking the phase work is open or merged
- [ ] `FEAT-NNN.md` contains a completed `## Retrospective` section

The AI agent must NOT mark a phase `complete` without CI confirmation. The CI gate is authoritative. See [[plans/execution-ledger]] for gate commands.

---

## Related

- [[plans/execution-ledger]] — Phase status table and gate commands
- [[AGENTS]] — Repository-level agent guidance
- [[templates/tickets/index]] — Ticket template reference and ID conventions
- [[requirements/code-quality]] — `Quality.TDD.StrictRedGreen` and quality requirements
- [[adr/ADR013-vault-root-confinement]] — Security constraint for path operations
- [[adr/ADR014-dependency-security-policy]] — Supply chain rules
