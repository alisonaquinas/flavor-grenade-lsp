---
id: "TASK-099"
title: "Implement intra-document heading completion after []() · Status: `open`

## Description

Extend the heading completion provider to handle the intra-document case: when `ContextAnalyzer` sees `[[#` with no target document stem before the `#`, enumerate headings from the current document rather than a remote document. These completions resolve as `[[#Heading Text]]` within the same file. No `Oracle` call is needed — the current doc's `OFMIndex` is used directly.

---

## Implementation Notes

- New context subcase: `{ kind: 'wiki-link-heading', targetStem: '', headingPrefix }`
- When `targetStem === ''`: use the current `OFMDoc` passed in from `CompletionRouter`
- Enumerate `currentDoc.ofmIndex.headings`, filter by `headingPrefix`
- Same `CompletionItem` shape as cross-doc heading completion (TASK-094)
- Intra-doc heading insertText should not include a stem: result is `[[#Heading Text]]`
- See also: [[docs/plans/phase-09-completions]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Intra-document heading completion after `[[#` | [[docs/requirements/functional/completions]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `Intra-doc heading completion after [[# returns current doc headings` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/heading-completion-provider.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[docs/test/matrix]] and [[docs/test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[docs/adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- [[TASK-094]] — cross-doc heading provider must exist before the intra-doc path is added

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
- [ ] [[docs/test/matrix]] row(s) updated to `✅ passing`
- [ ] [[docs/test/index]] row(s) added for new test files
- [ ] Parent feature [[FEAT-010]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[docs/templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[docs/requirements/technical/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[docs/templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.
