---
id: "TASK-138"
title: "Create tsconfig.json for extension client"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "E1"
parent: "FEAT-015"
created: "2026-04-21"
updated: "2026-04-21"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-137"]
tags: [tickets/task, "phase/E1"]
aliases: ["TASK-138"]
---

# Create tsconfig.json for extension client

> [!INFO] `TASK-138` · Task · Phase E1 · Parent: [[tickets/FEAT-015]] · Status: `open`

## Description

Create `extension/tsconfig.json` with the TypeScript compiler options required for a VS Code extension client. The configuration uses Node16 module resolution (because the extension runs in VS Code's Node.js host), ES2022 target, strict mode, and outputs to `dist/` with source rooted at `src/`. esbuild handles the actual bundling; the tsconfig is used for type-checking via `tsc --noEmit`.

---

## Implementation Notes

- Create `extension/tsconfig.json` with the exact content from the phase plan [[plans/phase-E1-extension-scaffold]]
- Key flags: `"target": "ES2022"`, `"module": "Node16"`, `"moduleResolution": "Node16"`, `"strict": true`, `"strictNullChecks": true`, `"noImplicitAny": true`, `"esModuleInterop": true`
- Output: `"outDir": "dist"`, `"rootDir": "src"`
- `"declaration": false` — extension client does not publish types
- `"skipLibCheck": true` — avoids errors in third-party type definitions
- Uses Node16 module resolution (not bundler) because the extension runs in VS Code's Node.js host; esbuild handles the bundling step separately
- See also: [[plans/phase-E1-extension-scaffold]]

---

## Linked Functional Requirements

> The specific Planguage requirement tags this task provides evidence for. Every task must satisfy at least one. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Compiler configuration for extension client; no functional requirement tag yet assigned | [[requirements/index]] |

---

## Linked BDD Scenarios

> The specific Gherkin scenarios in `docs/bdd/features/` that become passing when this task is complete.

| Feature File | Scenario Title |
|---|---|
| — | N/A — extension client has no BDD scenarios; tsconfig verified by `tsc --noEmit` after TASK-139 |

---

## Linked Tests

> Test files in `tests/` that are written or updated as part of this task.

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — pure configuration file; verified by `tsc --noEmit` exiting 0 after TASK-139 creates source files | — | N/A |

---

## Linked ADRs

> Architecture decisions that constrain how this task must be implemented.

| ADR | Decision |
|---|---|
| [[adr/ADR015-platform-specific-vsix]] | Extension client targets Node.js (VS Code host), not Bun; Node16 module resolution is required |

---

## Parent Feature

[[tickets/FEAT-015]] — VS Code Extension Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-137]] — TypeScript and `@types/vscode` must be installed (via `npm install`) before `tsconfig.json` can be validated.

**Unblocks:**

- [[tickets/TASK-139]] — `extension.ts` compilation and esbuild verification depend on `tsconfig.json` existing.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `extension/tsconfig.json` exists
- [ ] Contains `"target": "ES2022"`, `"module": "Node16"`, `"moduleResolution": "Node16"`
- [ ] Contains `"strict": true`, `"strictNullChecks": true`, `"noImplicitAny": true`
- [ ] Contains `"outDir": "dist"`, `"rootDir": "src"`
- [ ] Contains `"include": ["src/**/*"]` and `"exclude": ["node_modules", "dist"]`
- [ ] Parent feature [[tickets/FEAT-015]] child task row updated to `in-review`

---

## Notes

Node16 module resolution is correct for the extension client because it runs in VS Code's Node.js host process. This differs from the root LSP server project which uses bundler resolution for Bun. The tsconfig is primarily used for type-checking (`tsc --noEmit`); esbuild performs the actual bundling for the extension output.

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

> [!WARNING] `red` before `green` is non-negotiable. However, this is a pure configuration task with no unit tests — the RED/GREEN cycle is satisfied by verifying `tsc --noEmit` exits 0 after TASK-139 provides source files. See [[templates/tickets/lifecycle/task-lifecycle]] for infrastructure task exceptions.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-21
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-015]].
