---
id: "TASK-007"
title: "Configure tsconfig.json"
type: task
# status: open | red | green | refactor | in-review | done | blocked | cancelled
status: open
priority: "high"
phase: "1"
parent: "FEAT-002"
created: "2026-04-17"
updated: "2026-04-17"
# dependencies: list of ticket IDs this ticket is blocked by
dependencies: ["TASK-005"]
tags: [tickets/task, "phase/1"]
aliases: ["TASK-007"]
---

# Configure tsconfig.json

> [!INFO] `TASK-007` · Task · Phase 1 · Parent: [[tickets/FEAT-002]] · Status: `open`

## Description

Create `tsconfig.json` at the project root with the compiler options required for a NestJS + Bun + ESNext TypeScript project. The configuration must enable strict null checks, `noImplicitAny`, decorator metadata emission (`experimentalDecorators` and `emitDecoratorMetadata` — both required for NestJS dependency injection), ESNext target and module format, and bundler module resolution. Output goes to `dist/`; source is rooted at `src/`. Declaration maps and source maps are enabled for IDE integration.

---

## Implementation Notes

- Create `tsconfig.json` at project root with the exact content from the phase plan
- Key flags: `"strict": true`, `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`, `"moduleResolution": "bundler"`, `"outDir": "dist"`, `"rootDir": "src"`
- `"skipLibCheck": true` is required to avoid errors in third-party type definitions
- The `exclude` array must contain `"src/test/**/*"` to keep test support files out of the compiled output
- See also: [[architecture/overview]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Compiler configuration; quality enforcement requirements addressed in later phases | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| — | No BDD scenario targets tsconfig directly |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| — | N/A — pure configuration file; no test | — | N/A — verified by `bun run build` exiting 0 after TASK-009 and TASK-010 are done |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR001-stdio-transport]] | TypeScript strict mode and decorator metadata required for NestJS module system used by LSP server |

---

## Parent Feature

[[tickets/FEAT-002]] — Project Scaffold

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-005]] — TypeScript package must be installed before `tsconfig.json` can be validated.

**Unblocks:**

- [[tickets/TASK-009]] — `src/main.ts` compilation depends on `tsconfig.json`.
- [[tickets/TASK-010]] — `LspModule` compilation depends on `tsconfig.json`.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] `tsconfig.json` exists at project root
- [ ] Contains `"strict": true`, `"experimentalDecorators": true`, `"emitDecoratorMetadata": true`
- [ ] Contains `"moduleResolution": "bundler"`, `"target": "ESNext"`, `"module": "ESNext"`
- [ ] Contains `"outDir": "dist"`, `"rootDir": "src"`
- [ ] Contains `"exclude": ["node_modules", "dist", "src/test/**/*"]`
- [ ] Parent feature [[tickets/FEAT-002]] child task row updated to `in-review`

---

## Notes

`"moduleResolution": "bundler"` is correct for Bun projects. Do not use `"node16"` or `"nodenext"` — those modes require explicit `.js` extensions on all imports, which conflicts with Bun's module resolution behaviour.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-002]].
