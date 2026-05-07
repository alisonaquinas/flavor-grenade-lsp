---
id: "TASK-190"
title: "Cover activation and language-mode membership"
type: task
status: green
priority: high
phase: E9
parent: "FEAT-027"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-189"]
tags: [tickets/task, "phase/E9"]
aliases: ["TASK-190"]
---

# Cover activation and language-mode membership

> [!INFO] `TASK-190` - Task - Phase E9 - Parent: [[FEAT-027]] - Status: `green`

## Description

Add extension-host tests for vault activation, generic Markdown isolation, and
OFMarkdown language-mode membership refresh. The tests should prove that vault
documents become `ofmarkdown` while non-vault Markdown and manual language
choices remain stable.

---

## Implementation Notes

- Exercise `.obsidian/` and `.flavor-grenade.toml` fixture workspaces
- Verify generic Markdown workspaces do not start vault work without a positive
  signal
- Cover membership refresh after server readiness, index rebuild, visible
  editor changes, and file open events where practical
- See also: [[features/ofmarkdown-language-mode]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.Tests.HostCoverage` | Host tests include activation and language-mode groups | [[requirements/functional/vscode-extension-parity]] |
| `Extension.LanguageMode.MembershipRefresh` | Membership refresh keeps language mode assignments correct | [[requirements/functional/vscode-extension-parity]] |
| `Extension.Activation.MarkerEvents` | Activation reacts to vault markers and explicit signals | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/vscode-extension-parity.feature` | Obsidian vault activates the extension host (planned scenario) |
| `docs/bdd/features/vscode-extension-parity.feature` | Generic Markdown remains idle outside a vault (planned scenario) |
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Vault Markdown is promoted to OFMarkdown |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/test/suite/activation-language-mode.test.js` | Integration | `Extension.Tests.HostCoverage` | passing |
| `extension/src/test/suite/activation-language-mode.test.js` | Integration | `Extension.LanguageMode.MembershipRefresh` | passing |

> After implementation, update the rows above and the corresponding rows in
> See [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR016-ofmarkdown-language-mode]] | OFMarkdown identity is assigned by the extension without hijacking generic Markdown |

---

## Parent Feature

[[FEAT-027]] - Extension Host Regression Harness

---

## Dependencies

**Blocked by:**

- [[TASK-189]] - host runner and fixtures must exist first

**Unblocks:**

- [[CHORE-067]] - trace rows depend on final host test paths

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [x] Implementation written to make test(s) pass (GREEN commit follows)
- [x] `.obsidian/` and `.flavor-grenade.toml` fixture activation pass
- [x] Generic Markdown fixture remains `markdown` and avoids vault indexing
- [ ] Manual non-Markdown language selection is preserved
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-027]] child task row updated to `in-review`

---

## Notes

Do not duplicate lower-level language-mode unit tests. Host coverage should
focus on VS Code editor documents, workspace events, and extension activation.

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
> Added failing extension-host activation and language-mode fixture coverage.

> [!SUCCESS] Green - 2026-05-07
> Host coverage now opens isolated Obsidian, Flavor Grenade config, and generic
> Markdown fixture workspaces. Generic Markdown remains `markdown`; vault
> fixtures are accepted as `markdown` or promoted `ofmarkdown` depending on
> server readiness timing.
