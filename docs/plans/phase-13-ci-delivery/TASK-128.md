---
id: "TASK-128"
title: "Create full BDD workflow (separate job)"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-126"]
tags: [tickets/task, "phase/13"]
aliases: ["TASK-128"]
---

# Create full BDD workflow (separate job)

> [!INFO] `TASK-128` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Add a separate `bdd-full` job to `.github/workflows/ci.yml` that runs the full BDD scenario suite (not just `@smoke`-tagged scenarios) after the main `test` job completes. The job uses `continue-on-error: true` initially so it does not block PR merges while not all scenarios are passing, and it runs only on ubuntu-latest to reduce cost.

---

## Implementation Notes

- Add `bdd-full` job to `ci.yml`:
  ```yaml
  bdd-full:
    needs: test
    runs-on: ubuntu-latest
    continue-on-error: true  # Remove when all scenarios pass
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: '1.1'
      - run: bun install --frozen-lockfile
      - run: bun run bdd
  ```
- `continue-on-error: true` is intentional and should be removed once all BDD scenarios pass
- See also: [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Full BDD suite run informally in CI without blocking merges | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | All scenarios (not filtered by tag) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `.github/workflows/ci.yml` | CI config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | CI follows token management conventions |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-126]] — `bdd-full` job depends on the base `test` job from TASK-126

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] `bdd-full` job appears in GitHub Actions UI and runs without workflow parse errors
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

The `continue-on-error: true` flag is a temporary measure. Once all BDD scenarios achieve `@smoke` coverage, this flag should be removed and the job should block merges.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-014]].
