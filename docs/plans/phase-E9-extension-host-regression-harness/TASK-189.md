---
id: "TASK-189"
title: "Add extension-host test runner and fixtures"
type: task
status: done
priority: high
phase: E9
parent: "FEAT-027"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: []
tags: [tickets/task, "phase/E9"]
aliases: ["TASK-189"]
---

# Add extension-host test runner and fixtures

> [!INFO] `TASK-189` - Task - Phase E9 - Parent: [[FEAT-027]] - Status: `done`

## Description

Add the extension-host test command, bootstrap, and fixture workspaces needed to
run VS Code API integration tests from `extension/`. The harness must support
vault, Flavor Grenade config, and generic Markdown workspaces without depending
on a user's local vault.

---

## Implementation Notes

- Prefer a standard VS Code extension-host runner that can execute tests under
  `extension/`
- Add fixtures for `.obsidian/`, `.flavor-grenade.toml`, and generic Markdown
  workspaces
- Keep test setup deterministic and free of user-machine paths
- See also: [[plans/phase-E9-extension-host-regression-harness]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host tests must cover required client behavior groups | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Extension-host regression suite is runnable from the extension package (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/suite/extension-host.test.js` | Integration | `Extension.Tests.HostCoverage` | passing |
| `extension/test-fixtures/workspaces/obsidian-vault/` | Fixture | `Extension.Tests.HostCoverage` | passing |
| `extension/test-fixtures/workspaces/flavor-config-vault/` | Fixture | `Extension.Tests.HostCoverage` | passing |
| `extension/test-fixtures/workspaces/generic-markdown/` | Fixture | `Extension.Tests.HostCoverage` | passing |

> After implementation, update the rows above and the corresponding rows in
> See [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR019-vscode-command-bridges-and-client-ux]] | Keep VS Code integration in the extension client |

---

## Parent Feature

[[FEAT-027]] - Extension Host Regression Harness

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-190]] - activation and language-mode tests need the host runner
- [[TASK-191]] - command bridge tests need the host runner
- [[TASK-192]] - status and failure tests need the host runner

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] `extension/` exposes a host-test command that can run locally
- [x] Fixture workspaces cover vault, config vault, and generic Markdown cases
- [x] Host tests avoid user-specific paths and network access
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] [[test/matrix]] row(s) updated to `passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-027]] child task row updated to `in-review`

---

## Notes

This task creates the test surface only. Behavior-specific assertions belong in
[[TASK-190]], [[TASK-191]], and [[TASK-192]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-027]].

> [!INFO] Red - 2026-05-07
> Added failing extension-host runner, Mocha suite entrypoint, and fixture
> workspaces. `npm run test:host` fails until host-test dependencies are added.

> [!SUCCESS] Green - 2026-05-07
> Added `@vscode/test-electron` runner, isolated temp fixture workspaces, and
> host-test suite bootstrap. `npm run test:host -- all` passes across Obsidian,
> Flavor Grenade config, and generic Markdown fixtures.

> [!SUCCESS] Done - 2026-05-07
> PR #41 CI passed; host runner and fixture setup are complete.
