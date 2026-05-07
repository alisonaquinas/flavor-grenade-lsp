---
id: "TASK-203"
title: "Add OFMarkdown-scoped keybindings"
type: task
status: green
priority: medium
phase: E12
parent: "FEAT-030"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["FEAT-029"]
tags: [tickets/task, "phase/E12"]
aliases: ["TASK-203"]
---

# Add OFMarkdown-scoped keybindings

> [!INFO] `TASK-203` - Task - Phase E12 - Parent: [[FEAT-030]] - Status: `green`

## Description

Add useful VS Code keybindings for common Flavor Grenade commands and guard
them so they apply only when `editorLangId == ofmarkdown`.

---

## Implementation Notes

- Prefer keybindings for existing commands such as rebuild index, backlinks, or
  outlinks only when they are ergonomic and conflict-safe.
- Every OFMarkdown-only binding must include an explicit `when` guard.
- See also: [[ADR019-vscode-command-bridges-and-client-ux]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Contributions.OFMarkdownScoped` | Keybindings are scoped with OFMarkdown command contexts | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | `Extension stays idle for generic Markdown workspaces` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/test/contributions/keybindings.test.ts` | Extension | `Extension.Contributions.OFMarkdownScoped` | ✅ passing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR019-vscode-command-bridges-and-client-ux]] | Client commands bridge server affordances into native VS Code UI |

---

## Parent Feature

[[FEAT-030]] - OFMarkdown Editor Contributions

---

## Dependencies

**Blocked by:**

- [[FEAT-029]] - E11 Marketplace proof should remain stable first

**Unblocks:**

- [[TASK-204]] - Isolation tests need keybindings to verify

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [x] Added keybindings target existing Flavor Grenade commands
- [x] Every OFMarkdown-only keybinding has `editorLangId == ofmarkdown`
- [x] Generic Markdown does not receive OFMarkdown-only keybindings
- [x] `cd extension && npm test` passes
- [ ] [[test/matrix]] row updated for `Extension.Contributions.OFMarkdownScoped`
- [ ] [[test/index]] updated if a new test file is added
- [ ] Parent feature [[FEAT-030]] child task row updated to `in-review`

---

## Notes

If a keybinding would conflict with common VS Code or Markdown editing behavior,
document it and leave it out.

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
> Added failing keybinding tests requiring payload-free command bindings guarded
> by `editorTextFocus && editorLangId == ofmarkdown`.

> [!SUCCESS] Green - 2026-05-07
> Added OFMarkdown-scoped keybindings for rebuild index, status actions, and
> output commands; `cd extension && npm test` passes.
