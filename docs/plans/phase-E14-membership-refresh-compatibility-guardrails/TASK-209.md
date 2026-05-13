---
id: "TASK-209"
title: "Refresh membership after server and index events"
type: task
status: done
priority: medium
phase: E14
parent: "FEAT-032"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-031"]
tags: [tickets/task, "phase/E14"]
aliases: ["TASK-209"]
---

# Refresh membership after server and index events

> [!INFO] `TASK-209` - Task - Phase E14 - Parent: [[FEAT-032]] - Status: `done`

## Description

Refresh open Markdown document membership when the server reaches `ready` and
when rebuild-index completes. This keeps `ofmarkdown` assignment aligned with
fresh vault state without requiring users to reload the VS Code window.

---

## Implementation Notes

- Trigger membership checks from server readiness and rebuild-index completion.
- Keep refresh idempotent for documents already in the correct language mode.
- Avoid touching documents with a user-selected non-Markdown language.
- See also: [[docs/features/ofmarkdown-language-mode]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.LanguageMode.MembershipRefresh` | Membership refreshes after server readiness and index rebuild | [[docs/requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Server ready refreshes language membership (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Rebuild index refreshes language membership (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | `Extension.LanguageMode.MembershipRefresh` | ✅ passing |

After implementation, update the rows above and the corresponding rows in [[docs/test/matrix]] and [[docs/test/index]].

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

- [[FEAT-031]] - environment-mode startup behavior must be settled first.

**Unblocks:**

- [[TASK-211]] - safe reversion depends on complete refresh trigger coverage.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Failing test written first.
- [x] Server `ready` refreshes open Markdown and `ofmarkdown` documents.
- [x] Rebuild-index completion refreshes open Markdown and `ofmarkdown` documents.
- [x] Non-Markdown language choices are not changed.
- [x] `bun run lint --max-warnings 0` passes.
- [x] `tsc --noEmit` exits 0.
- [ ] All linked BDD scenarios pass locally.
- [x] [[docs/test/matrix]] row(s) updated to `✅ passing`.
- [x] [[docs/test/index]] row(s) added for new test files.
- [x] Parent feature [[FEAT-032]] child task row updated to `in-review`.

---

## Notes

This task covers server and index events only. Workspace and editor events are
handled by [[TASK-210]].

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[docs/requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-032]].

> [!WARNING] Red - 2026-05-07
> Added failing membership-refresh tests requiring `refreshAll` to inspect both
> Markdown and OFMarkdown documents after server/index events.

> [!SUCCESS] Green - 2026-05-07
> `LanguageModeController.refreshAll()` now checks both managed language ids,
> server `ready` notifications trigger membership refresh, and
> `flavorGrenade.rebuildIndex` refreshes after the rebuild request resolves.

> [!INFO] In Review - 2026-05-07
> Full local gate evidence recorded in [[docs/plans/phase-E14-membership-refresh-compatibility-guardrails]];
> awaiting PR CI before final `done`.

> [!SUCCESS] Done - 2026-05-07
> PR #46 CI passed and parent feature moved to `done`.
