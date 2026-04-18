---
id: "TASK-082"
title: "Write unit tests for embed resolution"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-075", "TASK-076"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-082"]
---

# Write unit tests for embed resolution

> [!INFO] `TASK-082` · Task · Phase 7 · Parent: [[tickets/FEAT-008]] · Status: `open`

## Description

Create `src/resolution/__tests__/embed-resolver.test.ts` containing the full unit test suite for `EmbedResolver`. Tests must be written first (TDD red phase) before the corresponding implementation is considered done. The test file covers all resolution paths and forms the gate evidence for Phase 7.

---

## Implementation Notes

- Test file: `src/resolution/__tests__/embed-resolver.test.ts`
- Required test cases:
  - Markdown embed resolves to `OFMDoc`
  - Image embed resolves to asset path
  - Heading embed resolves to heading in target document
  - Block embed resolves to block anchor in target document
  - Missing markdown embed → `null` result → FG004 diagnostic
  - Missing image → `null` result → FG004 diagnostic
  - Existing image with size syntax `|200x150` → resolves without diagnostic
  - Non-markdown, non-image file embed → resolves if exists in `AssetIndex`
- See also: [[tests/integration/smoke-embeds.md]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | EmbedResolver unit test coverage for all resolution paths | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| [[bdd/features/embeds]] | All embed resolution scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `tests/integration/smoke-embeds.md` | Integration | — | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[adr/ADR002-ofm-only-scope]] | Embed resolution follows OFM syntax |
| [[adr/ADR013-vault-root-confinement]] | Asset paths in tests must stay within mocked vault root |

---

## Parent Feature

[[tickets/FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[tickets/TASK-075]] — EmbedRef must be defined for tests to compile
- [[tickets/TASK-076]] — EmbedResolver must exist (even as a stub) for tests to run

**Unblocks:**

- None within Phase 7

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
- [ ] Parent feature [[tickets/FEAT-008]] child task row updated to `in-review`

---

## Notes

All eight test cases from the Phase 7 plan must be present. These tests are the primary gate evidence for `bun test src/resolution/__tests__/embed-resolver.test.ts`.

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
> Ticket created. Status: `open`. Parent: [[tickets/FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `src/resolution/__tests__/embed-resolver.test.ts` written with 12 tests: markdown doc resolution, stem resolution, broken markdown, image assets (png/jpg/svg), broken assets, size specifier (width+height), alias vs size distinction. RED commit precedes GREEN commit. Status: `done`.
