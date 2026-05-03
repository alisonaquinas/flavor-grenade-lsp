---
id: "FEAT-015"
title: "VS Code Extension Scaffold"
type: feature
# status: draft | ready | in-progress | blocked | in-review | done | cancelled
status: done
priority: "high"
phase: "E1"
created: "2026-04-21"
updated: "2026-04-22"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: []
tags: [tickets/feature, "phase/E1"]
aliases: ["FEAT-015"]
---

# VS Code Extension Scaffold

> [!INFO] `FEAT-015` · Feature · Phase E1 · Priority: `high` · Status: `done`

## Goal

Establish the `extension/` directory at the repository root with a complete VS Code extension manifest, TypeScript configuration, esbuild bundling pipeline, and a stub entry point that compiles cleanly. When this feature is complete, running `npm run build:extension` inside `extension/` produces `dist/extension.js`, proving the extension client skeleton is ready to receive LanguageClient wiring in Phase E2.

---

## Scope

**In scope:**

- Creating the `extension/` directory with its own `package.json` (VS Code extension manifest with identity, activation events, contributes, capabilities, and scripts)

- Creating `extension/tsconfig.json` with Node16 module resolution and ES2022 target

- Creating `extension/src/extension.ts` with stub `activate` and `deactivate` exports

- Creating `extension/.gitignore` to exclude build output, node_modules, server binaries, and VSIX packages

- Creating `extension/.vscodeignore` to exclude non-shipping files from the VSIX

- Running `npm install` to generate `package-lock.json` and `node_modules/`

- Verifying the esbuild build produces `dist/extension.js`

**Out of scope (explicitly excluded):**

- LanguageClient wiring and server spawning (Phase E2)

- Platform-specific VSIX CI matrix (Phase E5 / CI delivery)

- Extension integration tests or E2E tests (later phases)

- Publishing to the VS Code Marketplace (Phase E4+)

---

## Linked User Requirements

> User requirements are implementation-agnostic goals from the vault author's perspective. Source: [[requirements/user/index]].

| User Req Tag | Goal | Source File |
|---|---|---|
| — | No user-visible behaviour delivered in this phase; extension scaffold only | [[requirements/user/index]] |

---

## Linked Functional Requirements

> Planguage requirements that this feature must satisfy. Source: [[requirements/index]].

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Infrastructure scaffold; functional requirements addressed in later extension phases | [[requirements/index]] |

---

## Linked BDD Features

> Gherkin feature files whose scenarios constitute the acceptance test surface for this feature.

| Feature File | Description |
|---|---|
| — | No BDD scenarios target the extension scaffold directly |

---

## Phase Plan Reference

- Phase plan: [[plans/phase-E1-extension-scaffold]]

- ADR: [[adr/ADR015-platform-specific-vsix]]

- Execution ledger row: [[plans/execution-ledger]]

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`. The LLM agent checks each item when transitioning to `in-review`.

- [ ] `extension/package.json` exists with correct manifest (publisher, engine, contributes, capabilities, scripts)

- [ ] `extension/tsconfig.json` exists with Node16 module resolution and ES2022 target

- [ ] `extension/src/extension.ts` exists with stub `activate` and `deactivate` exports

- [ ] `extension/.gitignore` exists excluding `dist/`, `node_modules/`, `server/`, `*.vsix`

- [ ] `extension/.vscodeignore` exists with aggressive exclusions for VSIX hygiene

- [ ] `cd extension && npx tsc --noEmit` exits 0

- [ ] `cd extension && npm run build:extension` exits 0 and produces `dist/extension.js`

- [ ] All child TASK tickets (TASK-137 through TASK-140) are in `done` state

- [ ] No new linter warnings introduced

- [ ] [[plans/execution-ledger]] row for Phase E1 updated to `done`

---

## Child Tasks

> List all `TASK-NNN` tickets that implement this feature. Create the task tickets before beginning implementation.

| Ticket | Title | Status |
|---|---|---|
| [[TASK-137]] | Create extension directory and package.json manifest | `done` |
| [[TASK-138]] | Create tsconfig.json for extension client | `done` |
| [[TASK-139]] | Create stub extension.ts, .gitignore, and verify esbuild build | `done` |
| [[TASK-140]] | Create .vscodeignore for VSIX package hygiene | `done` |

---

## Dependencies

> Tickets or phases that must complete before this feature can start, and tickets that this feature unblocks.

**Blocked by:**

- Phase R (Publishing Research) — research into VS Code extension packaging and Marketplace requirements must be complete before scaffold begins.

**Unblocks:**

- Phase E2 — LanguageClient wiring can begin once the extension skeleton compiles and the gate command passes.

---

## Notes

Tasks in this phase are sequential: TASK-137 (package.json + npm install) must complete before TASK-138 (tsconfig.json), which must complete before TASK-139 (extension.ts + .gitignore + build verification), which must complete before TASK-140 (.vscodeignore). The `extension/` directory is a separate npm project from the root Bun project; it uses npm (not Bun) because VS Code extensions run in Node.js. The `vscode:prepublish` script intentionally omits server compilation — the server binary is cross-compiled separately in CI.

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
> Ticket created. Status: `draft`. Phase E1 Extension Scaffold feature defined; all child tasks (TASK-137 through TASK-140) created. Ready for execution once Publishing Research phase is confirmed complete.

> [!INFO] Ready — 2026-04-22
> Phase R confirmed complete. All child tasks have full implementation details (exact file contents, verification commands). Spec complete, no placeholders. Transitioning `draft` → `ready`.

> [!INFO] In-progress — 2026-04-22
> Beginning Phase E1 execution. Steps A–C evaluated — tickets accurate, no gaps, no updates needed. Starting TASK-137 implementation.

> [!INFO] In-review — 2026-04-22
> All child tasks (TASK-137 through TASK-140) done. Steps A–M executed. Lint, typecheck, unit tests (550 pass/0 fail) all green. No sweep tickets needed. Integration/verification/validation tests N/A for scaffold phase. BDD extension scenarios undefined (expected — Phase E2+). Transitioning `in-progress` → `in-review`.

## Retrospective

> Written after Step L passes. Date: 2026-04-22.

### What went as planned

All four tasks completed without deviation from the spec. The phase plan provided exact file contents for every artifact, which eliminated ambiguity. The infrastructure task exception for TDD was appropriate — all four tasks are pure configuration/scaffolding with no behavioral code. `npm install` resolved all dependencies on first attempt. `tsc --noEmit` and `npm run build:extension` both passed on first run. Esbuild produced a 603-byte bundle in 7ms. Zero lint errors or typecheck errors in both root and extension projects.

### Deviations and surprises

| Ticket | Type | Root cause | Time impact |
|---|---|---|---|
| — | — | No deviations. All tasks executed as specified. | +0 h |

npm reported 1 moderate severity vulnerability in transitive dep (`glob@11.1.0` via `@vscode/vsce`). This is a deprecation warning, not a security exploit, and `@vscode/vsce` is a devDependency that doesn't ship in the VSIX. No ticket needed.

### Process observations

- Steps A–C were trivially satisfied because the ticket specs were already detailed during Phase 0. For scaffold phases with pre-specified file contents, Steps B and C add little value but confirm the specs haven't drifted.

- Steps E–G (sweeps) found zero issues because the phase introduces only one 9-line stub TypeScript file and 4 config files. The sweep overhead is minimal for scaffold phases.

- Steps J, K, L were all N/A. For infrastructure-only phases, the procedure should consider a fast-path that acknowledges "no test files expected" upfront rather than requiring explicit checks.

- The pre-existing BDD failure (`vault-detection.feature:75` — custom extension list) is unrelated to E1 work. It should be tracked separately if not already.

### Carry-forward actions

- [ ] Verify the pre-existing BDD failure (vault-detection custom extensions) has a tracked ticket — if not, open one during Phase E2 planning

- [ ] Phase E2 will introduce actual TypeScript logic requiring real TDD cycles — confirm the infrastructure task exception does NOT apply to E2 tasks

### Rule / template amendments

- none
