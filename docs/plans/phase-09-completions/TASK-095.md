---
id: "TASK-095"
title: "Implement callout type CompletionProvider"
type: task
status: open
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/9"]
aliases: ["TASK-095"]
---

# Implement callout type CompletionProvider

> [!INFO] `TASK-095` · Task · Phase 9 · Parent: [[tickets/FEAT-010]] · Status: `open`

## Description

Create `src/completion/callout-completion-provider.ts`. Triggered after `> [!`, this provider returns completion items for all known callout types. The 13 standard types are hardcoded; additionally, any custom types found across all `CalloutEntry[]` in the vault are included. Each item has `kind: CompletionItemKind.EnumMember`. The insert text includes the closing `]` bracket and a trailing space.

---

## Implementation Notes

- Hardcoded standard types:
  ```typescript
  export const STANDARD_CALLOUT_TYPES = [
    'NOTE', 'INFO', 'TIP', 'WARNING', 'DANGER',
    'SUCCESS', 'QUESTION', 'FAILURE', 'BUG', 'EXAMPLE',
    'QUOTE', 'ABSTRACT', 'TODO',
  ] as const;
  ```
- Custom types: enumerate all `OFMDoc`s in `VaultIndex`, collect unique `CalloutEntry.type` values not already in `STANDARD_CALLOUT_TYPES`
- Item shape: `{ label: type, kind: CompletionItemKind.EnumMember, insertText: type + '] ' }`
- Linked BDD: [[bdd/features/completions]] scenario "Callout completion returns all 13 types"
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Callout type completion after > [! | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/completions]] | `Callout completion returns all 13 types` |
| [[bdd/features/completions]] | `Callout completion includes custom vault types` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/callout-completion-provider.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[tickets/FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None within Phase 9

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-010]] child task row updated to `in-review`

---

## Notes

The 13 standard types must be hardcoded and not sourced from any user-controlled input or configuration file. See CHORE-027 security focus.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-010]].
