---
id: "TASK-126"
title: "Create GitHub Actions CI workflow"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-126"]
---

# Create GitHub Actions CI workflow

> [!INFO] `TASK-126` · Task · Phase 13 · Parent: [[FEAT-014]] · Status: `open`

## Description

Create `.github/workflows/ci.yml` — a CI workflow that runs on every push and pull request to `main`. The workflow uses a matrix strategy across three operating systems (ubuntu-latest, macos-latest, windows-latest) with bun 1.1, running checkout, setup-bun, install, build, lint, test with coverage, BDD @smoke scenarios, and cucumber report artifact upload.

---

## Implementation Notes

- Trigger: `push` to `main` and `pull_request` to `main`
- Matrix: `os: [ubuntu-latest, macos-latest, windows-latest]` × `bun-version: ['1.1']`
- Steps: `actions/checkout@v4`, `oven-sh/setup-bun@v2`, `bun install --frozen-lockfile`, `bun run build`, `bun run lint`, `bun test --coverage`, `bun run bdd -- --tags @smoke`, `actions/upload-artifact@v4` (cucumber-report, `if: always()`)
- Artifact name: `cucumber-report-${{ matrix.os }}`
- See also: [[requirements/ci-cd]], [[adr/ADR008-oidc-publishing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Automated CI testing on all three target platforms | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | All `@smoke`-tagged scenarios |

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
| [[adr/ADR008-oidc-publishing]] | CI workflow must follow OIDC token management conventions |

---

## Parent Feature

[[FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-127]] — coverage upload requires the CI workflow job to exist
- [[TASK-128]] — full BDD job needs the base CI job to complete first (`needs: test`)

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] CI workflow file parses without errors (validated by `actionlint` or first CI run)
- [ ] CI green on all three matrix platforms for a test PR
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-014]] child task row updated to `in-review`

---

## Notes

Use `--frozen-lockfile` on `bun install` to prevent lockfile drift during CI. The `if: always()` guard on the cucumber report upload ensures the report is preserved even when tests fail.

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
> Ticket created. Status: `open`. Parent: [[FEAT-014]].
