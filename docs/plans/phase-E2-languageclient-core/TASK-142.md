---
id: "TASK-142"
title: "Implement LanguageClient activation and deactivate lifecycle"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E2"
parent: "FEAT-016"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-141"]
tags: [tickets/task, "phase/E2"]
aliases: ["TASK-142"]
---

# Implement LanguageClient activation and deactivate lifecycle

> [!INFO] `TASK-142` · Task · Phase E2 · Parent: [[FEAT-016]] · Status: `open`

## Description

Replace the stub `extension/src/extension.ts` (created in Phase E1) with the full LanguageClient activation and deactivation lifecycle. The `activate()` function resolves the server binary path via `resolveServerPath()`, constructs Executable `ServerOptions` (stdio is the default transport for the `command` form), builds `LanguageClientOptions` with a Markdown document selector, file system watcher, and initialization options forwarded from `flavorGrenade.*` configuration, then creates and starts the `LanguageClient`. The client is pushed to `context.subscriptions` so that VS Code's disposal mechanism handles `stop()` on deactivation — the `deactivate()` export is intentionally empty. This is the central wiring task that connects binary resolution (TASK-141) to the VS Code extension lifecycle.

---

## Implementation Notes

- Modify existing file: `extension/src/extension.ts` (replace E1 stub contents)
- Import `LanguageClient`, `LanguageClientOptions`, `ServerOptions` from `vscode-languageclient/node`
- Import `resolveServerPath` from `./server-path.js`
- Module-level `let client: LanguageClient | undefined` for potential future reference
- `ServerOptions` uses the Executable form: `{ run: { command: serverPath }, debug: { command: serverPath } }`
- `LanguageClientOptions.documentSelector`: `[{ scheme: 'file', language: 'markdown' }]`
- `LanguageClientOptions.synchronize.fileEvents`: `workspace.createFileSystemWatcher('**/*.md')`
- `LanguageClientOptions.initializationOptions`: forward `linkStyle`, `completion.candidates`, `diagnostics.suppress` from `flavorGrenade` config
- Client ID: `'flavorGrenade'`, display name: `'Flavor Grenade'`
- `await client.start()` in activate, then `context.subscriptions.push(client)`
- `deactivate()` body is empty — cleanup handled by subscriptions disposal
- Typecheck and build after modification: `cd extension && npx tsc --noEmit`
- See also: [[plans/phase-E2-languageclient-core]] task 2 for the reference implementation

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension infrastructure; LanguageClient wiring is a client-side concern not covered by server functional requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — LanguageClient lifecycle is extension-side infrastructure; BDD scenarios target the LSP server protocol, not the VS Code client wrapper |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — `activate()` and `deactivate()` depend on the full VS Code extension host runtime; unit testing requires `@vscode/test-electron` or equivalent, deferred to a future integration test phase | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | LanguageClient must use Executable ServerOptions with stdio transport (the default for `command` form) — no socket, no pipe |
| [[adr/ADR015-platform-specific-vsix]] | Bundled binary is guaranteed present in platform-specific VSIXs — no fallback download logic in activation |

---

## Parent Feature

[[FEAT-016]] — LanguageClient Core Activation

---

## Dependencies

**Blocked by:**

- [[TASK-141]] — `resolveServerPath()` must exist in `extension/src/server-path.ts` before this file can import it.

**Unblocks:**

- [[TASK-143]] — Smoke testing in Extension Development Host requires a working `activate()` that spawns the server.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/src/extension.ts` exports `activate(context: ExtensionContext): Promise<void>`
- [ ] `extension/src/extension.ts` exports `deactivate(): void`
- [ ] `activate()` calls `resolveServerPath(context)` to obtain the server binary path
- [ ] `ServerOptions` uses Executable form with `command` property (stdio default)
- [ ] `LanguageClientOptions.documentSelector` targets `{ scheme: 'file', language: 'markdown' }`
- [ ] `LanguageClientOptions.synchronize.fileEvents` watches `**/*.md`
- [ ] `LanguageClientOptions.initializationOptions` forwards `linkStyle`, `completion.candidates`, `diagnostics.suppress`
- [ ] Client is pushed to `context.subscriptions` for disposal
- [ ] `deactivate()` body is empty (disposal via subscriptions)
- [ ] `cd extension && npx tsc --noEmit` exits 0
- [ ] `bun run lint --max-warnings 0` passes (or extension-local equivalent)
- [ ] Parent feature [[FEAT-016]] child task row updated to `in-review`

---

## Notes

The reference implementation is provided in [[plans/phase-E2-languageclient-core]] task 2. Key design choice: `client.start()` is awaited in `activate()`, meaning VS Code will wait for the LSP handshake before considering the extension fully activated. If the server binary is missing or crashes, the LanguageClient will surface the error in the output channel. The `deactivate()` function is deliberately empty because `LanguageClient` implements `Disposable` and `context.subscriptions.push(client)` ensures `stop()` is called during extension host shutdown.

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
