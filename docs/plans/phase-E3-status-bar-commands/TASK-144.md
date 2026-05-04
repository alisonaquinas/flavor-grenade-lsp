---
id: "TASK-144"
title: "Implement status bar widget listening to flavorGrenade/status"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "E3"
parent: "FEAT-017"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-143"]
tags: [tickets/task, "phase/E3"]
aliases: ["TASK-144"]
---

# Implement status bar widget listening to flavorGrenade/status

> [!INFO] `TASK-144` · Task · Phase E3 · Parent: [[FEAT-017]] · Status: `done`

## Description

Create `extension/src/status-bar.ts` containing a `createStatusBar` function that accepts a `LanguageClient` and returns a `StatusBarItem`. The widget listens to the non-standard `flavorGrenade/status` notification (defined in the API layer) and transitions through four states — initializing, indexing, ready, and error — updating the status bar text, tooltip, and codicon icon accordingly. Clicking the status bar item opens the Flavor Grenade output channel via the `flavorGrenade.showOutput` command.

---

## Implementation Notes

- Creates a single new file: `extension/src/status-bar.ts`

- Exports `createStatusBar(client: LanguageClient): StatusBarItem`

- Defines `FlavorGrenadeStatus` interface matching the `flavorGrenade/status` notification params from [[design/api-layer]]:

  ```typescript
  interface FlavorGrenadeStatus {
      state: 'initializing' | 'indexing' | 'ready' | 'error';
      vaultCount: number;
      docCount: number;
      message?: string;
  }
  ```

- Uses `StatusBarAlignment.Left` with priority `-1` so the item sits to the right of most built-in items

- Sets `item.name = 'Flavor Grenade'` for the status bar entry name

- Sets `item.command = 'flavorGrenade.showOutput'` so clicking opens the output channel

- Initial text: `$(loading~spin) FG: Starting...`

- State-to-icon mapping:

  - `initializing` → `$(loading~spin) FG: Starting...`

  - `indexing` → `$(loading~spin) FG: Indexing...` with tooltip showing doc/vault counts

  - `ready` → `$(check) FG: {docCount} docs` with tooltip showing doc/vault counts

  - `error` → `$(error) FG: Error` with tooltip showing the error message

- Registers the notification handler via `client.onNotification('flavorGrenade/status', ...)`

- Typecheck verification: `cd extension && npx tsc --noEmit`

- See also: [[design/api-layer]] — "Custom Notification: flavorGrenade/status"

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension UX layer; status bar reflects server state for vault authors | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — VS Code extension status bar behaviour is verified manually in the Extension Development Host, not via Gherkin scenarios |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — Extension UI module; `tsc --noEmit` type-checking serves as the verification gate. Integration testing is performed manually in the Extension Development Host. | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| — | No ADR directly constrains this task; the `flavorGrenade/status` notification shape is defined in [[design/api-layer]] |

---

## Parent Feature

[[FEAT-017]] — Status Bar Widget and Command Palette Integration

---

## Dependencies

**Blocked by:**

- [[TASK-143]] — Phase E2 must be complete (Extension Development Host smoke test passing) before status bar can be wired to a live LanguageClient.

**Unblocks:**

- [[TASK-145]] — Command registrations depend on the status bar module existing so that `flavorGrenade.showOutput` (referenced as the status bar click command) is contextually meaningful.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/src/status-bar.ts` exists and exports `createStatusBar`

- [ ] `FlavorGrenadeStatus` interface matches the shape defined in [[design/api-layer]]

- [ ] Status bar item uses `StatusBarAlignment.Left` with priority `-1`

- [ ] Notification handler registered for `flavorGrenade/status` with all four state transitions

- [ ] Clicking the status bar item triggers `flavorGrenade.showOutput`

- [ ] `cd extension && npx tsc --noEmit` exits 0

- [ ] No new linter warnings introduced

- [ ] Parent feature [[FEAT-017]] child task row updated to `in-review`

---

## Notes

The `FlavorGrenadeStatus` interface is intentionally defined locally in this file rather than imported from a shared types package. The server and extension are separate packages with no shared dependency; the interface is kept in sync by convention with the API layer design document. If a shared types package is introduced in a future phase, the interface should be moved there.

The `$(loading~spin)` codicon syntax uses VS Code's built-in animated spinner. The `$(check)` and `$(error)` codicons are static icons from the same icon set.

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

> [!SUCCESS] Done — 2026-04-22
> Created `extension/src/status-bar.ts` with `createStatusBar()` matching reference implementation. FlavorGrenadeStatus interface with 4 states (initializing, indexing, ready, error). StatusBarAlignment.Left priority -1. Notification handler for `flavorGrenade/status`. Click command = `flavorGrenade.showOutput`. `tsc --noEmit` exits 0. Status: `done`.
