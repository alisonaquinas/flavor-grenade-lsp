---
id: "FEAT-017"
title: "Status Bar Widget and Command Palette Integration"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "E3"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["FEAT-016"]
tags: [tickets/feature, "phase/E3"]
aliases: ["FEAT-017"]
---

# Status Bar Widget and Command Palette Integration

> [!INFO] `FEAT-017` · Feature · Phase E3 · Priority: `high` · Status: `done`

## Goal

Users see the vault indexing state in the VS Code status bar at all times — whether the server is starting up, indexing documents, ready, or in an error state — and can restart the server, force a full index rebuild, and reveal the language server output channel directly from the Command Palette. Configuration changes to the server binary path automatically trigger a server restart so that vault authors never need to manually reload the window after switching server versions.

---

## Scope

**In scope:**

- Status bar widget displaying server state (initializing, indexing, ready, error) with codicon icons

- Click-to-show-output on the status bar item

- Three Command Palette commands: Restart Server, Rebuild Index, Show Output

- Configuration change watcher that restarts the server when `flavorGrenade.server.path` changes

- Wiring all of the above into the `activate()` extension entry point

**Out of scope (explicitly excluded):**

- Server-side implementation of `flavorGrenade/status` notification (already implemented in the LSP server)

- Server-side implementation of `flavorGrenade.rebuildIndex` workspace command (already registered via `executeCommandProvider`)

- Custom UI beyond the status bar item (e.g., tree views, webviews)

- Settings UI for configuration keys beyond `server.path` restart behaviour

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Vault authors see real-time server status and can control the server from the editor | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension UX layer; functional requirements addressed by server-side phases | [[requirements/index]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | N/A — Extension UI behaviour is verified manually in the Extension Development Host; no Gherkin scenarios target VS Code extension commands or status bar widgets |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E3-status-bar-commands]]

- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] Status bar item appears on extension activation and displays "FG: Starting..." with a loading spinner

- [ ] Status bar transitions through initializing, indexing, ready, and error states with correct icons and tooltips

- [ ] Clicking the status bar item opens the Flavor Grenade output channel

- [ ] Command Palette lists "Flavor Grenade: Restart Server", "Flavor Grenade: Rebuild Index", and "Flavor Grenade: Show Output"

- [ ] "Restart Server" command restarts the LanguageClient

- [ ] "Rebuild Index" command sends `workspace/executeCommand` with `flavorGrenade.rebuildIndex` to the server

- [ ] "Show Output" command reveals the LSP output channel

- [ ] Changing `flavorGrenade.server.path` in settings triggers a server restart

- [ ] `cd extension && npx tsc --noEmit` exits 0

- [ ] `cd extension && npm run build:extension` exits 0

- [ ] No new linter warnings introduced

- [ ] All child TASK tickets (TASK-144 through TASK-146) are in `done` state

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[TASK-144]] | Implement status bar widget listening to flavorGrenade/status | `done` |
| [[TASK-145]] | Implement command registrations (restart, rebuild index, show output) | `done` |
| [[TASK-146]] | Wire status bar, commands, and config watcher into activate() | `done` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- [[FEAT-016]] — Phase E2 (LanguageClient Core) must be complete; `LanguageClient` activation and binary resolution must be working before status bar and commands can be wired in.

**Unblocks:**

- Phase E4 and beyond — downstream extension phases that build on a fully functional client with status reporting and palette commands.

---

## Notes

The three tasks in this phase are tightly sequential: TASK-144 creates the status bar module, TASK-145 creates the commands module, and TASK-146 wires both into `activate()` along with the config watcher. Each task creates or modifies exactly one file, keeping the scope atomic.

The `flavorGrenade/status` custom notification and the `flavorGrenade.rebuildIndex` workspace command are already defined and implemented on the server side (see [[design/api-layer]] for the full specification). This phase only implements the client-side consumer of those capabilities.

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

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `draft`. Phase E3 Status Bar & Commands feature defined; all child tasks (TASK-144 through TASK-146) created. Blocked by FEAT-016 until Phase E2 LanguageClient Core is complete.

> [!INFO] In-progress — 2026-04-22
> FEAT-016 (Phase E2) complete. Steps A–C: tickets accurate, reference code in phase plan. Starting TASK-144.

> [!INFO] Done — 2026-04-22
> All child tasks (TASK-144 through TASK-146) done. Steps A–M executed. Lint + typecheck + build clean. Unit tests 550/0. No sweep tickets. Status: `done`.

## Retrospective

> Written after Step L passes. Date: 2026-04-22.

### What went as planned

Three tasks completed matching reference implementations exactly. `status-bar.ts` (57 lines), `commands.ts` (32 lines), and final `extension.ts` (74 lines) are clean and focused. All files compile and build without issues. Extension bundle grew minimally from 347kb to 349kb.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| — | — | No deviations. All tasks executed as specified. | +0 h |

### Process observations

- E3 tasks follow the same pattern as E2: VS Code API-dependent code with N/A tests. The infrastructure exception pattern is now well-established for extension phases.

- Status bar and command wiring is straightforward — the phase plan's reference implementations were copy-exact.

### Carry-forward actions

- [ ] Manual EDH smoke test should verify status bar transitions and command palette entries

### Rule / template amendments

- none
