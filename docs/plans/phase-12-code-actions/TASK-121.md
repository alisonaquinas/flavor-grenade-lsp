---
id: "TASK-121"
title: "Extend \"Move tag to frontmatter\" with edge cases"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-118"]
tags: [tickets/task, "phase/12"]
aliases: ["TASK-121"]
---

# Extend "Move tag to frontmatter" with edge cases

> [!INFO] `TASK-121` · Task · Phase 12 · Parent: [[FEAT-013]] · Status: `open`

## Description

Extend the existing `src/code-actions/tag-to-yaml.action.ts` (originally implemented in Phase 6, Task 6) to handle production-ready edge cases: when the inline tag is already present in the frontmatter `tags` array, surface an informational code action titled "Tag already in frontmatter" as a no-op; when the same tag appears multiple times in the document body, delete all occurrences in a single `WorkspaceEdit` while inserting only one entry into frontmatter.

---

## Implementation Notes

- Do NOT re-implement the basic tag-to-yaml flow from Phase 6; extend `src/code-actions/tag-to-yaml.action.ts`
- Edge case 1: tag already in frontmatter `tags` array → return a `CodeAction` with `kind: CodeActionKind.Empty`, `title: 'Tag already in frontmatter'`, no `edit` (no-op, informational only)
- Edge case 2: multiple inline occurrences of the same `#tag` → batch all inline deletions into one `WorkspaceEdit` with a single frontmatter insert
- See also: [[requirements/tag-indexing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag migration to frontmatter with edge-case coverage | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | `Move tag to frontmatter — tag already present returns info action` |
| `bdd/features/code-actions.feature` | `Move tag to frontmatter — multiple occurrences batched in single edit` |

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
| [[adr/ADR002-ofm-only-scope]] | Tag handling scoped to OFM syntax only |

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

Phase 6 Task 6 implemented the basic single-occurrence happy-path. This task adds only the two edge cases listed above. Do not alter the happy-path logic unless tests are failing.

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
