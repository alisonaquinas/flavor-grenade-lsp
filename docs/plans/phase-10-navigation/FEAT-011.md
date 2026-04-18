---
id: "FEAT-011"
title: "Navigation"
type: feature
status: in-progress
priority: "high"
phase: "10"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-010"]
tags: [tickets/feature, "phase/10"]
aliases: ["FEAT-011"]
---

# Navigation

> [!INFO] `FEAT-011` · Feature · Phase 10 · Priority: `high` · Status: `draft`

## Goal

Vault authors and LSP users gain a complete navigation feature set: go-to-definition resolves all link types (wiki-links, embeds, block references, heading references, tags), find-references locates all entity types across the vault, code lens surfaces reference counts directly on headings, and document highlight illuminates all occurrences of an entity within the current file. After this phase, editors can navigate the full vault interactively without leaving the editor.

---

## Scope

**In scope:**

- `textDocument/definition` for all cursor positions: `[[target]]`, `[[target#heading]]`, `[[target#^blockid]]`, `[[#heading]]`, `[[#^blockid]]`, `![[embed]]`, `#tag`, plain text → null
- `textDocument/references` for all entity types: headings, block anchors, tags, document title, wiki-links, plain text
- `textDocument/codeLens` — reference count code lenses on all headings including those with zero references
- `textDocument/documentHighlight` — Write for definition, Read for references within current document
- `entityAtPosition` utility (`src/handlers/cursor-entity.ts`) shared by all navigation handlers
- `LocationLink[]` for multi-candidate definition results (FG002 ambiguous links)

**Out of scope (explicitly excluded):**

- Rename refactoring (Phase 11)
- Code actions (Phase 12)
- Cross-vault navigation beyond the detected vault root

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Navigation requirements defined in Phase 10 | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Navigation requirements defined in Phase 10 | [[requirements/navigation]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/navigation]] | Go-to-definition, find-references, code lens, and document highlight scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-10-navigation]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] All scenarios in [[bdd/features/navigation]] pass in CI
- [ ] `bun test tests/integration/navigation.test.ts` passes
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command passes in CI (see [[plans/execution-ledger]])
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-102]] | Consolidate DefinitionService | `open` |
| [[tickets/TASK-103]] | Consolidate ReferencesService | `open` |
| [[tickets/TASK-104]] | Implement CodeLensProvider | `open` |
| [[tickets/TASK-105]] | Implement cursor position → entity mapping utility | `open` |
| [[tickets/TASK-106]] | Handle multi-location definition results | `open` |
| [[tickets/TASK-107]] | Implement textDocument/documentHighlight | `open` |
| [[tickets/TASK-108]] | Write integration tests for navigation | `open` |
| [[tickets/CHORE-028]] | Phase 10 Lint Sweep | `open` |
| [[tickets/CHORE-029]] | Phase 10 Code Quality Sweep | `open` |
| [[tickets/CHORE-030]] | Phase 10 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-010]] — Phase 9 (Completions) must be complete before navigation can be built

**Unblocks:**

- [[tickets/FEAT-012]] — Phase 11 (Rename) depends on the entityAtPosition utility and navigation infrastructure

---

## Notes

ADR references:
- [[adr/ADR005-wiki-style-binding]] — wiki-link style binding rules that govern how cursor entities are resolved

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state: [[templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

| State | Meaning | First transition trigger |
|---|---|---|
| `draft` | Spec incomplete; child tasks not yet created | All placeholders filled; child tasks exist |
| `ready` | Fully specified; waiting for first task to start | First child task moves to `red` |
| `in-progress` | At least one child task active | — |
| `blocked` | All active tasks blocked | Blocker resolved → back to `in-progress` |
| `in-review` | All child tasks `done`; awaiting CI + review | CI green + human approves |
| `done` | CI gate passes; execution ledger updated | Terminal |
| `cancelled` | Abandoned with documented reason | Terminal |

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to complete the spec and create all child `TASK-NNN` tickets before transitioning to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `draft`. Spec incomplete; child tasks not yet created.
