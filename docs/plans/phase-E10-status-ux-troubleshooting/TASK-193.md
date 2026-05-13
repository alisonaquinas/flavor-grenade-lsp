---
id: "TASK-193"
title: "Model rich status tooltip data"
type: task
status: green
priority: high
phase: E10
parent: "FEAT-028"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-027"]
tags: [tickets/task, "phase/E10"]
aliases: ["TASK-193"]
---

# Model rich status tooltip data

> [!INFO] `TASK-193` - Task - Phase E10 - Parent: [[FEAT-028]] - Status: `green`

## Description

Extend the status model and tooltip rendering so users can inspect server
state, server version, extension version, active vault root, vault count,
document count, and last error from the status item.

---

## Implementation Notes

- Keep tooltip values derived from client/server state already owned by the
  extension boundary
- Avoid exposing secrets, full command-line arguments, or user tokens
- Include unavailable fields explicitly when the server has not started
- See also: [[docs/ddd/editor-client/domain-model]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Status.Diagnostics` | Status tooltip exposes server, vault, version, and error details | [[docs/requirements/functional/vscode-extension-parity]] |
| `Extension.Status.QuickActions` | Tooltip detail supports applicable recovery actions | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Status tooltip shows server and vault diagnostic fields (planned scenario) |
| `docs/bdd/features/vscode-extension.feature` | Status bar reflects server lifecycle states |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/status-bar.test.ts` | Unit | `Extension.Status.Diagnostics` | failing |
| `extension/src/test/suite/status-tooltip.test.ts` | Integration | `Extension.Status.Diagnostics` | failing |

> After implementation, update the rows above and the corresponding rows in
> See [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR019-vscode-command-bridges-and-client-ux]] | The extension owns VS Code status UI behavior |

---

## Parent Feature

[[FEAT-028]] - Status UX And Troubleshooting

---

## Dependencies

**Blocked by:**

- [[FEAT-027]] - status host coverage should exist first

**Unblocks:**

- [[TASK-194]] - disabled and error states reuse tooltip data
- [[TASK-195]] - diagnostic copy should use sanitized status fields

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] Tooltip includes server state, server version, extension version, vault root, vault count, document count, and last error
- [x] Tooltip omits secrets and handles unavailable values predictably
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[docs/test/matrix]] row(s) updated to `passing`
- [ ] [[docs/test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-028]] child task row updated to `in-review`

---

## Notes

Prefer a small status view-model shape so [[TASK-195]] can reuse the same safe
fields for diagnostic copy output.

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
> Ticket created. Status: `open`. Parent: [[FEAT-028]].

> [!INFO] Red - 2026-05-07
> Added failing unit coverage for rich status tooltip fields and sanitized
> diagnostic data.

> [!SUCCESS] Green - 2026-05-07
> Added rich status view-model fields, sanitized tooltip rendering, and
> diagnostic-copy data. Extension unit, typecheck, build, and host tests pass.
