---
id: "TASK-129"
title: "Implement bun build single-file binary"
type: task
status: open
priority: medium
phase: 13
parent: "FEAT-014"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: []
tags: [tickets/task, "phase/13"]
aliases: ["TASK-129"]
---

# Implement bun build single-file binary

> [!INFO] `TASK-129` · Task · Phase 13 · Parent: [[tickets/FEAT-014]] · Status: `open`

## Description

Add `build:binary` and `build:binary:win` scripts to `package.json` using `bun build --compile`. These scripts produce a single self-contained executable that embeds the Bun runtime, requiring no separate Node.js or Bun installation on the target machine. The Unix binary outputs to `dist/flavor-grenade-lsp`; the Windows binary outputs to `dist/flavor-grenade-lsp.exe`.

---

## Implementation Notes

- Add to `package.json` scripts:
  ```json
  {
    "build:binary": "bun build src/main.ts --compile --outfile=dist/flavor-grenade-lsp",
    "build:binary:win": "bun build src/main.ts --compile --outfile=dist/flavor-grenade-lsp.exe"
  }
  ```
- The compiled binary embeds the Bun runtime; no separate runtime needed on target machine
- Verify: `./dist/flavor-grenade-lsp --version` prints a version string
- See also: [[requirements/ci-cd]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Single-file binary packaging with embedded runtime | [[requirements/ci-cd]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/code-actions]] | — (build infrastructure task, no Gherkin scenario) |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `package.json` | Config | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR008-oidc-publishing]] | Binary build is prerequisite for release workflow |

---

## Parent Feature

[[tickets/FEAT-014]] — CI & Delivery

---

## Dependencies

**Blocked by:**

- None

**Unblocks:**

- [[tickets/TASK-130]] — release workflow invokes `bun run build:binary`

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] `bun run build:binary` exits 0 and produces `dist/flavor-grenade-lsp`
- [ ] `./dist/flavor-grenade-lsp --version` prints a version string
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-014]] child task row updated to `in-review`

---

## Notes

The `--compile` flag was stabilised in Bun 1.1. The Windows build script (`build:binary:win`) is separate because `bun build --compile` cross-compilation is not supported; the `.exe` must be built on a Windows runner.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations: [[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ → `in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state), `cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit must precede the implementation commit in git history with no exceptions. See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do not edit previous entries. Update the `status` frontmatter field to match the current state whenever adding an entry. See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions and full transition rules.

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-014]].
