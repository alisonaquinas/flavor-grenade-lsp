---
id: "TASK-118"
title: "Implement codeAction dispatcher + introduce FG006 diagnostic"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/12"]
aliases: ["TASK-118"]
---

# Implement codeAction dispatcher + introduce FG006 diagnostic

> [!INFO] `TASK-118` · Task · Phase 12 · Parent: [[tickets/FEAT-013]] · Status: `open`

## Description

Create `src/handlers/code-action.handler.ts` implementing the `textDocument/codeAction` dispatcher. The dispatcher receives a `CodeActionParams` with the cursor range and optional diagnostics in range, determines which sub-action providers are applicable, and returns a `CodeAction[]`. Simultaneously, extend `DiagnosticService` (introduced in Phase 5) to detect and emit the new FG006 diagnostic (BrokenNBSP Warning) when a U+00A0 non-breaking space character is found outside frontmatter.

---

## Implementation Notes

- Dispatcher routing logic:
  - FG001 diagnostic in range → delegate to `CreateMissingFileAction`
  - Cursor on `#tag` in document body → delegate to `TagToYamlAction`
  - Cursor on or near a heading → delegate to `TocGeneratorAction`
  - FG006 diagnostic (non-breaking space) → delegate to `FixNbspAction`
  - FG007 diagnostic (malformed YAML) → delegate to `RemoveFrontmatterAction`
- Full diagnostic code registry: FG001 (broken wiki-link), FG002 (ambiguous wiki-link), FG003 (malformed wiki-link), FG004 (broken embed), FG005 (broken block ref), FG006 (non-breaking space), FG007 (malformed YAML frontmatter)
- FG006 severity: Warning; emitted by `DiagnosticService` during document parsing; must not fire inside frontmatter block
- See also: [[requirements/diagnostics]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | codeAction dispatcher and FG006 diagnostic | [[requirements/diagnostics]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | `Code action dispatcher routes FG001 to create-missing-note` |
| [[bdd/features/diagnostics]] | `FG006 non-breaking space diagnostic is emitted` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/unit-lsp-module.md` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Diagnostic detection scoped to OFM document body only |

---

## Parent Feature

[[tickets/FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[tickets/TASK-119]] — create-missing-note requires the dispatcher to exist
- [[tickets/TASK-120]] — TOC generator requires the dispatcher to exist
- [[tickets/TASK-121]] — tag-to-yaml edge cases require the dispatcher to exist
- [[tickets/TASK-122]] — fix-nbsp quick-fix requires the dispatcher and FG006 diagnostic to exist

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
- [ ] Parent feature [[tickets/FEAT-013]] child task row updated to `in-review`

---

## Notes

FG006 is introduced for the first time in this phase. The diagnostic must not fire inside the YAML frontmatter block — only in the document body.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-013]].
