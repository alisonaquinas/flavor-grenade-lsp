---
id: "TASK-135"
title: "Set up branch protection rules (manual)"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-135"]
---

# Set up branch protection rules (manual)

> [!INFO] `TASK-135` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Configure GitHub repository branch protection rules for the `main` branch via the GitHub repository settings UI. This is a manual human task — it cannot be automated by an LLM agent. Rules to enable: require CI to pass before merge, require at least 1 reviewer approval for PRs to `main`, require linear history (no merge commits), and enable "Require branches to be up to date before merging".

---

## Implementation Notes

- Go to: GitHub repository → Settings → Branches → Branch protection rules → Add rule for `main`
- Enable:
  - "Require status checks to pass before merging" — select the CI job names
  - "Require at least 1 approving review"
  - "Require linear history"
  - "Require branches to be up to date before merging"
- This is a manual human task; no code changes are required
- See also: [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Branch protection enforcing CI and review gate for main | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (manual configuration task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | Manual verification | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Branch protection is a prerequisite for safe automated publishing |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Branch protection rule for `main` created in GitHub repository settings
- [ ] Required status checks include CI matrix jobs
- [ ] At least 1 required reviewer configured
- [ ] Linear history enforced
- [ ] "Require branches to be up to date" enabled
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

This task requires human access to the GitHub repository settings. An LLM agent cannot complete it autonomously. Mark this ticket `done` only after a human has confirmed the branch protection rules are active.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-014]]. Note: this is a manual human task; LLM agents cannot complete it autonomously.
