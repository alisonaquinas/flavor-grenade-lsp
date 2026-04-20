---
id: "TASK-028"
title: "Register all handlers in LspModule"
type: task
status: done
priority: high
phase: 2
parent: "FEAT-003"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-019", "TASK-020", "TASK-021", "TASK-022", "TASK-023", "TASK-024", "TASK-025", "TASK-026", "TASK-027"]
tags: [tickets/task, "phase/2"]
aliases: ["TASK-028"]
---

# Register all handlers in LspModule

> [!INFO] `TASK-028` · Task · Phase 2 · Parent: [[FEAT-003]] · Status: `open`

## Description

Wire the `JsonRpcDispatcher`, `StdioReader`, `StdioWriter`, `DocumentStore`, `LifecycleState`, `StatusNotifier`, and all LSP method handler classes into the NestJS dependency injection container via a new `LspModule`. Each handler class must be decorated with `@Injectable()` and registered as a provider. The module's `onModuleInit` lifecycle hook must connect the reader to the dispatcher and register all handlers before the reader starts consuming stdin.

---

## Implementation Notes

- Create `src/lsp/lsp.module.ts` as a NestJS `@Module`
- Providers: `StdioReader`, `StdioWriter`, `JsonRpcDispatcher`, `DocumentStore`, `LifecycleState`, `StatusNotifier`, plus one provider per handler class
- `onModuleInit`: register each handler with `dispatcher.onRequest` / `dispatcher.onNotification`, then call `reader.start()`
- Export `JsonRpcDispatcher` and `DocumentStore` for use by future modules
- See also: [[adr/ADR001-stdio-transport]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | NestJS DI wiring for all transport components | [[plans/phase-02-lsp-transport]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/workspace.feature` | `Server completes LSP handshake` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/lsp/lsp.module.spec.ts` | Unit | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Use stdio with Content-Length framing for LSP transport |

---

## Parent Feature

[[FEAT-003]] — LSP Transport

---

## Dependencies

**Blocked by:**

- [[TASK-019]] — Dispatcher must be implemented
- [[TASK-020]] through [[TASK-027]] — All handler classes must be implemented before they can be wired

**Unblocks:**

- [[TASK-029]] — Integration tests require the full module to be bootstrapped

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
- [ ] Parent feature [[FEAT-003]] child task row updated to `in-review`

---

## Notes

The `onModuleInit` ordering is critical: all handlers must be registered with the dispatcher before `reader.start()` is called, otherwise an `initialize` message arriving before registration completes will return Method Not Found.

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
> Ticket created. Status: `open`. Parent: [[FEAT-003]].

> [!SUCCESS] Done — 2026-04-17
> RED and GREEN commits landed. All tests pass. Status: `done`.
