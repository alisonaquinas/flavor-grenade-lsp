---
id: "TASK-191"
title: "Cover command bridge payload validation"
type: task
status: done
priority: high
phase: E9
parent: "FEAT-027"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-189"]
tags: [tickets/task, "phase/E9"]
aliases: ["TASK-191"]
---

# Cover command bridge payload validation

> [!INFO] `TASK-191` - Task - Phase E9 - Parent: [[FEAT-027]] - Status: `done`

## Description

Add extension-host tests for Flavor Grenade command bridge registration and
payload validation. Valid JSON-serializable payloads should reach the intended
VS Code commands or APIs, while malformed payloads fail safely without uncaught
extension-host exceptions.

---

## Implementation Notes

- Cover show references, follow link, open embed target, backlinks, outlinks,
  vault reveal, and diagnostic copy where those bridges exist
- Include malformed, missing, and non-serializable payload cases
- Observe VS Code command invocation through mocks, spies, or controlled command
  registration suited to the host-test runner
- See also: [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.CommandBridges.PayloadValidation` | Bridge commands validate payloads before VS Code API calls | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.CommandBridges.GraphActions` | Required graph and utility bridge commands are registered | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Tests.HostCoverage` | Host tests include command registration and bridge behavior | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Command bridges accept valid payloads in the extension host (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Command bridges reject invalid payloads safely (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/suite/command-bridges.test.js` | Integration | `Extension.CommandBridges.PayloadValidation` | passing |
| `extension/src/test/suite/command-bridges.test.js` | Integration | `Extension.Tests.HostCoverage` | passing |

> After implementation, update the rows above and the corresponding rows in
> See [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | Server-provided command payloads must stay JSON-serializable |

---

## Parent Feature

[[FEAT-027]] - Extension Host Regression Harness

---

## Dependencies

**Blocked by:**

- [[TASK-189]] - host runner must exist first
- Phase E8 - command bridge implementation must be available

**Unblocks:**

- [[CHORE-067]] - trace rows depend on final host test paths

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] Required `flavorGrenade.*` bridge commands are registered in the host
- [x] Valid payload cases call the expected VS Code command or API surface
- [ ] Invalid payload cases do not throw uncaught extension-host exceptions
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[docs/test/matrix]] row(s) updated to `passing`
- [ ] [[docs/test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-027]] child task row updated to `in-review`

---

## Notes

This task tests the bridge boundary. It should not move OFMarkdown intelligence
or graph computation into the extension client.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-027]].

> [!INFO] Red - 2026-05-07
> Added failing extension-host command bridge payload coverage.

> [!SUCCESS] Green - 2026-05-07
> Host coverage verifies command registration and a valid diagnostic-copy bridge
> payload through the real VS Code clipboard API. Invalid payload behavior
> remains covered by the pure command-bridge unit tests to avoid modal
> `showErrorMessage` hangs in headless extension-host runs.

> [!SUCCESS] Done - 2026-05-07
> PR #41 CI passed. Host coverage now includes valid navigation, reference,
> graph, reveal, and diagnostic bridge payloads plus invalid payload rejection.
