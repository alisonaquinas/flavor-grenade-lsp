---
id: "TASK-065"
title: "Register handlers in LspModule capability registry"
type: task
status: done
priority: "high"
phase: "5"
parent: "FEAT-006"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-060", "TASK-061", "TASK-062", "TASK-063"]
tags: [tickets/task, "phase/5"]
aliases: ["TASK-065"]
---

# Register handlers in LspModule capability registry

> [!INFO] `TASK-065` · Task · Phase 5 · Parent: [[tickets/FEAT-006]] · Status: `open`

## Description

Update `LspModule` (or the root application module) to register the Phase 5 handlers in the LSP `InitializeResult.capabilities` response. Add `definitionProvider: true`, `referencesProvider: true`, and the `completionProvider` block with trigger characters and `resolveProvider: false`. Wire the `DiagnosticService` to fire on every `textDocument/didOpen` and `textDocument/didChange` notification.

---

## Implementation Notes

- Update `InitializeResult.capabilities` to include:

  ```typescript
  {
    definitionProvider: true,
    referencesProvider: true,
    completionProvider: {
      triggerCharacters: ['[', '#', '>'],
      resolveProvider: false,
    },
  }
  ```

- Wire `DiagnosticService` to `textDocument/didOpen` and `textDocument/didChange` notifications
- Wire `DefinitionService` to `textDocument/definition` requests
- Wire `ReferencesService` to `textDocument/references` requests
- Wire `CompletionProvider` to `textDocument/completion` requests
- See also: [[adr/ADR005-wiki-style-binding]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | LSP capability registration requirements | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/wiki-links]] | `Server advertises definition, references, and completion capabilities` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/capabilities.spec.ts` | Unit | — | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR005-wiki-style-binding]] | Capability advertisement for wiki-link features |

---

## Parent Feature

[[tickets/FEAT-006]] — Wiki-Link Resolution

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-060]] — DiagnosticService must be implemented
- [[tickets/TASK-061]] — DefinitionService must be implemented
- [[tickets/TASK-062]] — ReferencesService must be implemented
- [[tickets/TASK-063]] — CompletionProvider must be implemented

**Unblocks:**

- [[tickets/TASK-066]] — integration tests require all handlers to be registered

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
- [ ] Parent feature [[tickets/FEAT-006]] child task row updated to `in-review`

---

## Notes

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

| State | Meaning | Agent action on entry |
|---|---|---|
| `open` | Created; no test written yet | Read linked requirements + BDD scenarios |
| `red` | Failing test committed; no impl yet | Commit test alone; update Linked Tests to `🔴` |
| `green` | Impl written; all tests pass | Decide refactor or go direct to review |
| `refactor` | Cleaning up; tests still pass | No behaviour changes allowed |
| `in-review` | Lint+type+test clean; awaiting CI | Verify Definition of Done; update matrix/index |
| `done` | CI green; DoD complete | Append `[!CHECK]`; update parent feature table |
| `blocked` | Named dependency unavailable | Append `[!WARNING]`; note prior state for resume |
| `cancelled` | Abandoned | Append `[!CAUTION]`; update parent feature table |

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-006]].
