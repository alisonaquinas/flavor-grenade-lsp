---
id: "TASK-055"
title: "Write unit tests for VaultDetector"
type: task
status: open
priority: "high"
phase: "4"
parent: "FEAT-005"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-045"]
tags: [tickets/task, "phase/4"]
aliases: ["TASK-055"]
---

# Write unit tests for VaultDetector

> [!INFO] `TASK-055` · Task · Phase 4 · Parent: [[tickets/FEAT-005]] · Status: `open`

## Description

Write comprehensive unit tests for `VaultDetector` using fixture directories under `src/test/fixtures/vault-detection/`. The fixtures cover all detection scenarios: obsidian vault, flavor-grenade vault, both markers (obsidian wins), no markers (single-file), and nested detection (vault root found via parent directory walk). Tests verify the `VaultDetectionResult` shape and caching behaviour.

---

## Implementation Notes

- Fixture directories to create:
  - `fixture-obsidian/` — contains `.obsidian/`
  - `fixture-toml/` — contains `.flavor-grenade.toml`
  - `fixture-both/` — contains both (obsidian wins)
  - `fixture-neither/` — no marker; returns single-file mode
  - `fixture-nested/outer/` — `.obsidian/` at `outer/inner/`; start from `outer/inner/nested/` to verify walk-up
- Test file: `tests/unit/vault/vault-detector.spec.ts`
- Verify result is cached on repeated calls (same object reference or stub spy called once)
- See also: [[adr/ADR003-vault-detection]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | Vault detection requirements | [[requirements/index]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/vault-detection]] | All vault detection scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/unit/vault/vault-detector.spec.ts` | Unit | — | 🔴 failing |
| [[tests/unit/unit-vault-module.md]] | Unit test plan | — | — |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR003-vault-detection]] | Detection algorithm and precedence rules under test |

---

## Parent Feature

[[tickets/FEAT-005]] — Vault Index

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-045]] — VaultDetector must be implemented before tests can be written

**Unblocks:**

- Nothing — final test coverage task for VaultDetector

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] All linked BDD scenarios pass locally
- [ ] [[test/matrix]] row(s) updated to `✅ passing`
- [ ] [[test/index]] row(s) added for new test files
- [ ] Parent feature [[tickets/FEAT-005]] child task row updated to `in-review`

---

## Notes

All five fixture directories must be created as part of this task. The TDD convention still applies: write the test file first (it will fail because fixtures don't exist), then create the fixtures to make tests green.

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

> [!INFO] Opened — 2026-04-17
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-005]].
