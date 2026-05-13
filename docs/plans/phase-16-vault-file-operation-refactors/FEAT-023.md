---
id: "FEAT-023"
title: "Vault File Operation Refactors"
type: feature
status: done
priority: high
phase: 16
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["FEAT-022"]
tags: [tickets/feature, "phase/16"]
aliases: ["FEAT-023"]
---

# Vault File Operation Refactors

> [!INFO] `FEAT-023` · Feature · Phase 16 · Priority: `high` · Status: `done`

## Goal

Vault authors can move notes, attachments, and folders inside the vault without
leaving stale local links behind. Before the editor applies a file operation,
the server returns one vault-confined refactor edit that updates every resolved
local reference while preserving the original link form, heading fragment, block
fragment, alias, and title text.

---

## Scope

**In scope:**

- `workspace/willRenameFiles` support for file renames, file moves, and folder
  moves
- Vault-confined old/new path planning for all requested file operations
- Syntax-preserving rewrites for wiki-links, embeds, Markdown links,
  reference definitions, and Markdown image links
- Structured reporting for references skipped because ambiguity prevents a safe
  rewrite
- All-or-nothing WorkspaceEdit validation before returning edits to the client
- `workspace/didRenameFiles` index and diagnostic refresh after the editor move
- Regression coverage for file operation scenarios in
  `docs/bdd/features/ofmarkdown-parity.feature`

**Out of scope (explicitly excluded):**

- Direct server-side file writes
- Cross-vault moves
- Manual conflict-resolution UI
- Git move detection outside LSP file operation notifications

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Safe vault reorganization without broken local references | [[docs/requirements/functional/ofmarkdown-parity]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.AtomicRefactor` | Return one atomic WorkspaceEdit for local file and folder moves | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.CapabilityRegistration` | Advertise and handle file-operation rename requests | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.MovePlannerConfinement` | Plan only vault-confined file and folder mappings | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.ReferenceRewrite` | Rewrite moved-target references while preserving syntax family | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.SkippedAmbiguousReporting` | Report ambiguous references without speculative edits | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.AtomicValidation` | Validate deterministic all-or-nothing WorkspaceEdit output | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.IndexRefresh` | Refresh index and diagnostics after `didRenameFiles` | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Rename.Refactoring.Completeness` | Preserve rename completeness for wiki-link and heading references | [[docs/requirements/rename]] |
| `Rename.StyleBinding.Consistency` | Preserve configured link style when rewriting wiki-links | [[docs/requirements/rename]] |
| `Security.Vault.PathConfinement` | Canonicalize and vault-root-check old and new paths | [[docs/requirements/security/vault-confinement]] |
| `Security.Vault.RenameConfinement` | Refuse rename or move edits that escape the vault root | [[docs/requirements/security/vault-confinement]] |
| `Link.Wiki.StyleBinding` | Keep wiki-link output consistent with active style | [[docs/requirements/wiki-link-resolution]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios must update supported local reference forms |

---

## Phase Plan Reference

- Phase plan: [[docs/plans/phase-16-vault-file-operation-refactors]]
- Execution ledger row: [[docs/plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] File move scenarios in `docs/bdd/features/ofmarkdown-parity.feature` pass
- [ ] Escaping source or target paths are refused before any edit is returned
- [ ] Applying the returned WorkspaceEdit leaves no broken references to moved
      targets
- [ ] Ambiguous references that cannot be safely rewritten are reported without
      producing misleading edits
- [ ] Existing heading and file rename behavior remains green
- [ ] [[docs/test/matrix]] updated with every new test file introduced
- [ ] [[docs/test/index]] updated with every new test file introduced
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[TASK-169]] | Add file operation capability handler | `done` |
| [[TASK-170]] | Build vault-confined move planner | `done` |
| [[TASK-171]] | Rewrite moved-target references without changing syntax | `done` |
| [[TASK-172]] | Validate all-or-nothing WorkspaceEdit output | `done` |
| [[BUG-013]] | willRenameFiles handler does not invoke the refactor pipeline | `done` |
| [[BUG-014]] | File operation confinement uses workspace root instead of detected vault root | `done` |
| [[BUG-015]] | File operation providers fail Nest dependency injection at server boot | `done` |
| [[TASK-173]] | Refresh index after didRenameFiles | `done` |
| [[TASK-174]] | Add file operation regression suite | `done` |
| [[CHORE-050]] | Phase 16 Lint Sweep | `done` |
| [[CHORE-051]] | Phase 16 Test Matrix Sweep | `done` |
| [[CHORE-052]] | Phase 16 Security Sweep | `done` |

---

## Dependencies

**Blocked by:**

- [[FEAT-022]] — Phase 15 must be complete before file operation refactors begin

**Unblocks:**

- Future vault reorganization features that depend on safe LSP file operations

---

## Notes

Design reference: [[ADR018-vault-file-operation-refactoring]]. Implementation
should follow the planned sequence: capability handler, vault-confined planner,
syntax-preserving rewriter, edit validation, `didRenameFiles` refresh, then the
full regression suite.

---

## Lifecycle

Full state machine, entry/exit criteria, and agent obligations for each state:
[[docs/templates/tickets/lifecycle/feature-lifecycle]]

**State path:** `draft` → `ready` → `in-progress` → `in-review` → `done`
**Lateral states:** `blocked` (from `in-progress`), `cancelled` (from any state)

> [!NOTE] This ticket opens in `draft`. The first agent obligation is to
> complete the spec and create all child `TASK-NNN` tickets before transitioning
> to `ready`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/feature-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `draft`. Phase 16 task and chore tickets defined.

> [!INFO] Started - 2026-05-06
> Phase 15 PR #31 passed CI and merged to `develop`. Phase 16 is now the active
> implementation phase. Status: `in-progress`.

> [!SUCCESS] Review - 2026-05-06
> File-operation handler, planner, rewriter, validator, refresh, regression,
> lint, security, and traceability work is complete locally. Standard local
> gates pass; BDD still has pre-existing pending/undefined coverage and one
> non-Phase-16 block-embed failure. Status: `done`.

## Retrospective

> Written after PR #32 passed CI and merged. Date: 2026-05-07.

### What went as planned

The phase delivered the intended file-operation pipeline: capability
registration, vault-confined move planning, syntax-preserving reference
rewrites, WorkspaceEdit validation, post-rename refresh, and regression
coverage. PR #32 passed CI before merge.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| BUG-013 | Bug | The first handler path did not invoke the full refactor pipeline | Medium |
| BUG-014 | Bug | Confinement initially used workspace root instead of detected vault root | Medium |
| BUG-015 | Bug | Provider wiring failed Nest dependency injection at server boot | Low |

BDD remained partially blocked by pre-existing pending, undefined, and one
non-Phase-16 block-embed failure. The Phase 16 PR documented that this was not
part of the CI gate.

### Process observations

The A-M checklist helped force traceability, but the final status update lagged
behind the merged PR. Future phases should reserve a final status-only commit
after CI confirms green and before the next phase branch starts.

### Carry-forward actions

- [ ] Start Phase 17 only after this status finalization lands on `develop`.
- [ ] Keep pre-existing BDD backlog separate from phase gate evidence unless CI
      begins enforcing those scenarios.

### Rule / template amendments

- [ ] None.
