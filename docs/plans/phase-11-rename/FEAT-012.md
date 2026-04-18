---
id: "FEAT-012"
title: "Rename"
type: feature
status: in-progress
priority: "high"
phase: "11"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-011"]
tags: [tickets/feature, "phase/11"]
aliases: ["FEAT-012"]
---

# Rename

> [!INFO] `FEAT-012` · Feature · Phase 11 · Priority: `high` · Status: `draft`

## Goal

Vault authors gain the ability to rename headings and files using their editor's built-in rename refactoring command. The server produces a `WorkspaceEdit` that atomically updates the renamed entity at its source and every cross-vault reference to it, preserving pipe aliases correctly, handling path-qualified links, respecting each reference's existing link style, and rejecting rename attempts inside code blocks, math regions, or comments.

---

## Scope

**In scope:**

- `textDocument/prepareRename` — validates cursor position before rename is applied
- `textDocument/rename` for heading rename — updates heading text and all `[[doc#Heading]]` fragment references
- `textDocument/rename` for file rename — produces `RenameFile` document change plus all link text updates
- Link style preservation — server does not convert between `file-stem` and `file-path-stem` during rename
- Pipe alias handling — alias updated only when it was identical to the old heading text
- Zero-reference rename — valid `WorkspaceEdit` with only the source-site change, no error
- Opaque region rejection — returns error `-32602` when cursor is in code, math, or comment region
- `WorkspaceEditBuilder` utility (`src/handlers/workspace-edit-builder.ts`)

**Out of scope (explicitly excluded):**

- Block anchor rename (Phase 12+)
- Tag rename (Phase 12+)
- Converting link styles during rename

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Rename requirements defined in Phase 11 | [[requirements/user/index]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Rename requirements defined in Phase 11 | [[requirements/rename]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/rename]] | prepareRename, heading rename, file rename, alias handling, opaque region rejection scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-11-rename]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] All scenarios in [[bdd/features/rename]] pass in CI
- [ ] `bun test tests/integration/rename.test.ts` passes
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
| [[tickets/TASK-109]] | Implement textDocument/prepareRename | `open` |
| [[tickets/TASK-110]] | Implement textDocument/rename for heading rename | `open` |
| [[tickets/TASK-111]] | Implement textDocument/rename for file rename | `open` |
| [[tickets/TASK-112]] | Handle link style variants in rename edits | `open` |
| [[tickets/TASK-113]] | Handle pipe aliases during heading rename | `open` |
| [[tickets/TASK-114]] | Handle zero-reference rename | `open` |
| [[tickets/TASK-115]] | Implement WorkspaceEditBuilder | `open` |
| [[tickets/TASK-116]] | Reject rename in opaque regions | `open` |
| [[tickets/TASK-117]] | Write integration tests for rename | `open` |
| [[tickets/CHORE-031]] | Phase 11 Lint Sweep | `open` |
| [[tickets/CHORE-032]] | Phase 11 Code Quality Sweep | `open` |
| [[tickets/CHORE-033]] | Phase 11 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-011]] — Phase 10 (Navigation) must be complete; rename depends on `entityAtPosition` and `RefGraph` navigation infrastructure

**Unblocks:**

- [[tickets/FEAT-013]] — Phase 12 (Code Actions) can leverage the WorkspaceEdit infrastructure built here

---

## Notes

ADR references:
- [[adr/ADR005-wiki-style-binding]] — wiki-link style binding rules that govern rename edit generation
- [[adr/ADR013-vault-root-confinement]] — all new file URIs in RenameFile operations must remain within vault root

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
