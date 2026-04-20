---
id: "TASK-124"
title: "Implement textDocument/documentSymbol provider"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/12"]
aliases: ["TASK-124"]
---

# Implement textDocument/documentSymbol provider

> [!INFO] `TASK-124` · Task · Phase 12 · Parent: [[FEAT-013]] · Status: `open`

## Description

Create `src/handlers/document-symbol.handler.ts` implementing the `textDocument/documentSymbol` LSP request. The handler returns a hierarchical `DocumentSymbol[]` tree for a single document: H1 headings form top-level sections, H2 headings nest under H1, H3 under H2, and so on. Block anchors are included as `SymbolKind.Key` leaf symbols. Register `documentSymbolProvider: true` in server capabilities.

---

## Implementation Notes

- Return `DocumentSymbol[]` (hierarchical tree, NOT flat `SymbolInformation[]`)
- H1 → top-level symbols; H2 nested under parent H1; H3 nested under parent H2; etc.
- Block anchors (`^anchor-id`) included as `SymbolKind.Key` leaf nodes within their containing section
- `selectionRange` should cover the heading text; `range` should cover the entire section (heading to next same-level or higher heading)
- Register `documentSymbolProvider: true` in `ServerCapabilities`
- See also: [[requirements/wiki-link-resolution]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Hierarchical document symbol tree for single-document navigation | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | `textDocument/documentSymbol returns hierarchical heading tree` |

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
| [[adr/ADR002-ofm-only-scope]] | Symbol provider only indexes OFM-parsed heading and anchor elements |

---

## Parent Feature

[[FEAT-013]] — Code Actions

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- None

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
- [ ] Parent feature [[FEAT-013]] child task row updated to `in-review`

---

## Notes

This handler is independent of the codeAction dispatcher and can be developed in parallel with TASK-118 through TASK-122. The hierarchical `DocumentSymbol[]` format is preferred over the flat `SymbolInformation[]` format for richer editor outline views.

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
> Ticket created. Status: `open`. Parent: [[FEAT-013]].
