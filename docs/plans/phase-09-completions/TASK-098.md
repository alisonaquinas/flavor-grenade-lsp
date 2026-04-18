---
id: "TASK-098"
title: "Implement linkStyle formatting in completion insert texts"
type: task
status: done
priority: "high"
phase: "9"
parent: "FEAT-010"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/9"]
aliases: ["TASK-098"]
---

# Implement linkStyle formatting in completion insert texts

> [!INFO] `TASK-098` · Task · Phase 9 · Parent: [[FEAT-010]] · Status: `open`

## Description

Ensure every completion item's `insertText` is formatted according to the configured `linkStyle` setting. The `CompletionRouter` injects the current `linkStyle` from configuration into each sub-provider. Three modes must be supported: `file-stem` inserts the document stem only, `title-slug` inserts the frontmatter `title` field if present (falling back to stem), and `file-path-stem` inserts the vault-relative path without file extension.

---

## Implementation Notes

- Config key: `linkStyle` — one of `'file-stem' | 'title-slug' | 'file-path-stem'`
- `file-stem`: e.g., `alpha` for `notes/alpha.md`
- `title-slug`: frontmatter `title` field if present, else stem
- `file-path-stem`: vault-relative path without `.md` extension, e.g., `notes/alpha`
- The `CompletionRouter` reads `config.linkStyle` and passes it to each sub-provider at construction time
- Each sub-provider formats `insertText` by calling a shared `formatInsertText(doc, linkStyle)` helper
- ADR: [[adr/ADR005-wiki-style-binding]]
- Linked req: [[requirements/configuration]] `Config.WikiLinkStyle`

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Config.WikiLinkStyle — linkStyle formatting of completion insert texts | [[requirements/configuration]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/completions.feature` | `Completion insertText uses file-stem style` |
| `bdd/features/completions.feature` | `Completion insertText uses title-slug style` |
| `bdd/features/completions.feature` | `Completion insertText uses file-path-stem style` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/completion/link-style-formatter.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | linkStyle configuration and completion insert text formatting |

---

## Parent Feature

[[FEAT-010]] — Completions

---

## Dependencies

**Blocked by:**

- None

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
- [ ] Parent feature [[FEAT-010]] child task row updated to `in-review`

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
> Ticket created. Status: `open`. Parent: [[FEAT-010]].

> [!SUCCESS] Done — 2026-04-17
> Implementation complete and tested. All acceptance criteria met. Lint clean, tsc clean, 321 tests pass. Status: `done`.
