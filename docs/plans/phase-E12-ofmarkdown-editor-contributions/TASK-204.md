---
id: "TASK-204"
title: "Test generic Markdown isolation"
type: task
status: green
priority: high
phase: E12
parent: "FEAT-030"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-201", "TASK-202", "TASK-203"]
tags: [tickets/task, "phase/E12"]
aliases: ["TASK-204"]
---

# Test generic Markdown isolation

> [!INFO] `TASK-204` - Task - Phase E12 - Parent: [[FEAT-030]] - Status: `green`

## Description

Add extension-host or manifest-level tests proving that E12 snippets,
keybindings, and language configuration apply to `ofmarkdown` and do not leak
into generic `markdown`.

---

## Implementation Notes

- Cover all contribution types added by [[TASK-201]], [[TASK-202]], and
  [[TASK-203]].
- Use manifest inspection where extension-host APIs cannot expose contribution
  behavior directly.
- See also: `extension/docs/plans/vscode-extension-parity.md`

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | OFMarkdown contributions do not affect generic Markdown unintentionally | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Extension stays idle for generic Markdown workspaces` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/contributions/ofmarkdown-isolation.test.ts` | Extension | `Extension.Contributions.OFMarkdownScoped` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | OFMarkdown editor behavior is isolated behind the `ofmarkdown` language id |

---

## Parent Feature

[[FEAT-030]] - OFMarkdown Editor Contributions

---

## Dependencies

**Blocked by:**

- [[TASK-201]] - Snippets must exist before isolation testing is complete
- [[TASK-202]] - Language configuration must exist before isolation testing is complete
- [[TASK-203]] - Keybindings must exist before isolation testing is complete

**Unblocks:**

- [[FEAT-030]] - Feature review depends on isolation evidence

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Tests prove snippets are scoped to `ofmarkdown`
- [x] Tests prove keybindings use OFMarkdown guards
- [x] Tests prove generic Markdown behavior is unchanged
- [x] `cd extension && npm run check-types` passes
- [x] `cd extension && npm test` passes
- [ ] [[test/matrix]] row updated for `Extension.Contributions.OFMarkdownScoped`
- [ ] [[test/index]] updated if a new test file is added
- [ ] Parent feature [[FEAT-030]] child task row updated to `in-review`

---

## Notes

This task is the E12 gate because the phase is only successful if generic
Markdown users are not surprised.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` -> `in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements and BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint, type, and test clean; awaiting CI | Verify Definition of Done |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING]
> `red` before `green` is non-negotiable. See [[requirements/code-quality]]
> `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE]
> Append-only. LLM agents add entries below in chronological order. Do not edit
> previous entries.

> [!INFO] Opened - 2026-05-07
> Ticket created. Status: `open`. Parent: [[FEAT-030]].

> [!WARNING] Red - 2026-05-07
> Added manifest-level isolation tests proving generic Markdown does not receive
> OFMarkdown-only snippets, keybindings, or language configuration.

> [!SUCCESS] Green - 2026-05-07
> Generic Markdown isolation tests pass for snippets, language contribution, and
> OFMarkdown-only keybinding guards.
