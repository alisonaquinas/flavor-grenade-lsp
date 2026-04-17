---
id: "FEAT-013"
title: "Code Actions"
type: feature
status: draft
priority: medium
phase: 12
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["FEAT-012"]
tags: [tickets/feature, "phase/12"]
aliases: ["FEAT-013"]
---

# Code Actions

> [!INFO] `FEAT-013` · Feature · Phase 12 · Priority: `medium` · Status: `draft`

## Goal

Vault authors gain a suite of productivity code actions that reduce manual editing: generate a table of contents from all headings in a note, create a missing file directly from a broken wiki-link, and migrate inline tags into YAML frontmatter with full edge-case coverage. Workspace symbol search lets authors navigate the entire vault by heading, tag, or block anchor from their editor's symbol palette. Semantic token highlighting gives editors rich colour cues for wiki-links, embeds, tags, callout types, and frontmatter keys. A new FG006 diagnostic flags non-breaking space characters in document body text and offers a one-click quick-fix.

---

## Scope

**In scope:**

- `textDocument/codeAction` dispatcher routing to all sub-action providers
- FG006 (non-breaking space) diagnostic emitted by `DiagnosticService`
- "Create missing note" code action resolving FG001 diagnostics
- "Generate Table of Contents" code action inserting or replacing a TOC block
- "Move tag to frontmatter" code action with full edge-case handling (tag already in frontmatter, multiple occurrences)
- "Fix non-breaking space" quick-fix for FG006 (isPreferred)
- `workspace/symbol` provider querying vault-wide for headings, tags, and block anchors
- `textDocument/documentSymbol` provider returning hierarchical symbol tree per document
- Semantic token provider covering wiki-links, embeds, tags, block anchors, callout types, and frontmatter keys

**Out of scope (explicitly excluded):**

- Rename across the vault (Phase 11)
- CI and packaging (Phase 13)
- FG006 suppression configuration

---

## Linked User Requirements

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Productivity code actions for vault note editing | [[requirements/wiki-link-resolution]] |
| — | Diagnostic rules for non-standard characters | [[requirements/diagnostics]] |

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Code actions, diagnostics, symbol providers, semantic tokens | [[requirements/diagnostics]] |
| — | Wiki-link resolution and vault navigation | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Features

| Feature File | Description |
|---|---|
| [[bdd/features/code-actions]] | Code action scenarios: TOC, create-missing-file, tag-to-yaml, fix-nbsp |
| [[bdd/features/diagnostics]] | FG006 diagnostic and quick-fix scenarios |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-12-code-actions]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] All scenarios in `bdd/features/code-actions.feature` pass in CI
- [ ] FG006 diagnostic scenarios in `bdd/features/diagnostics.feature` pass in CI
- [ ] `workspace/symbol` provider tests pass
- [ ] Semantic token encoding tests pass
- [ ] All linked Planguage requirement tags have `✅ passing` rows in [[test/matrix]]
- [ ] [[test/matrix]] updated with every new test file introduced
- [ ] [[test/index]] updated with every new test file introduced
- [ ] Phase gate command `bun run gate:12` passes in CI
- [ ] No new linter warnings introduced (`bun run lint --max-warnings 0`)
- [ ] `tsc --noEmit` exits 0

---

## Child Tasks

| Ticket | Title | Status |
|---|---|---|
| [[tickets/TASK-118]] | Implement codeAction dispatcher + introduce FG006 diagnostic | `open` |
| [[tickets/TASK-119]] | Implement "Create missing note" code action (FG001) | `open` |
| [[tickets/TASK-120]] | Implement "Generate Table of Contents" code action | `open` |
| [[tickets/TASK-121]] | Extend "Move tag to frontmatter" with edge cases | `open` |
| [[tickets/TASK-122]] | Implement "Fix non-breaking space" quick-fix (FG006) | `open` |
| [[tickets/TASK-123]] | Implement workspace/symbol provider | `open` |
| [[tickets/TASK-124]] | Implement textDocument/documentSymbol provider | `open` |
| [[tickets/TASK-125]] | Implement semantic token provider | `open` |
| [[tickets/CHORE-034]] | Phase 12 Lint Sweep | `open` |
| [[tickets/CHORE-035]] | Phase 12 Code Quality Sweep | `open` |
| [[tickets/CHORE-036]] | Phase 12 Security Sweep | `open` |

---

## Dependencies

**Blocked by:**

- [[tickets/FEAT-012]] — Phase 11 (Rename) must be complete before code actions phase begins

**Unblocks:**

- [[tickets/FEAT-014]] — Phase 13 (CI & Delivery) requires this phase to be complete

---

## Notes

FG006 is first introduced in this phase. The full diagnostic code registry: FG001 (broken wiki-link), FG002 (ambiguous wiki-link), FG003 (malformed wiki-link), FG004 (broken embed), FG005 (broken block ref), FG006 (non-breaking space), FG007 (malformed YAML frontmatter).

ADR references: [[adr/ADR005-link-style]] constrains file path resolution for create-missing-note; [[adr/ADR013-vault-root]] constrains URI construction for CreateFile edits.

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
