---
id: "TASK-067"
title: "Implement TagRegistry — vault-wide tag index"
type: task
status: done
priority: high
phase: 6
parent: "FEAT-007"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/6"]
aliases: ["TASK-067"]
---

# Implement TagRegistry — vault-wide tag index

> [!INFO] `TASK-067` · Task · Phase 6 · Parent: [[tickets/FEAT-007]] · Status: `open`

## Description

Create `src/tags/tag-registry.ts` containing the `TagRegistry` class. The registry maintains a flat index mapping tag strings to all of their source locations across the vault. It supports frequency-sorted queries, prefix filtering, and parent-tag derivation for nested tags. This is the foundational data structure for all tag features in Phase 6.

---

## Implementation Notes

- `TagRegistry` class with the following methods: `rebuild(vaultIndex: VaultIndex): void`, `occurrences(tag: string): TagOccurrence[]`, `allTags(): string[]`, `withPrefix(prefix: string): string[]`, `parentOf(tag: string): string[]`
- `TagOccurrence` interface: `{ docId: DocId; range: Range; source: 'inline' | 'frontmatter' }`
- `rebuild()` iterates all `OFMDoc` entries in `VaultIndex`, extracting both inline tags and frontmatter tags
- Tags inside code blocks and math blocks must NOT be indexed (respect OFM fence boundaries)
- `allTags()` returns deduplicated list sorted by occurrence frequency (descending)
- `parentOf('#project/active')` returns `['#project']`
- See also: [[requirements/tag-indexing]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault-wide tag index mapping tag strings to source locations | [[requirements/tag-indexing]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/tags]] | `Tag registry indexes all vault tags` |

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
| [[adr/ADR002-ofm-only-scope]] | Tag handling is scoped to OFM syntax only |

---

## Parent Feature

[[tickets/FEAT-007]] — Tags

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[tickets/TASK-068]] — tag index during vault scan requires TagRegistry to exist
- [[tickets/TASK-071]] — tag hierarchy queries extend TagRegistry
- [[tickets/TASK-073]] — frontmatter tag integration requires TagRegistry
- [[tickets/TASK-074]] — unit tests target TagRegistry

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

Tags inside code blocks and math blocks must be excluded. Frequency sort on `allTags()` enables the completion provider to surface most-used tags first without a separate sort step.

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
