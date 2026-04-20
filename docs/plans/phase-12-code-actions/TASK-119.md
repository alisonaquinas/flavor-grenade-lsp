---
id: "TASK-119"
title: "Implement \"Create missing note\" code action (FG001)"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-118"]
tags: [tickets/task, "phase/12"]
aliases: ["TASK-119"]
---

# Implement "Create missing note" code action (FG001)

> [!INFO] `TASK-119` · Task · Phase 12 · Parent: [[FEAT-013]] · Status: `open`

## Description

Create `src/code-actions/create-missing-file.action.ts`. When a FG001 (broken wiki-link) diagnostic is present in the code action range, this provider extracts the broken wiki-link target from the diagnostic, determines the new file path using the vault root and `linkStyle` configuration, and produces a `CodeAction` with a `CreateFile` document change that writes `# stem\n` as the initial file content.

---

## Implementation Notes

- Extract broken wiki-link target string from the FG001 diagnostic data (e.g., `nonexistent-note`)
- Determine new file path using vault root (ADR013) and configured `linkStyle` (ADR005)
- Produce a `CodeAction`:
  - `title`: `Create 'nonexistent-note.md'`
  - `kind`: `CodeActionKind.QuickFix`
  - `diagnostics`: `[fg001Diagnostic]`
  - `edit.documentChanges`: `CreateFile` with `ignoreIfExists: true` and initial content `# nonexistent-note\n`
- URI for the new file must be within the vault root (see CHORE-036 security constraint)
- See also: [[adr/ADR005-wiki-style-binding]], [[adr/ADR013-vault-root-confinement]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Create missing note from broken wiki-link | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | `Create missing note resolves FG001 broken wiki-link` |

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
| [[adr/ADR005-wiki-style-binding]] | File path determination follows configured linkStyle |
| [[adr/ADR013-vault-root-confinement]] | New file URI must be constructed relative to vault root |

---

## Parent Feature

[[FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- [[TASK-118]] — dispatcher must exist before sub-action providers can be wired in

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

The `ignoreIfExists: true` option on `CreateFile` prevents data loss when the file has been created concurrently. Initial content `# stem\n` seeds the new note with a matching H1 heading.

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
