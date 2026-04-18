---
id: "FEAT-012"
title: "Rename"
type: feature
status: done
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
| [[tickets/TASK-109]] | Implement textDocument/prepareRename | `done` |
| [[tickets/TASK-110]] | Implement textDocument/rename for heading rename | `done` |
| [[tickets/TASK-111]] | Implement textDocument/rename for file rename | `done` |
| [[tickets/TASK-112]] | Handle link style variants in rename edits | `done` |
| [[tickets/TASK-113]] | Handle pipe aliases during heading rename | `done` |
| [[tickets/TASK-114]] | Handle zero-reference rename | `done` |
| [[tickets/TASK-115]] | Implement WorkspaceEditBuilder | `done` |
| [[tickets/TASK-116]] | Reject rename in opaque regions | `done` |
| [[tickets/TASK-117]] | Write integration tests for rename | `done` |
| [[tickets/CHORE-031]] | Phase 11 Lint Sweep | `done` |
| [[tickets/CHORE-032]] | Phase 11 Code Quality Sweep | `done` |
| [[tickets/CHORE-033]] | Phase 11 Security Sweep | `done` |

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

> [!INFO] In-review — 2026-04-17
> All child tasks and CHOREs completed. Implementation summary:
>
> **Files created:**
> - `src/handlers/workspace-edit-builder.ts` — `WorkspaceEditBuilder` class (TASK-115): accumulates TextEdit and RenameFile changes per URI, deduplicates same-range edits (last-write-wins), sorts edits in reverse line/character order for safe multi-edit application.
> - `src/handlers/prepare-rename.handler.ts` — `PrepareRenameHandler` (TASK-109, TASK-116): uses `entityAtPosition` to find heading or wiki-link under cursor; checks opaque regions via `OFMDoc.opaqueRegions` to reject rename inside code/math/comment blocks; returns `{range, placeholder}` for headings (text range after `##` prefix) and wiki-links.
> - `src/handlers/rename.handler.ts` — `RenameHandler` (TASK-110–114): heading rename updates source heading text and all cross-vault `[[doc#Heading]]` refs filtered from `RefGraph.getRefsTo(docId)`; alias identity rule preserves alias when it differs from old heading; file rename produces `RenameFile` document change plus text edits for all links; link style preserved per TASK-112; `newName` never used in filesystem calls (CHORE-033 security).
> - `src/rename/rename.module.ts` — NestJS module wiring `PrepareRenameHandler` and `RenameHandler`.
> - `src/handlers/__tests__/workspace-edit-builder.test.ts` — 8 unit tests (TDD RED → GREEN).
> - `src/handlers/__tests__/prepare-rename.handler.test.ts` — 6 unit tests (TDD RED → GREEN).
> - `src/handlers/__tests__/rename.handler.test.ts` — 7 unit tests (TDD RED → GREEN).
> - `src/test/integration/rename.test.ts` — 4 integration tests: prepareRename on heading, rename heading, opaque region rejection, zero-reference rename.
>
> **Files modified:**
> - `src/lsp/lsp.module.ts` — imported `RenameModule`, registered `textDocument/prepareRename` and `textDocument/rename` handlers, added `renameProvider: { prepareProvider: true }` capability, synced raw text to `PrepareRenameHandler` on didOpen/didChange/didClose.
> - `src/test/fixtures/wiki-link-vault/beta.md` — added `## Beta Section` heading for integration test coverage.
>
> **Test results:** 371 tests pass, 0 failures (346 pre-existing + 25 new). `bun run lint` clean, `tsc --noEmit` exits 0.
