---
id: "TASK-123"
title: "Implement workspace/symbol provider"
type: task
status: open
priority: medium
phase: 12
parent: "FEAT-013"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/12"]
aliases: ["TASK-123"]
---

# Implement workspace/symbol provider

> [!INFO] `TASK-123` · Task · Phase 12 · Parent: [[FEAT-013]] · Status: `open`

## Description

Create `src/handlers/workspace-symbol.handler.ts` implementing the `workspace/symbol` LSP request. The handler queries across the entire `VaultIndex` for entities matching a given query string — searching document titles (H1 headings), all headings, tag names, and block anchor IDs — and returns up to 50 `WorkspaceSymbol[]` results using prefix/substring fuzzy matching. Register `workspaceSymbolProvider: true` in server capabilities.

---

## Implementation Notes

- Query across the `VaultIndex` for: document H1 titles, all heading strings, tag names, block anchor IDs
- Simple fuzzy match: prefix match first, then substring match; case-insensitive
- Return `WorkspaceSymbol[]` with `name`, `kind` (headings → `SymbolKind.String`; tags → `SymbolKind.Key`; block anchors → `SymbolKind.Key`), and `location: { uri, range }`
- Cap results at 50 items
- Register `workspaceSymbolProvider: true` in `ServerCapabilities`
- See also: [[requirements/wiki-link-resolution]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault-wide symbol search by query string | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/code-actions.feature` | `workspace/symbol returns matching headings across vault` |

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
| [[adr/ADR002-ofm-only-scope]] | Symbol search restricted to OFM-indexed entities |

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

The 50-item cap prevents slow responses on large vaults. The handler is independent of the codeAction dispatcher and can be developed in parallel with TASK-119 through TASK-122.

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
