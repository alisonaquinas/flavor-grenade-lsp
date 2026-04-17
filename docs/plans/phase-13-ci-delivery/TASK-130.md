---
id: "TASK-130"
title: "Create release workflow"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-129"]
tags: [tickets/task, "phase/13"]
aliases: ["TASK-130"]
---

# Create release workflow

> [!INFO] `TASK-130` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Create `.github/workflows/release.yml` — a workflow triggered on `v*.*.*` semver tags. It uses a matrix strategy across four targets (linux-x64, darwin-arm64, darwin-x64, win-x64) to build per-platform binaries using `bun run build:binary`, renames each binary with the target suffix, uploads the artifacts, and then creates a GitHub Release via `softprops/action-gh-release@v2` with all four binaries attached and auto-generated release notes.

---

## Implementation Notes

- Trigger: `push.tags: ['v[0-9]+.[0-9]+.[0-9]+']`
- Matrix:
  - `{os: ubuntu-latest, target: linux-x64, binary: flavor-grenade-lsp}`
  - `{os: macos-latest, target: darwin-arm64, binary: flavor-grenade-lsp}`
  - `{os: macos-13, target: darwin-x64, binary: flavor-grenade-lsp}`
  - `{os: windows-latest, target: win-x64, binary: flavor-grenade-lsp.exe}`
- Steps: checkout, setup-bun, `bun install --frozen-lockfile`, `bun run build:binary`, rename binary with target suffix, upload artifact
- `create-release` job: `needs: build-binaries`, downloads all `binary-*` artifacts, creates GitHub Release with `softprops/action-gh-release@v2` and `generate_release_notes: true`
- See also: [[adr/ADR008-oidc-publishing]], [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Automated binary release on semver tags | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (release infrastructure task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `.github/workflows/release.yml` | CI config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Release workflow uses OIDC-aligned token management for GitHub Release creation |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-129]] — release workflow invokes `bun run build:binary` scripts

**Unblocks:**

- [[tickets/TASK-131]] — npm publish step is added to the release workflow

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Tagging `v0.1.0` on a test branch triggers the workflow and produces 4 binary artifacts
- [ ] GitHub Release created with all 4 binaries attached
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

`macos-13` is used for `darwin-x64` because `macos-latest` on GitHub Actions now defaults to an arm64 runner. The shell rename step uses bash explicitly (`shell: bash`) to ensure the conditional works on Windows runners.

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
