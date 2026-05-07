---
id: "TASK-211"
title: "Guard language-mode reversion"
type: task
status: red
priority: medium
phase: E14
parent: "FEAT-032"
created: "2026-05-07"
updated: "2026-05-07"
dependencies: ["TASK-209", "TASK-210"]
tags: [tickets/task, "phase/E14"]
aliases: ["TASK-211"]
---

# Guard language-mode reversion

> [!INFO] `TASK-211` - Task - Phase E14 - Parent: [[FEAT-032]] - Status: `red`

## Description

Harden downgrade behavior so `ofmarkdown` documents return to `markdown` only
when server membership and local marker checks both say the file is outside a
vault. The refresh path must preserve user-selected non-Markdown languages.

---

## Implementation Notes

- Treat server non-membership alone as insufficient for downgrade when a local
  `.obsidian/` marker still applies.
- Treat marker absence alone as insufficient when the server still indexes the
  document.
- Do not modify documents whose language is neither `markdown` nor `ofmarkdown`.
- See also: [[features/ofmarkdown-language-mode]]

---

## Linked Functional Requirements

| Requirement Tag | Gist | Source File |
|---|---|---|
| `Extension.LanguageMode.MembershipRefresh` | Reversion happens only when both membership checks say outside vault | [[requirements/functional/vscode-extension-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | Vault marker prevents accidental language downgrade |
| `docs/bdd/features/vscode-extension-parity.feature` | Server membership prevents accidental language downgrade (planned scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `extension/src/language-mode.test.ts` | Unit | `Extension.LanguageMode.MembershipRefresh` | 🔴 failing |

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

- [[TASK-209]] - server and index refresh triggers must exist.
- [[TASK-210]] - workspace and editor refresh triggers must exist.

**Unblocks:**

- [[FEAT-032]] - safe reversion is required for phase acceptance.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test written first.
- [ ] Server non-membership alone cannot downgrade `ofmarkdown`.
- [ ] Marker absence alone cannot downgrade `ofmarkdown`.
- [ ] Agreement between server and marker checks downgrades to `markdown`.
- [ ] Manual non-Markdown language choices are preserved.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] All linked BDD scenarios pass locally.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-032]] child task row updated to `in-review`.

---

## Notes

This task protects long-running sessions from transient server or file-system
state during refresh.

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
> Added failing guarded reversion tests requiring OFMarkdown downgrade only
> when both marker and server membership checks say outside the vault.
