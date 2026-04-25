---
id: "TASK-141"
title: "Implement 2-tier server binary resolution"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "E2"
parent: "FEAT-016"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-140"]
tags: [tickets/task, "phase/E2"]
aliases: ["TASK-141"]
---

# Implement 2-tier server binary resolution

> [!INFO] `TASK-141` · Task · Phase E2 · Parent: [[FEAT-016]] · Status: `done`

## Description

Create `extension/src/server-path.ts` with a `resolveServerPath(context: ExtensionContext)` function that implements 2-tier binary resolution for the flavor-grenade-lsp server. Tier 1: if the user has set `flavorGrenade.server.path` in their VS Code settings, return that path directly. Tier 2: otherwise, return the path to the bundled binary at `server/flavor-grenade-lsp[.exe]` relative to the extension's install directory. The function appends `.exe` on Windows (`process.platform === 'win32'`) and uses `Uri.joinPath` on the extension URI for correct cross-platform path construction. No PATH fallback, no environment variable lookup, no download mechanism — platform-specific VSIXs guarantee the binary is present at tier 2.

---

## Implementation Notes

- Create new file: `extension/src/server-path.ts`
- Import `ExtensionContext`, `Uri`, and `workspace` from `vscode`
- Read `flavorGrenade.server.path` via `workspace.getConfiguration('flavorGrenade').get<string>('server.path')`
- Guard against empty/whitespace-only strings in the custom path check
- Use `Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath` for the bundled binary path
- Binary name: `flavor-grenade-lsp.exe` on `win32`, `flavor-grenade-lsp` on all other platforms
- Typecheck after creation: `cd extension && npx tsc --noEmit`
- See also: [[plans/phase-E2-languageclient-core]] task 1 for the reference implementation

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Extension infrastructure; binary resolution is a client-side concern not covered by server functional requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — Binary resolution is extension-side infrastructure; BDD scenarios target the LSP server protocol, not the VS Code extension wrapper |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — `resolveServerPath` depends on `vscode` API (`ExtensionContext`, `Uri`, `workspace`) which requires the VS Code extension host to run; unit testing is deferred to when a mock strategy is established | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | LSP uses stdio transport — the resolved path must point to an executable binary, not a module |
| [[adr/ADR015-platform-specific-vsix]] | Platform-specific VSIXs bundle the native binary — no PATH fallback or download needed |

---

## Parent Feature

[[FEAT-016]] — LanguageClient Core Activation

---

## Dependencies

**Blocked by:**

- [[TASK-140]] — Phase E1 must be complete; `extension/` project structure, `package.json`, `tsconfig.json`, and `vscode` type dependency must exist before this file can be created and type-checked.

**Unblocks:**

- [[TASK-142]] — LanguageClient activation imports `resolveServerPath` from this module.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/src/server-path.ts` exists and exports `resolveServerPath(context: ExtensionContext): string`
- [ ] Tier 1: returns `flavorGrenade.server.path` setting value when non-empty
- [ ] Tier 2: returns `Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath` when no custom path
- [ ] Appends `.exe` suffix on `win32`, no suffix on other platforms
- [ ] No PATH fallback, no env var, no download logic
- [ ] `cd extension && npx tsc --noEmit` exits 0
- [ ] `bun run lint --max-warnings 0` passes (or extension-local equivalent)
- [ ] Parent feature [[FEAT-016]] child task row updated to `in-review`

---

## Notes

The reference implementation is provided in [[plans/phase-E2-languageclient-core]] task 1. The function is intentionally simple and synchronous — it reads one config value and builds one path. The deliberate omission of PATH scanning, environment variables, and download-on-demand keeps the resolution predictable and debuggable. If the bundled binary is missing (corrupt VSIX, manual deletion), the LanguageClient will fail to spawn and report the error in the output channel — no silent fallback.

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

> [!CHECK] Done — 2026-04-22
> Created `extension/src/server-path.ts` with `resolveServerPath()` matching reference implementation exactly. Tier 1: reads `flavorGrenade.server.path` config, guards empty/whitespace. Tier 2: `Uri.joinPath` to bundled binary with `.exe` on win32. No PATH/env/download fallback. `tsc --noEmit` exits 0. Linked Tests N/A per ticket (VS Code API dependency — no mock strategy established). All DoD items satisfied. Status: `done`.
