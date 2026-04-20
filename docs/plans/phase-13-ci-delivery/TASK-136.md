---
id: "TASK-136"
title: "Add CHANGELOG.md automation"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-136"]
---

# Add CHANGELOG.md automation

> [!INFO] `TASK-136` · Task · Phase 13 · Parent: [[FEAT-014]] · Status: `open`

## Description

Configure `release-please` or `conventional-changelog` to automatically generate and maintain `CHANGELOG.md` entries from conventional commit messages. The tooling must produce changelog sections for `feat:`, `fix:`, `chore:`, and `docs:` commit types, and integrate with the existing release workflow.

---

## Implementation Notes

- Evaluate `release-please` (Google) vs `conventional-changelog` CLI
  - Preferred: `release-please` as a GitHub Actions step (`google-github-actions/release-please-action`)
  - Alternative: `conventional-changelog-cli` run locally and committed
- If using `release-please`:
  - Add `release-please.yml` GitHub Actions workflow triggered on push to `main`
  - Configure `release-type: node` and `package-name: @flavor-grenade/lsp-server`
- Ensure conventional commit format is followed: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- See also: [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Automated CHANGELOG generation from conventional commits | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | — (tooling configuration task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `CHANGELOG.md` | Output | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Changelog automation must not require long-lived tokens in workflow YAML |

---

## Parent Feature

[[FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `CHANGELOG.md` is generated or updated automatically on release
- [ ] Changelog sections cover at minimum `feat:`, `fix:`, and `chore:` commit types
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-014]] child task row updated to `in-review`

---

## Notes

Conventional commits must be enforced consistently for the automation to produce meaningful output. Consider adding `commitlint` as a pre-commit hook if not already in place.

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
