---
id: "TASK-168"
title: "Polish attachment configuration"
type: task
status: open
priority: medium
phase: 15
parent: "FEAT-022"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-163", "TASK-164", "TASK-165", "TASK-166", "TASK-167"]
tags: [tickets/task, "phase/15"]
aliases: ["TASK-168"]
---

# Polish attachment configuration

> [!INFO] `TASK-168` · Task · Phase 15 · Parent: [[FEAT-022]] · Status: `open`

## Description

Respect attachment folder preferences after the core attachment providers exist.
The server should discover Obsidian attachment folder hints when available or
expose a FlavorConfig key, then use that preference to improve attachment
completion and validation without hiding valid attachments elsewhere in the
vault.

---

## Implementation Notes

- Prefer reading existing vault attachment-folder settings when available.
- Add or document a FlavorConfig key only if Obsidian settings are unavailable
  or insufficient.
- Use folder preference as ranking or guidance, not as the only valid location.
- Keep config behavior compatible with the index contract from [[TASK-163]].
- See also: [[plans/phase-15-attachment-intelligence]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.ConfigHints` | Attachment completion and indexing respect configured attachment folder hints | [[requirements/ofmarkdown-parity]] |
| `Parity.Attachments.Intelligence` | Attachment folder hints are respected | [[requirements/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Attachment references support completion, definition, and hover` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/lsp/**/*.spec.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |
| `src/completion/**/*.spec.ts` | Unit | `Parity.Attachments.Intelligence` | 🔴 failing |

> After implementation, update the rows above and the corresponding rows in
> Update [[test/matrix]] and [[test/index]].

---

## Linked ADRs

| ADR | Decision |
|---|---|
| — | None |

---

## Parent Feature

[[FEAT-022]] — Attachment Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-163]] — configuration must match the attachment index model.
- [[TASK-164]] — completion ranking is one consumer of attachment folder hints.
- [[TASK-165]] — diagnostics must keep valid off-folder attachments clean.
- [[TASK-166]] — definition must keep using resolved target URIs.
- [[TASK-167]] — hover must keep using resolved metadata.

**Unblocks:**

- [[CHORE-047]] — lint sweep should run after final Phase 15 implementation.
- [[CHORE-048]] — test matrix sweep should run after final Phase 15 tests.
- [[CHORE-049]] — documentation trace sweep should run after final config docs.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log).
- [ ] Implementation written to make test(s) pass (GREEN commit follows).
- [ ] Attachment folder hints influence completion or config behavior.
- [ ] Valid attachments outside the preferred folder remain resolvable.
- [ ] Any new FlavorConfig key is documented and tested.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally.
- [ ] [[test/matrix]] row(s) updated to `✅ passing`.
- [ ] [[test/index]] row(s) added for new test files.
- [ ] Parent feature [[FEAT-022]] child task row updated to `in-review`.

---

## Notes

This task is intentionally last. It should polish behavior exposed by the index,
completion, diagnostics, navigation, and hover tasks rather than redefine them.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` -> `red` -> `green` -> `refactor` _(optional)_ ->
`in-review` -> `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. The failing test commit
> must precede the implementation commit in git history with no exceptions. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[templates/tickets/lifecycle/task-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-022]].
