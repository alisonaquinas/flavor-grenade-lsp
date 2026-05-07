---
id: "TASK-210"
title: "Refresh membership after workspace and editor events"
type: task
status: in-review
priority: medium
phase: E14
parent: "FEAT-032"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-209"]
tags: [tickets/task, "phase/E14"]
aliases: ["TASK-210"]
---

# Refresh membership after workspace and editor events

> [!INFO] `TASK-210` - Task - Phase E14 - Parent: [[FEAT-032]] - Status: `in-review`

## Description

Refresh document membership after workspace folder changes, visible editor
changes, and file-open events. Documents should enter `ofmarkdown` mode when a
vault becomes visible and leave only through the guarded reversion path.

---

## Implementation Notes

- Subscribe to workspace folder, visible editor, and open-document events.
- Debounce or batch refreshes enough to avoid duplicate membership requests.
- Keep refresh behavior consistent for local and remote extension hosts.
- See also: [[plans/phase-E14-membership-refresh-compatibility-guardrails]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.LanguageMode.MembershipRefresh` | Membership refreshes after workspace, visible editor, and file-open events | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Workspace.EnvironmentModes` | Remote and local membership behavior stays consistent | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Workspace folder change refreshes language membership (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Visible editor change refreshes language membership (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | File open refreshes language membership (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | `Extension.LanguageMode.MembershipRefresh` | ✅ passing |

After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| - | N/A |

---

## Parent Feature

[[FEAT-032]] - Membership Refresh And Compatibility Guardrails

---

## Dependencies

**Blocked by:**

- [[TASK-209]] - shared membership refresh path should exist first.

**Unblocks:**

- [[TASK-211]] - guarded reversion depends on all refresh triggers.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing test written first.
- [x] Workspace folder add/remove events refresh affected documents.
- [x] Visible editor changes refresh displayed Markdown documents.
- [x] File-open events refresh opened Markdown documents.
- [x] Duplicate refreshes do not cause observable mode thrashing.
- [x] `bun run lint --max-warnings 0` passes.
- [x] `tsc --noEmit` exits 0.
- [ ] All linked BDD scenarios pass locally.
- [x] [[test/matrix]] row(s) updated to `✅ passing`.
- [x] [[test/index]] row(s) added for new test files.
- [x] Parent feature [[FEAT-032]] child task row updated to `in-review`.

---

## Notes

Guarded downgrade behavior is owned by [[TASK-211]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-032]].

> [!WARNING] Red - 2026-05-07
> Added failing refresh coverage for open/visible managed documents used by
> workspace and editor event refresh paths.

> [!SUCCESS] Green - 2026-05-07
> Existing open-document, visible-editor, and workspace-folder subscriptions now
> share the broader managed-document refresh path, preserving manual
> non-Markdown modes and avoiding duplicate in-flight assignments.

> [!INFO] In Review - 2026-05-07
> Full local gate evidence recorded in [[plans/phase-E14-membership-refresh-compatibility-guardrails]];
> awaiting PR CI before final `done`.
