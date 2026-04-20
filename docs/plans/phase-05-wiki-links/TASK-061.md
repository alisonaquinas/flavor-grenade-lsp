---
id: "TASK-061"
title: "Implement DefinitionService for wiki-links"
type: task
status: done
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-059"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-061"]
---

# Implement DefinitionService for wiki-links

> [!INFO] `TASK-061` · Task · Phase 5 · Parent: [[FEAT-006]] · Status: `open`

## Description

Create `src/handlers/definition.handler.ts`. This handler responds to `textDocument/definition` LSP requests. It uses the `OFMIndex` binary search on ranges to find the wiki-link entry at the cursor position. If the link resolves successfully, it returns a `Location` pointing to the target document (line 0 for document-level links, or the heading/block line for anchored links). If the link is unresolved, it returns `null`.

---

## Implementation Notes

- Handle `textDocument/definition` LSP method
- Step 1: use `OFMIndex` binary search on ranges to find the `WikiLinkEntry` at cursor position
- Step 2: call `LinkResolver.resolveWikiLink(entry, sourceDocId)`
- Step 3 (resolved): return `Location { uri: fromDocId(vaultRoot, targetDocId), range: { start: { line: headingLine, character: 0 }, end: { line: headingLine, character: 0 } } }`
- Step 3 (unresolved): return `null`
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Go-to-definition requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/wiki-links.feature` | `Go-to-definition navigates to target document` |
| `bdd/features/wiki-links.feature` | `Go-to-definition navigates to heading anchor` |
| `bdd/features/wiki-links.feature` | `Go-to-definition returns null for broken link` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/handlers/definition-handler.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Definition target resolution binding |

---

## Parent Feature

[[FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[TASK-059]] — LinkResolver must be implemented before DefinitionService can use it

**Unblocks:**

- [[TASK-065]] — LspModule registers DefinitionService capability

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
- [ ] Parent feature [[FEAT-006]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[FEAT-006]].
