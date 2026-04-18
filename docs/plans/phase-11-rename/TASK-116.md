---
id: "TASK-116"
title: "Reject rename in opaque regions"
type: task
status: done
priority: "high"
phase: "11"
parent: "FEAT-012"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-109"]
tags: [tickets/task, "phase/11"]
aliases: ["TASK-116"]
---

# Reject rename in opaque regions

> [!INFO] `TASK-116` · Task · Phase 11 · Parent: [[tickets/FEAT-012]] · Status: `open`

## Description

Extend `prepareRename` so that if the cursor is inside an opaque region — a code block, math block, or comment as tracked in `OFMDoc.opaqueRegions` — the handler returns an error response: `{ error: { code: -32602, message: 'Cannot rename at this location' } }`. This prevents rename from being triggered on content that the server cannot safely analyse (e.g. code inside a fenced block where wiki-link syntax is literal text, not a link).

---

## Implementation Notes

- Extends `src/handlers/prepare-rename.handler.ts` (TASK-109)
- Opaque region check: before calling `entityAtPosition`, test whether `pos` falls within any range in `OFMDoc.opaqueRegions`
- Opaque region types: fenced code block, inline code, math block (`$...$`, `$$...$$`), HTML comment
- Error code `-32602` is the LSP `InvalidParams` code
- This check should be the first guard in `prepareRename` — before entity resolution
- See also: [[bdd/features/rename]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements | [[requirements/rename]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/rename]] | `prepareRename returns error when cursor is in code block` |
| [[bdd/features/rename]] | `prepareRename returns error when cursor is in math block` |
| [[bdd/features/rename]] | `prepareRename returns error when cursor is in HTML comment` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/rename.test.ts` | Integration | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Opaque regions are excluded from wiki-link resolution |

---

## Parent Feature

[[tickets/FEAT-012]] — Rename

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-109]] — prepareRename must exist before opaque region check can be added to it

**Unblocks:**

- [[tickets/TASK-117]] — integration tests cover opaque region rejection scenarios

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
- [ ] Parent feature [[tickets/FEAT-012]] child task row updated to `in-review`

---

## Notes

The security sweep (CHORE-033) explicitly verifies that opaque region rejection prevents rename inside code blocks.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-012]].
