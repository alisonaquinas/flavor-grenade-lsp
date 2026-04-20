---
id: "TASK-072"
title: "Implement \"Move tag to frontmatter\" code action MVP"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/6"]
aliases: ["TASK-072"]
---

# Implement "Move tag to frontmatter" code action MVP

> [!INFO] `TASK-072` · Task · Phase 6 · Parent: [[FEAT-007]] · Status: `open`

## Description

Create `src/code-actions/tag-to-yaml.action.ts`. When the cursor is positioned on an inline `#tag`, the code action provider offers "Move #tag to frontmatter". The resulting `WorkspaceEdit` deletes the inline `#tag` span from the document body and appends the tag value to the frontmatter: if a `tags:` key already exists it appends the value; if frontmatter exists without `tags:` it adds `tags: [tag]`; if no frontmatter block is present it prepends `---\ntags: [tag]\n---\n` to the document. This task covers the basic happy-path only — edge cases such as tag already in frontmatter or multiple occurrences are deferred to Phase 12.

---

## Implementation Notes

- Scope: basic happy-path only; edge cases handled in Phase 12 task 4
- Trigger: `textDocument/codeAction` with cursor range overlapping an inline `#tag` span
- Action title: `"Move #<tag> to frontmatter"`
- `WorkspaceEdit` construction:
  - Delete the inline `#tag` span (including the leading `#` and any surrounding whitespace if safe)
  - If frontmatter exists with `tags:` key: append tag value to the array
  - If frontmatter exists without `tags:`: insert `tags: [tag]` line
  - If no frontmatter: prepend `---\ntags: [tag]\n---\n`
- See also: `bdd/features/tags.feature`, [[adr/ADR002-ofm-only-scope]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code action to migrate inline tag to frontmatter | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/tags.feature` | `Move inline tag to frontmatter` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-vault-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Code action is scoped to OFM inline tag syntax |

---

## Parent Feature

[[FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None within Phase 6 (edge cases deferred to Phase 12)

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
- [ ] Parent feature [[FEAT-007]] child task row updated to `in-review`

---

## Notes

Only the happy-path is in scope: cursor on an inline tag, tag not already in frontmatter, single occurrence in document body. Phase 12 handles the full set of edge cases.

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
> Ticket created. Status: `open`. Parent: [[FEAT-007]].

> [!SUCCESS] Done — 2026-04-17
> Implemented in GREEN commit 2af7882. All 225 tests pass; lint and tsc clean. Status: `done`.
