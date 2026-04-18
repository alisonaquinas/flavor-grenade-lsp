---
id: "TASK-073"
title: "Handle YAML frontmatter tags in TagRegistry"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-067"]
tags: [tickets/task, "phase/6"]
aliases: ["TASK-073"]
---

# Handle YAML frontmatter tags in TagRegistry

> [!INFO] `TASK-073` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Ensure that `FrontmatterParser`'s extracted `frontmatter.tags` are fed into `TagRegistry` alongside inline tags. When `TagRegistry.rebuild()` processes an `OFMDoc`, it must also iterate the `frontmatter.tags` array and record each tag as a `TagOccurrence` with `source: 'frontmatter'`. The `range` for each frontmatter tag points to the tag value's line within the YAML frontmatter block.

---

## Implementation Notes

- `FrontmatterParser` already extracts `frontmatter.tags` from YAML front matter — no parser changes needed
- In `TagRegistry.rebuild()`, after processing inline tags for a document, also iterate `ofmDoc.frontmatter.tags`
- Create a `TagOccurrence` for each frontmatter tag with `source: 'frontmatter'` and the appropriate `range`
- The range should point to the tag value's position within the frontmatter block (line number within `--- ... ---`)
- Frontmatter tags must appear in `allTags()` results and `occurrences()` queries like inline tags

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Frontmatter tags indexed alongside inline tags | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `Frontmatter tags are indexed by TagRegistry` |

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
| [[adr/ADR002-ofm-only-scope]] | Tag handling is scoped to OFM syntax including YAML frontmatter |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-067]] — TagRegistry must exist before frontmatter integration can be added

**Unblocks:**

- None within Phase 6

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
- [ ] Parent feature [[tickets/FEAT-007]] child task row updated to `in-review`

---

## Notes

The `source: 'frontmatter'` discriminant allows find-references results to indicate whether a tag occurrence came from inline use or from frontmatter, which may be useful for future filtering.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-007]].

> [!SUCCESS] Done — 2026-04-17
> Implemented in GREEN commit 2af7882. All 225 tests pass; lint and tsc clean. Status: `done`.
