---
id: "TASK-099"
title: "Implement intra-document heading completion after [[#"
type: task
status: open
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-094"]
tags: [tickets/task, "phase/9"]
aliases: ["TASK-099"]
---

# Implement intra-document heading completion after [[#

> [!INFO] `TASK-099` · Task · Phase 9 · Parent: [[tickets/FEAT-010]] · Status: `open`

## Description

Extend the heading completion provider to handle the intra-document case: when `ContextAnalyzer` sees `[[#` with no target document stem before the `#`, enumerate headings from the current document rather than a remote document. These completions resolve as `[[#Heading Text]]` within the same file. No `Oracle` call is needed — the current doc's `OFMIndex` is used directly.

---

## Implementation Notes

- New context subcase: `{ kind: 'wiki-link-heading', targetStem: '', headingPrefix }`
- When `targetStem === ''`: use the current `OFMDoc` passed in from `CompletionRouter`
- Enumerate `currentDoc.ofmIndex.headings`, filter by `headingPrefix`
- Same `CompletionItem` shape as cross-doc heading completion (TASK-094)
- Intra-doc heading insertText should not include a stem: result is `[[#Heading Text]]`
- See also: [[plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Intra-document heading completion after [[# | [[requirements/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/completions]] | `Intra-doc heading completion after [[# returns current doc headings` |

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

- [[tickets/TASK-094]] — cross-doc heading provider must exist before the intra-doc path is added

**Unblocks:**

- None within Phase 9

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
