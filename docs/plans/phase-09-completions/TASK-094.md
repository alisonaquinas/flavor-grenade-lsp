---
id: "TASK-094"
title: "Implement heading CompletionProvider"
type: task
status: open
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-092", "TASK-093"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-094"]
---

# Implement heading CompletionProvider

> [!INFO] `TASK-094` · Task · Phase 9 · Parent: [[tickets/FEAT-010]] · Status: `open`

## Description

Create `src/completion/heading-completion-provider.ts`. This provider handles the `wiki-link-heading` context produced by `ContextAnalyzer` — i.e., the user has typed `[[doc#` and the cursor is positioned after the `#`. It extracts `targetStem` from the context, resolves the target document via `Oracle`, enumerates `HeadingEntry[]` from that doc's `OFMIndex`, filters by any partial heading text already typed (`headingPrefix`), and returns `CompletionItem[]` with `kind: CompletionItemKind.Reference`.

---

## Implementation Notes

- Input: context with `{ kind: 'wiki-link-heading', targetStem, headingPrefix }`
- Resolve target doc via `Oracle.resolveByFolderLookup(targetStem)`
- If resolved: enumerate `doc.ofmIndex.headings`, filter by `heading.text.startsWith(headingPrefix)`
- Each item:
  ```typescript
  {
    label: heading.text,
    kind: CompletionItemKind.Reference,
    detail: `${'#'.repeat(heading.level)} ${heading.text} (level ${heading.level})`,
    insertText: heading.text,
  }
  ```
- If not resolved: return `{ isIncomplete: false, items: [] }`
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Heading completion after [[doc# | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/completions]] | `Heading completion returns headings from target doc` |
| [[bdd/features/completions]] | `Heading completion filters by typed prefix` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/heading-completion-provider.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[tickets/FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-092]] — `CompletionRouter` routing structure must exist
- [[tickets/TASK-093]] — `ContextAnalyzer` must produce `wiki-link-heading` context before this provider is invoked

**Unblocks:**

- [[tickets/TASK-099]] — intra-doc heading completion after `[[#` extends this provider

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
- [ ] Parent feature [[tickets/FEAT-010]] child task row updated to `in-review`

---

## Notes

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-010]].
