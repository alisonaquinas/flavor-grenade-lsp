---
id: "TASK-169"
title: "Add file operation capability handler"
type: task
status: green
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: []
tags: [tickets/task, "phase/16"]
aliases: ["TASK-169"]
---

# Add file operation capability handler

> [!INFO] `TASK-169` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `green`

## Description

Register file operation capabilities and route `workspace/willRenameFiles`
requests into the Phase 16 refactor pipeline. The handler must accept file,
folder, and attachment move notifications, return a WorkspaceEdit when planning
succeeds, and return no edit when there is nothing local to update.

---

## Implementation Notes

- Add capability registration for `workspace.fileOperations.willRename`
- Keep request handlers async
- Do not mutate the VaultIndex from `willRenameFiles`
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.CapabilityRegistration` | Advertise and handle LSP file-operation rename capability | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.AtomicRefactor` | File operation requests produce one pre-apply WorkspaceEdit | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/lsp/handlers/file-operations.spec.ts` | Unit | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | File operations are handled through LSP WorkspaceEdit planning |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[TASK-170]] — move planning depends on the request entry point

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `workspace/willRenameFiles` is registered and dispatched asynchronously
- [ ] No VaultIndex mutation occurs during `willRenameFiles`
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

This task creates the request surface only. Path confinement, rewriting, and
validation belong to later Phase 16 tasks.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ →
`in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-023]].

> [!FAILURE] Red - 2026-05-06
> Added failing module coverage for `workspace.fileOperations.willRename`,
> `workspace.fileOperations.didRename`, `workspace/willRenameFiles`, and
> `workspace/didRenameFiles`. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added the Phase 16 file-operation handler entry point, registered
> `workspace/willRenameFiles` as an async request, registered
> `workspace/didRenameFiles` as an async notification, and advertised
> `workspace.fileOperations` capabilities. Focused module test,
> `bun run typecheck`, and `bun run lint -- --max-warnings 0` pass. Status:
> `green`.
