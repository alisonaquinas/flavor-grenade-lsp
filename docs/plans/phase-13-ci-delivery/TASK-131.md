---
id: "TASK-131"
title: "Configure npm publish"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-130"]
tags: [tickets/task, "phase/13"]
aliases: ["TASK-131"]
---

# Configure npm publish

> [!INFO] `TASK-131` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Update `package.json` to set the npm package name to `@flavor-grenade/lsp-server`, add `bin`, `files`, and `publishConfig` fields. Then add a `publish-npm` job to `.github/workflows/release.yml` that runs `npm publish` with `NODE_AUTH_TOKEN` sourced from GitHub Secrets, ensuring no long-lived npm tokens are stored in the workflow file.

---

## Implementation Notes

- Update `package.json`:
  ```json
  {
    "name": "@flavor-grenade/lsp-server",
    "version": "0.1.0",
    "bin": {
      "flavor-grenade-lsp": "dist/flavor-grenade-lsp"
    },
    "files": ["dist/", "README.md", "LICENSE"],
    "publishConfig": { "access": "public" }
  }
  ```
- Add `publish-npm` job to `release.yml`:
  ```yaml
  publish-npm:
    needs: create-release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```
- `NODE_AUTH_TOKEN` must come from GitHub Secrets; never hardcode or expose in logs
- See also: [[adr/ADR008-oidc-publishing]], [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | npm package publishing as part of release automation | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (publish infrastructure task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `package.json` | Config | — | 🔴 failing |
| `.github/workflows/release.yml` | CI config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | npm publish uses NODE_AUTH_TOKEN from secrets; no long-lived tokens in workflow YAML |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-130]] — `publish-npm` job is added to the release workflow created in TASK-130

**Unblocks:**

- None

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] `npm publish --dry-run` exits 0 locally
- [ ] `package.json` fields `name`, `bin`, `files`, `publishConfig` correct
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

`npm publish --dry-run` is the acceptance gate for this task. The actual publish to the npm registry requires the `NPM_TOKEN` secret to be configured in the GitHub repository settings, which is a human prerequisite.

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
