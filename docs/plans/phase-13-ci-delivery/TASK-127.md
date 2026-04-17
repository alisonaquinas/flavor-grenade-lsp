---
id: "TASK-127"
title: "Add coverage upload step (Codecov)"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-126"]
tags: [tickets/task, "phase/13"]
aliases: ["TASK-127"]
---

# Add coverage upload step (Codecov)

> [!INFO] `TASK-127` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Add a `codecov/codecov-action@v4` step to the CI workflow (`.github/workflows/ci.yml`) immediately after the `bun test --coverage` step. The step must use `fail_ci_if_error: true` so that a Codecov upload failure blocks the CI run, and must read the `CODECOV_TOKEN` from GitHub Secrets (not from an environment variable directly in the workflow file).

---

## Implementation Notes

- Add to `.github/workflows/ci.yml` after `bun test --coverage`:
  ```yaml
  - uses: codecov/codecov-action@v4
    with:
      token: ${{ secrets.CODECOV_TOKEN }}
      files: coverage/lcov.info
      fail_ci_if_error: true
  ```
- `CODECOV_TOKEN` must be stored as a GitHub repository secret, not hardcoded
- See also: [[requirements/ci-cd]], [[adr/ADR008-oidc-publishing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Coverage tracking integrated with CI | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (CI infrastructure task, no Gherkin scenario) |

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
| [[adr/ADR008-oidc-publishing]] | CODECOV_TOKEN stored as secret, not plain env var |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-126]] — coverage upload step is added to the CI workflow created in TASK-126

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Coverage upload step present in CI YAML and CI run succeeds end-to-end
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

`fail_ci_if_error: true` ensures coverage regressions are visible immediately rather than silently skipped. If Codecov is not yet configured for the repository, this step should be added with `fail_ci_if_error: false` initially and switched once the token is set up.

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
