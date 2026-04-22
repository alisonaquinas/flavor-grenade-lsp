---
id: "TASK-146"
title: "Wire status bar, commands, and config watcher into activate()"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E3"
parent: "FEAT-017"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-145"]
tags: [tickets/task, "phase/E3"]
aliases: ["TASK-146"]
---

# Wire status bar, commands, and config watcher into activate()

> [!INFO] `TASK-146` · Task · Phase E3 · Parent: [[FEAT-017]] · Status: `open`

## Description

Update `extension/src/extension.ts` to its final Phase E3 form by importing and wiring `createStatusBar` from `status-bar.ts` and `registerCommands` from `commands.ts` into the `activate()` function. Add an `onDidChangeState` handler that resets the status bar text on restart cycles, register all command disposables into `context.subscriptions`, and add an `onDidChangeConfiguration` watcher that restarts the LanguageClient when `flavorGrenade.server.path` changes.

---

## Implementation Notes

- Modifies a single existing file: `extension/src/extension.ts`
- Imports to add:
  ```typescript
  import { createStatusBar } from './status-bar.js';
  import { registerCommands } from './commands.js';
  ```
- After `await client.start()`, add the following wiring in order:
  1. **Status bar widget:** `const statusBar = createStatusBar(client);` and push to `context.subscriptions`
  2. **Restart state reset:** `client.onDidChangeState(() => { statusBar.text = '$(loading~spin) FG: Starting...'; })` — resets the status bar when the client restarts (e.g., after `flavorGrenade.restartServer` command)
  3. **Palette commands:** `const commandDisposables = registerCommands(client);` and spread into `context.subscriptions`
  4. **Config watcher:** `workspace.onDidChangeConfiguration(async (e) => { if (e.affectsConfiguration('flavorGrenade.server.path') && client) { await client.restart(); } })` — push the disposable to `context.subscriptions`
  5. **Client disposal:** Push `client` itself to `context.subscriptions` — `LanguageClient` implements `Disposable`, so `stop()` is called automatically on deactivation. The `deactivate()` export becomes a no-op empty function.
- The `initializationOptions` block should include `linkStyle`, `completion.candidates`, and `diagnostics.suppress` from `workspace.getConfiguration('flavorGrenade')`
- Typecheck verification: `cd extension && npx tsc --noEmit`
- Build verification: `cd extension && npm run build:extension`
- See also: [[plans/phase-E3-status-bar-commands]] — full code listing for the final `extension.ts`

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension UX layer; wires all E3 features into the activation lifecycle | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — Extension activation lifecycle is verified manually in the Extension Development Host, not via Gherkin scenarios |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — Extension entry point module; `tsc --noEmit` and `npm run build:extension` serve as the verification gates. Full integration testing is performed manually in the Extension Development Host. | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| — | No ADR directly constrains this task; design is prescribed by the Phase E3 plan |

---

## Parent Feature

[[FEAT-017]] — Status Bar Widget and Command Palette Integration

---

## Dependencies

**Blocked by:**

- [[TASK-145]] — Both `status-bar.ts` and `commands.ts` must exist before they can be imported and wired into `activate()`.

**Unblocks:**

- [[FEAT-017]] — This is the final task in Phase E3. When complete, the feature ticket can transition to `in-review`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/src/extension.ts` imports `createStatusBar` from `./status-bar.js`
- [ ] `extension/src/extension.ts` imports `registerCommands` from `./commands.js`
- [ ] `createStatusBar(client)` called after `client.start()` and disposable pushed to `context.subscriptions`
- [ ] `client.onDidChangeState` handler resets status bar text to `$(loading~spin) FG: Starting...`
- [ ] `registerCommands(client)` called and all returned disposables pushed to `context.subscriptions`
- [ ] `workspace.onDidChangeConfiguration` handler restarts client when `flavorGrenade.server.path` changes
- [ ] `client` pushed to `context.subscriptions` for automatic `stop()` on deactivation
- [ ] `deactivate()` function is an empty no-op
- [ ] `initializationOptions` includes `linkStyle`, `completion.candidates`, and `diagnostics.suppress`
- [ ] `cd extension && npx tsc --noEmit` exits 0
- [ ] `cd extension && npm run build:extension` exits 0
- [ ] No new linter warnings introduced
- [ ] Parent feature [[FEAT-017]] child task row updated to `in-review`

---

## Notes

This task brings `extension.ts` to its final form for Phase E3. The file was initially created in Phase E2 with minimal `activate()`/`deactivate()` scaffolding. This task adds all the Phase E3 integrations while preserving the Phase E2 structure (server options, client options, client creation, and start).

The `onDidChangeState` handler fires on every state transition (starting, running, stopped). Resetting the status bar text unconditionally on any state change ensures the user sees the spinner immediately when a restart begins, before the server has a chance to send a new `flavorGrenade/status` notification.

Pushing `client` to `context.subscriptions` eliminates the need for explicit `stop()` logic in `deactivate()`. VS Code's extension host calls `dispose()` on all subscription items during deactivation, and `LanguageClient.dispose()` internally calls `stop()`.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` *(optional)* → `in-review` → `done`
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

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[FEAT-017]].
