---
id: "TASK-139"
title: "Create stub extension.ts, .gitignore, and verify esbuild build"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: done
priority: "high"
phase: "E1"
parent: "FEAT-015"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-138"]
tags: [tickets/task, "phase/E1"]
aliases: ["TASK-139"]
---

# Create stub extension.ts, .gitignore, and verify esbuild build

> [!INFO] `TASK-139` · Task · Phase E1 · Parent: [[FEAT-015]] · Status: `done`

## Description

Create `extension/src/extension.ts` with stub `activate` and `deactivate` exports (empty bodies with Phase E2 placeholder comments). Create `extension/.gitignore` to exclude `dist/`, `node_modules/`, `server/`, and `*.vsix` from version control. After both files are written, run `npx tsc --noEmit` to verify type-checking passes and `npm run build:extension` to verify esbuild produces `dist/extension.js`. This task is the primary gate verification step for Phase E1.

---

## Implementation Notes

- Create `extension/src/` directory
- Write `extension/src/extension.ts` with the exact content from the phase plan [[plans/phase-E1-extension-scaffold]]:
  - `import type { ExtensionContext } from 'vscode';`
  - `export function activate(_context: ExtensionContext): void { /* Phase E2 — LanguageClient setup */ }`
  - `export function deactivate(): void { /* Phase E2 — client.stop() */ }`
- Write `extension/.gitignore` with: `dist/`, `node_modules/`, `server/`, `*.vsix`
- Verify: `cd extension && npx tsc --noEmit` exits 0
- Verify: `cd extension && npm run build:extension` exits 0
- Verify: `extension/dist/extension.js` exists after build
- See also: [[plans/phase-E1-extension-scaffold]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Infrastructure scaffold; stub entry point has no functional behaviour | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — extension client has no BDD scenarios; verified by esbuild producing `dist/extension.js` |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — stub entry point; verified by `tsc --noEmit` and `npm run build:extension` exiting 0 | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Extension entry point must export `activate`/`deactivate`; esbuild bundles to single `dist/extension.js` with `vscode` as external |

---

## Parent Feature

[[FEAT-015]] — VS Code Extension Scaffold

---

## Dependencies

**Blocked by:**

- [[TASK-138]] — `tsconfig.json` must exist before TypeScript can type-check or esbuild can resolve configuration.

**Unblocks:**

- [[TASK-140]] — `.vscodeignore` creation depends on having a buildable extension with `dist/` output to verify VSIX content.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/src/extension.ts` exists with stub `activate` and `deactivate` exports
- [ ] `extension/.gitignore` exists excluding `dist/`, `node_modules/`, `server/`, `*.vsix`
- [ ] `cd extension && npx tsc --noEmit` exits 0
- [ ] `cd extension && npm run build:extension` exits 0
- [ ] `extension/dist/extension.js` exists after build
- [ ] Parent feature [[FEAT-015]] child task row updated to `in-review`

---

## Notes

The `activate` function body is intentionally empty — LanguageClient setup will be wired in Phase E2. The `deactivate` function is also empty; it will call `client.stop()` once the client exists. The esbuild command externals `vscode` because VS Code provides that module at runtime. The `.gitignore` includes `server/` because platform-specific server binaries will be copied into the extension at VSIX packaging time but should not be committed.

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

> [!WARNING] `red` before `green` is non-negotiable. However, this is an infrastructure task — the RED/GREEN cycle is satisfied by verifying `tsc --noEmit` and `npm run build:extension` both exit 0 and `dist/extension.js` is produced. See [[templates/tickets/lifecycle/task-lifecycle]] for infrastructure task exceptions.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[FEAT-015]].

> [!CHECK] Done — 2026-04-22
> Infrastructure task exception. Created `extension/src/extension.ts` with stub `activate`/`deactivate` exports. Created `extension/.gitignore` excluding `dist/`, `node_modules/`, `server/`, `*.vsix`. Verification: `tsc --noEmit` exited 0, `npm run build:extension` exited 0 (7ms, 603b output), `dist/extension.js` + `dist/extension.js.map` produced. All DoD items satisfied. Status: `done`.
