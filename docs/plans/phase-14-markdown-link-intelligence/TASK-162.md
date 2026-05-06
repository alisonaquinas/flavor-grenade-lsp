---
id: "TASK-162"
title: "Rename Markdown heading anchors"
type: task
status: done
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-159", "TASK-161"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-162"]
---

# Rename Markdown heading anchors

> [!INFO] `TASK-162` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `done`

## Description

Extend heading rename so the returned `WorkspaceEdit` updates Markdown
same-document anchors and file-plus-heading anchors that resolve to the renamed
heading. Existing wiki heading rename behavior and display text preservation
must remain unchanged.

---

## Implementation Notes

- Update `[Links](#Links)` to `[Links](#Link-Index)` when `Links` is renamed
  to `Link Index`.
- Update `[Overview](alpha.md#overview)` when the target heading changes and
  the Markdown link resolves to that heading.
- Preserve link text, reference labels, titles, and unrelated URL content.
- Use the same heading-anchor normalization as Oracle and diagnostics.

## Implementation Details

- Extend `src/handlers/rename.handler.ts` heading rename logic to add edits for
  Markdown same-document and file-plus-fragment anchors that resolve to the
  renamed heading.
- Reuse the same heading-anchor normalization utility used by [[TASK-159]] and
  [[TASK-160]].
- Replace only the target fragment range, preserving display text, labels, and
  optional titles.
- Add tests in `src/handlers/__tests__/markdown-heading-rename.test.ts` so the
  existing handler test layout remains consistent.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.RenameAnchors` | Heading rename updates Markdown same-document and file-plus-fragment anchors | [[requirements/functional/ofmarkdown-parity]] |
| `Rename.Refactoring.Completeness` | Heading rename updates every resolved Markdown heading anchor | [[requirements/rename]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document anchors update when headings are renamed | [[requirements/functional/ofmarkdown-parity]] |
| `Navigation.References.Completeness` | Rename uses complete reference discovery | [[requirements/navigation]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/rename/markdown-heading-rename.test.ts` | Unit | `Rename.Refactoring.Completeness` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown heading anchors participate in heading rename |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-159]] - rename needs resolved Markdown heading anchors.
- [[TASK-161]] - rename relies on complete reference discovery.

**Unblocks:**

- [[CHORE-045]] - test matrix sweep needs rename evidence rows.
- [[CHORE-046]] - documentation trace sweep needs final rename mappings.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Same-document Markdown heading anchors are updated in heading rename edits.
- [ ] File-plus-heading Markdown anchors are updated when they resolve to the
  renamed heading.
- [ ] Link display text, labels, and titles are preserved.
- [ ] Existing wiki heading rename scenarios remain green.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenario passes locally.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

This is the last behavior task in the phase. Run it after navigation can find
all Markdown heading references.

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

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry.

> [!INFO] Opened - 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-021]].

> [!INFO] Detailed - 2026-05-06
> Step C implementation details added. Rename write scope is
> `src/handlers/rename.handler.ts`, the shared heading-anchor utility, and
> Markdown rename tests. Status: `open`.

> [!WARNING] Red - 2026-05-06
> RED tests added for Markdown heading-anchor rename edits before
> implementation. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Heading rename now updates Markdown same-document and file-plus-fragment
> anchors using normalized emitted anchors while preserving surrounding Markdown
> link text and titles. `bun test
> src/handlers/__tests__/markdown-heading-rename.test.ts`,
> `bun run typecheck`, and `bun run lint -- --max-warnings 0` pass. Status:
> `green`.

> [!SUCCESS] Review Ready - 2026-05-06
> Local phase gates pass after implementation and sweep fixes. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.
