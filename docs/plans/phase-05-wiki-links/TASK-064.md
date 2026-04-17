---
id: "TASK-064"
title: "Implement alias resolution from frontmatter"
type: task
status: open
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/5"]
aliases: ["TASK-064"]
---

# Implement alias resolution from frontmatter

> [!INFO] `TASK-064` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Implement `Oracle.resolveWithAlias()`. For each document in `VaultIndex`, inspect the `frontmatter.aliases` array of strings and build an alias index (`Map<string, DocId>`). When resolving `[[target]]`, the alias index is checked before stem matching: if `target` matches any alias string (case-insensitive), the corresponding `DocId` is returned as the resolution target. This enables wiki-links to use a document's display name or alternate title instead of its filename.

---

## Implementation Notes

- Build alias index: `Map<string, DocId>` where key = lowercase alias string
- Alias index is rebuilt whenever `VaultIndex` changes (on scan completion and file-change events)
- In `Oracle.resolveWithAlias()`: check alias index before calling `FolderLookup.findByStem()`
- Edge case: if two documents define the same alias, the conflict is treated as ambiguous (FG002)
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Alias resolution requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Wiki-link resolves via frontmatter alias` |
| [[bdd/features/wiki-links]] | `Duplicate alias across two documents is treated as ambiguous` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/resolution/alias-resolver.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Alias lookup is step 2 in the Obsidian-compatible resolution order |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- Nothing — alias index construction requires only VaultIndex which is complete from Phase 4

**Unblocks:**

- [[tickets/TASK-058]] — Oracle depends on resolveWithAlias() being available

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
- [ ] Parent feature [[tickets/FEAT-006]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-006]].
