---
id: "FEAT-007"
title: "Tags"
type: feature
status: in-review
priority: high
phase: 6
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-006"]
tags: [tickets/feature, "phase/6"]
aliases: ["FEAT-007"]
---

# Tags

> [!INFO] `FEAT-007` · Feature · Phase 6 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain a vault-wide tag registry that tracks every `#tag` occurrence across all notes — both inline and in YAML frontmatter. Tag hierarchy is modelled as a tree so that nested tags (e.g., `#project/active`) surface parent relationships. Inline tag completion activates on `#`, returning frequency-sorted candidates drawn from all tags in the vault. Find-references for any tag returns every note that uses it, and a code action allows authors to migrate an inline tag directly into the YAML frontmatter `tags` block with a single editor action.

---

## Scope

**In scope:**

- Vault-wide `TagRegistry` mapping tag strings to all source locations (inline and frontmatter)
- Tag hierarchy tree via `TagRegistry.hierarchy()`
- `#` trigger character completion from `TagRegistry`, frequency-sorted, with candidates cap
- Find-references for tags via `ReferencesService`
- "Move tag to frontmatter" code action (basic happy-path; edge cases deferred to Phase 12)
- `FrontmatterParser` tag integration: frontmatter tags fed into `TagRegistry` with `source: 'frontmatter'`
- Unit tests for `TagRegistry`

**Out of scope (explicitly excluded):**

- Tag rename across the vault (Phase 11)
- Edge cases for "Move tag to frontmatter" when tag already exists in frontmatter (Phase 12)
- Workspace symbol provider for tags (Phase 12)

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Tag indexing and navigation across vault notes | [[requirements/tag-indexing]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Tag registry, hierarchy, completion, and find-references | [[requirements/tag-indexing]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/tags]] | Tag completion, find-references, hierarchy, and code action scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-06-tags]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] All scenarios in `bdd/features/tags.feature` pass in CI
- [ ] `bun test src/tags/` passes
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
| [[tickets/TASK-067]] | Implement TagRegistry — vault-wide tag index | `done` |
| [[tickets/TASK-068]] | Build tag index during vault scan | `done` |
| [[tickets/TASK-069]] | Implement tag CompletionProvider | `done` |
| [[tickets/TASK-070]] | Implement find-references for tags | `done` |
| [[tickets/TASK-071]] | Implement tag hierarchy queries | `done` |
| [[tickets/TASK-072]] | Implement "Move tag to frontmatter" code action MVP | `done` |
| [[tickets/TASK-073]] | Handle YAML frontmatter tags in TagRegistry | `done` |
| [[tickets/TASK-074]] | Write unit tests for TagRegistry | `done` |
| [[tickets/CHORE-016]] | Phase 6 Lint Sweep | `done` |
| [[tickets/CHORE-017]] | Phase 6 Code Quality Sweep | `done` |
| [[tickets/CHORE-018]] | Phase 6 Security Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-006]] — Phase 5 (Wiki-Link Resolution) must be complete before the tag subsystem can be built

**Unblocks:**

- [[tickets/FEAT-010]] — Phase 9 (Completions) requires Phases 6, 7, and 8 to all be done

---

## Notes

ADR reference: [[adr/ADR002-ofm-only-scope]] constrains tag handling to OFM syntax only.

---

## Retrospective

**Date:** 2026-04-17
**Phase:** 6 (Tags)
**Status at retrospective:** `in-review`

### What went well

- TDD discipline: the RED commit (test file with no implementation) clearly preceded
  the GREEN commit by exactly one commit in git history, as required.
- `TagRegistry` design cleanly separates the bulk `rebuild()` path from the incremental
  `addDoc()`/`removeDoc()` paths; the `removeDoc()` implementation correctly filters
  all occurrences for a given `docId` before re-indexing, preventing stale data.
- Security invariant: tag strings never touch any filesystem API. The `TagToYamlAction`
  only constructs `WorkspaceEdit` payloads — the LSP client applies the edits.
- Frontmatter YAML input validation delegates to `FrontmatterParser`
  (js-yaml with `CORE_SCHEMA`), which was already locked down in Phase 1; `TagRegistry`
  just validates that `frontmatter.tags` is an `Array` before iterating.
- Only one lint warning to fix (missing return type on the `R` helper in the test
  file); resolved immediately without needing a separate CHORE commit.

### Decisions made

- `TagRegistry` placed in `VaultModule` (not `ParserModule`) so that `VaultScanner`
  and `FileWatcher` can inject it alongside `VaultIndex` without circular module
  dependencies.
- `TagToYamlAction` is a Phase 6 MVP: the frontmatter insertion position uses a
  line-0 sentinel for the "append to existing tags array" and "insert tags key" cases.
  Exact YAML-line-level tracking is deferred to Phase 12 as documented in the
  source code comments.
- `ReferencesHandler` uses `@Optional()` injection for `TagRegistry` so existing
  tests that construct the handler directly (without a `TagRegistry`) continue to
  pass without modification.
- `TagCompletionProvider` returns `CompletionItemKind.Value` (12) and strips the `#`
  from labels because the LSP client supplies the trigger character itself.

### Issues encountered

- TypeScript rejected `Record<string, unknown[]>` for `WorkspaceEdit.changes`; fixed
  by typing the map correctly as `{ [uri: string]: TextEdit[] }`.
- The `LspModule` constructor needed three new injected services
  (`TagCompletionProvider`, `TagToYamlAction`, `TagRegistry`); `TagRegistry` is
  resolved through `VaultModule`'s exports.

### Test coverage

- 26 new unit tests covering all `TagRegistry` methods and edge cases.
- All 199 pre-existing tests continue to pass (225 total).
- Integration tests (6) unchanged and passing.

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

> [!SUCCESS] In-Review — 2026-04-17
> All 11 child tickets done (TASK-067–074, CHORE-016–018). RED commit
> (96eff83) followed by GREEN commit (2af7882). 225 tests pass; lint and
> tsc clean. Status: `in-review`.
