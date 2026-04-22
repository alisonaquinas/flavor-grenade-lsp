---
id: "TASK-143"
title: "Create launch.json and smoke test in Extension Development Host"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E2"
parent: "FEAT-016"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-142"]
tags: [tickets/task, "phase/E2"]
aliases: ["TASK-143"]
---

# Create launch.json and smoke test in Extension Development Host

> [!INFO] `TASK-143` · Task · Phase E2 · Parent: [[FEAT-016]] · Status: `open`

## Description

Create `extension/.vscode/launch.json` with an `extensionHost` debug configuration so developers can press F5 in VS Code to launch the Extension Development Host with the Flavor Grenade extension loaded. Build the server binary locally for the host platform using `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp` (appending `.exe` on Windows). Then perform a manual smoke test: open the `extension/` folder in VS Code, launch the Extension Development Host, open a `.md` file, and verify that the extension activates, the server process spawns, and the LSP initialization handshake succeeds (visible in the Flavor Grenade output channel). Commit the `launch.json` file. This task gates Phase E2 — the smoke test outcome confirms the full activation path works end-to-end.

---

## Implementation Notes

- Create new file: `extension/.vscode/launch.json`
- Configuration type: `extensionHost` with `request: "launch"`
- Args: `["--extensionDevelopmentPath=${workspaceFolder}"]`
- OutFiles: `["${workspaceFolder}/dist/**/*.js"]`
- Build server binary for host platform from the repository root:
  - Linux/macOS: `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp`
  - Windows: `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp.exe`
  - Note: local builds omit `--bytecode` (CI-only optimization) and `--target` (compiles for host platform)
- Manual verification steps:
  1. Open `extension/` in VS Code
  2. Press F5 to launch Extension Development Host
  3. Open any `.md` file in the Extension Development Host
  4. Check the Output panel for "Flavor Grenade" channel
  5. Confirm LSP initialization handshake messages appear (server capabilities, etc.)
- The server binary itself is gitignored — only `launch.json` is committed
- See also: [[plans/phase-E2-languageclient-core]] task 3 for the reference configuration

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension infrastructure; launch configuration and smoke test verify the client-server integration path, not a specific functional requirement | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — Smoke test is a manual verification in Extension Development Host; no automated BDD scenario covers extension activation |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — This task produces a debug launch configuration and a manual smoke test; automated extension integration tests are deferred to a future phase | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | Server binary communicates over stdio — the Extension Development Host must spawn it as a child process, not connect to a socket |
| [[adr/ADR015-platform-specific-vsix]] | Platform-specific VSIXs bundle native binaries — local smoke test requires building the binary for the host platform manually |

---

## Parent Feature

[[FEAT-016]] — LanguageClient Core Activation

---

## Dependencies

**Blocked by:**

- [[TASK-142]] — `extension/src/extension.ts` must contain the full LanguageClient activation code before the Extension Development Host can successfully launch the server.

**Unblocks:**

- Phase E2 gate — This is the final task in Phase E2; successful smoke test confirms the phase gate criteria are met.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/.vscode/launch.json` exists with an `extensionHost` configuration
- [ ] Launch configuration includes `--extensionDevelopmentPath=${workspaceFolder}` in args
- [ ] Launch configuration includes `outFiles` pointing to `${workspaceFolder}/dist/**/*.js`
- [ ] Server binary built locally via `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp[.exe]`
- [ ] Extension Development Host launches successfully when pressing F5
- [ ] Opening a `.md` file in the Extension Development Host triggers extension activation
- [ ] LSP initialization handshake succeeds (confirmed in Flavor Grenade output channel)
- [ ] `launch.json` committed to version control
- [ ] Parent feature [[FEAT-016]] child task row updated to `in-review`

---

## Notes

The `launch.json` is the only file committed in this task — the compiled server binary at `extension/server/flavor-grenade-lsp[.exe]` is gitignored and must be built locally before each smoke test session. The `--bytecode` flag is intentionally omitted from local builds (it is a CI-only optimization). The `--target` flag is also omitted so that Bun compiles for the host platform. If the smoke test fails, check: (1) the server binary exists at the expected path, (2) the binary has execute permissions (Linux/macOS), (3) the output channel shows the LanguageClient attempting to spawn the process.

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

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[FEAT-016]].
