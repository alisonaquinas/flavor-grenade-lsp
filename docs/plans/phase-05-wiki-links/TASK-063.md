---
id: "TASK-063"
title: "Implement wiki-link CompletionProvider"
type: task
status: open
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-058"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-063"]
---

# Implement wiki-link CompletionProvider

> [!INFO] `TASK-063` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Create `src/completion/wiki-link-completion-provider.ts`. This provider handles `textDocument/completion` requests triggered by `[[`. It enumerates all `DocId`s from `FolderLookup`, produces one `CompletionItem` per document with the document stem (or title for `title-slug` style) as the label, `CompletionItemKind.File` (17) as the kind, the vault-relative path as the detail, and `insertText` formatted per the `linkStyle` config. The candidate list is capped per the `completion.candidates` config value; if capped, `isIncomplete` is set to `true`.

---

## Implementation Notes

- Trigger character: `[[` (registered via `completionProvider.triggerCharacters`)
- For each `DocId` in `FolderLookup`:
  - `label`: document stem (or title if `title-slug` style)
  - `kind`: `CompletionItemKind.File` = 17
  - `insertText`: formatted per `linkStyle` config
  - `detail`: vault-relative path
- Apply `completion.candidates` cap; set `isIncomplete: true` if result set is capped
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Wiki-link completion requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `[[ triggers completion with all vault documents` |
| [[bdd/features/wiki-links]] | `Completion candidate list is capped and marked incomplete` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/wiki-link-completion-provider.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Link style formatting for completion insertText |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-058]] — Oracle/FolderLookup integration must be ready for enumeration

**Unblocks:**

- [[tickets/TASK-065]] — LspModule registers completionProvider capability

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
