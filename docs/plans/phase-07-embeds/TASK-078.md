---
id: "TASK-078"
title: "Implement FG004 diagnostic"
type: task
status: done
priority: high
phase: 7
parent: "FEAT-008"
created: "2026-04-17"
updated: "2026-04-17"
dependencies: ["TASK-076"]
tags: [tickets/task, "phase/7"]
aliases: ["TASK-078"]
---

# Implement FG004 diagnostic

> [!INFO] `TASK-078` · Task · Phase 7 · Parent: [[FEAT-008]] · Status: `open`

## Description

Update `DiagnosticService` to emit the FG004 `BrokenEmbed` diagnostic for embed entries whose `EmbedResolver.resolve()` returns `null`. FG004 uses severity Warning (not Error) because broken embeds are less critical than broken wiki-links (FG001). In single-file mode, FG004 is suppressed — the same suppression rule that applies to FG001.

---

## Implementation Notes

- Diagnostic code: `FG004`
- Diagnostic name: `BrokenEmbed`
- Severity: `Warning`
- Message format: `Cannot resolve embed '![[<target>]]'`
- In `DiagnosticService`, after running `EmbedResolver` over all `EmbedRef` entries: for each entry where `resolvedTo === null`, emit an FG004 diagnostic at the embed span's range
- Single-file mode: suppress FG004 (same rule as FG001 suppression)
- See also: `bdd/features/embeds.feature`, [[requirements/embed-resolution]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| — | FG004 BrokenEmbed Warning for unresolvable embed targets | [[requirements/embed-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `bdd/features/embeds.feature` | `Missing embed target produces FG004 warning` |
| `bdd/features/embeds.feature` | `FG004 suppressed in single-file mode` |

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
| [[adr/ADR002-ofm-only-scope]] | FG004 applies to OFM embed syntax only |

---

## Parent Feature

[[FEAT-008]] — Embeds

---

## Dependencies

**Blocked by:**

- [[TASK-076]] — FG004 is emitted when EmbedResolver returns null

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
- [ ] Parent feature [[FEAT-008]] child task row updated to `in-review`

---

## Notes

FG004 is Warning severity (not Error) to match Obsidian's own behaviour: broken embeds render as empty boxes rather than hard errors. Single-file mode suppression follows the same pattern as FG001.

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
> Ticket created. Status: `open`. Parent: [[FEAT-008]].

> [!SUCCESS] Done — 2026-04-17
> `DiagnosticService` updated to inject `EmbedResolver` and emit FG004 (severity Warning) for broken embeds. Suppressed in single-file mode. All existing tests updated to pass new constructor signature. Status: `done`.
