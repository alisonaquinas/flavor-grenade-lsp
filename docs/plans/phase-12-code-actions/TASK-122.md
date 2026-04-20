---
id: "TASK-122"
title: "Implement \"Fix non-breaking space\" quick-fix (FG006)"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-118"]
tags: [tickets/task, "phase/12"]
aliases: ["TASK-122"]
---

# Implement "Fix non-breaking space" quick-fix (FG006)

> [!INFO] `TASK-122` · Task · Phase 12 · Parent: [[FEAT-013]] · Status: `open`

## Description

Create `src/code-actions/fix-nbsp.action.ts`. When an FG006 (non-breaking space) diagnostic is present in the code action range, this provider produces a `CodeAction` with `isPreferred: true` that replaces the U+00A0 character at the diagnostic range with a regular ASCII space (U+0020).

---

## Implementation Notes

- Triggered only when FG006 diagnostic is in range (dispatched by TASK-118 dispatcher)
- `CodeAction` shape:
  - `title`: `'Replace non-breaking space with regular space'`
  - `kind`: `CodeActionKind.QuickFix`
  - `isPreferred`: `true`
  - `edit.changes`: `{ [uri]: [{ range: nbspRange, newText: ' ' }] }`
- The `nbspRange` comes directly from the FG006 diagnostic range; it covers exactly one character (U+00A0)
- See also: [[requirements/diagnostics]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Quick-fix for FG006 non-breaking space diagnostic | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/diagnostics.feature` | `FG006 quick-fix replaces non-breaking space with regular space` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-lsp-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Diagnostic and fix scoped to OFM document body (not frontmatter) |

---

## Parent Feature

[[FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- [[TASK-118]] — FG006 diagnostic must exist and dispatcher must route to this provider

**Unblocks:**

- None

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
- [ ] Parent feature [[FEAT-013]] child task row updated to `in-review`

---

## Notes

`isPreferred: true` causes editors such as VS Code to apply this fix automatically when the user invokes "Fix All". The range must be validated to be within the current document bounds (see CHORE-036 security constraint).

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
> Ticket created. Status: `open`. Parent: [[FEAT-013]].
