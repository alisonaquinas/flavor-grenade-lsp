---
id: "FEAT-006"
title: "Wiki-Link Resolution"
type: feature
status: draft
priority: "high"
phase: "5"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-005"]
tags: [tickets/feature, "phase/5"]
aliases: ["FEAT-006"]
---

# Wiki-Link Resolution

> [!INFO] `FEAT-006` · Feature · Phase 5 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain a server that understands `[[wiki-link]]` syntax: broken links are flagged with precise error diagnostics, ambiguous links are identified with candidate suggestions, and malformed links are caught immediately. Authors can navigate directly to any linked document or heading with go-to-definition, find all places a heading is referenced with find-references, and autocomplete `[[` to discover all vault documents without leaving the editor.

---

## Scope

**In scope:**

- Resolution of `[[target]]`, `[[target#heading]]`, and `[[target#^blockId]]` wiki-link forms
- FG001 (broken wiki-link), FG002 (ambiguous wiki-link), FG003 (malformed wiki-link) diagnostics
- `textDocument/definition` for wiki-links
- `textDocument/references` for headings and documents
- `[[` completion with all vault documents as candidates
- Alias resolution from `frontmatter.aliases`

**Out of scope (explicitly excluded):**

- Tag diagnostics and completion (Phase 6)
- Embed resolution (Phase 7)
- Block reference resolution (Phase 8)
- Rename refactoring (Phase 11)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Wiki-link resolution user requirements | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Wiki-link resolution requirements | [[requirements/wiki-link-resolution]] |
| — | Diagnostics requirements | [[requirements/diagnostics]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/wiki-links]] | Wiki-link resolution, definition, references, and completion scenarios |
| [[bdd/features/diagnostics]] | FG001/FG002/FG003 diagnostic emission scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-05-wiki-links]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `bdd/features/wiki-links.feature` all scenarios pass
- [ ] `bdd/features/diagnostics.feature` FG001/FG002/FG003 scenarios all pass
- [ ] All linked BDD feature files pass in CI
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
| [[tickets/TASK-057]] | Implement RefGraph | `open` |
| [[tickets/TASK-058]] | Implement Oracle name-matching engine | `open` |
| [[tickets/TASK-059]] | Implement LinkResolver.resolveWikiLink | `open` |
| [[tickets/TASK-060]] | Implement DiagnosticService FG001/FG002/FG003 | `open` |
| [[tickets/TASK-061]] | Implement DefinitionService for wiki-links | `open` |
| [[tickets/TASK-062]] | Implement ReferencesService for headings | `open` |
| [[tickets/TASK-063]] | Implement wiki-link CompletionProvider | `open` |
| [[tickets/TASK-064]] | Implement alias resolution from frontmatter | `open` |
| [[tickets/TASK-065]] | Register handlers in LspModule capability registry | `open` |
| [[tickets/TASK-066]] | Write TDD integration tests for multi-document vault | `open` |
| [[tickets/CHORE-013]] | Phase 5 Lint Sweep | `open` |
| [[tickets/CHORE-014]] | Phase 5 Code Quality Sweep | `open` |
| [[tickets/CHORE-015]] | Phase 5 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-005]] — Phase 4 (Vault Index) must be complete; VaultIndex and FolderLookup are prerequisites

**Unblocks:**

- [[tickets/FEAT-007]] — Phase 6 (Tags) may proceed after this feature is done
- [[tickets/FEAT-008]] — Phase 7 (Embeds) may proceed in parallel after this feature is done
- [[tickets/FEAT-009]] — Phase 8 (Block References) may proceed in parallel after this feature is done

---

## Notes

ADR references:
- [[adr/ADR005-wiki-style-binding]] — wiki-link style resolution modes and binding behaviour
- [[adr/ADR003-vault-detection]] — vault root anchoring for all link resolution

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
