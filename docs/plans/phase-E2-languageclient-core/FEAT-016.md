---
id: "FEAT-016"
title: "LanguageClient Core Activation"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: draft
priority: "high"
phase: "E2"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["FEAT-015"]
tags: [tickets/feature, "phase/E2"]
aliases: ["FEAT-016"]
---

# LanguageClient Core Activation

> [!INFO] `FEAT-016` · Feature · Phase E2 · Priority: `high` · Status: `draft`

## Goal

When a vault author opens a Markdown file in VS Code with the Flavor Grenade extension installed, the extension automatically locates its bundled language server, launches it, and completes the LSP initialization handshake — all without requiring the author to install any additional binaries or configure any paths. The editor is then ready to provide Obsidian Flavored Markdown intelligence (completions, diagnostics, navigation) powered by the running server. Authors who build the server locally for development can override the binary path via a single setting.

---

## Scope

**In scope:**

- 2-tier binary resolution: user setting `flavorGrenade.server.path` overrides the bundled binary at `server/flavor-grenade-lsp[.exe]`
- `LanguageClient` v9.x configuration with Executable ServerOptions over stdio transport
- `activate()` wiring: resolve server path, build ServerOptions and ClientOptions, start client, push to `context.subscriptions`
- `deactivate()` lifecycle: rely on Disposable cleanup via `context.subscriptions` (no explicit `client.stop()`)
- `documentSelector` targeting `{ scheme: 'file', language: 'markdown' }`
- `initializationOptions` forwarding configuration values from `flavorGrenade.*` settings
- `fileEvents` watcher for `**/*.md`
- `extension/.vscode/launch.json` for Extension Development Host debugging
- Manual smoke test: extension activates, server spawns, LSP handshake succeeds

**Out of scope (explicitly excluded):**

- Auto-download or PATH-based server discovery (design decision: bundled binary only)
- Environment variable fallback for server path
- Automated integration tests for the extension (future phase)
- Any LSP feature implementation beyond the initialization handshake (completions, diagnostics, etc. are server-side)
- Extension marketplace packaging and publishing (Phase E3+)
- Output channel log formatting or verbosity settings

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | Extension activation is invisible infrastructure; user-visible features (completions, diagnostics) depend on this but are delivered by the server | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension infrastructure; functional requirements are fulfilled by the LSP server, not the client wrapper | [[requirements/index]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | N/A — Extension activation is verified via manual smoke test in Extension Development Host; BDD scenarios target the LSP server, not the VS Code client |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E2-languageclient-core]]
- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `extension/src/server-path.ts` exists and exports `resolveServerPath()`
- [ ] `extension/src/extension.ts` creates and starts a `LanguageClient` with Executable ServerOptions (stdio)
- [ ] Client is pushed to `context.subscriptions` for automatic disposal
- [ ] `extension/.vscode/launch.json` exists with an `extensionHost` configuration
- [ ] Extension activates in Extension Development Host when a `.md` file is opened
- [ ] LSP initialization handshake succeeds (visible in output channel)
- [ ] `cd extension && npx tsc --noEmit` exits 0
- [ ] No new linter warnings introduced

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[TASK-141]] | Implement 2-tier server binary resolution | `open` |
| [[TASK-142]] | Implement LanguageClient activation and deactivate lifecycle | `open` |
| [[TASK-143]] | Create launch.json and smoke test in Extension Development Host | `open` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- [[FEAT-015]] — Phase E1 (Extension Scaffold) must be complete; `extension/` project structure, `package.json`, `tsconfig.json`, and stub `extension.ts` must exist before LanguageClient code can be written.

**Unblocks:**

- Future Phase E3+ tickets — Extension packaging, marketplace publishing, and integration testing depend on a working LanguageClient activation.

---

## Notes

- ADR references: [[adr/ADR001-stdio-transport]] (stdio as the sole transport), [[adr/ADR015-platform-specific-vsix]] (platform-specific VSIXs guarantee the bundled binary is present).
- The 2-tier resolution deliberately omits PATH fallback and environment variable discovery. Platform-specific VSIXs bundle the correct binary, and the user setting provides the escape hatch for local development.
- `deactivate()` is intentionally empty — `LanguageClient` implements `Disposable`, so pushing it to `context.subscriptions` handles cleanup automatically.
- Tasks are sequential: TASK-141 (resolution) must land before TASK-142 (activation imports it), and TASK-142 must land before TASK-143 (smoke test requires a working client).

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
> Ticket created. Status: `draft`. LanguageClient Core Activation feature defined; all child tasks (TASK-141 through TASK-143) created. Blocked by FEAT-015 until Phase E1 Extension Scaffold is complete.
