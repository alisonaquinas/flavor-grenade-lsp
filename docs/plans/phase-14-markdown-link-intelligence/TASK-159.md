---
id: "TASK-159"
title: "Resolve Markdown links through Oracle"
type: task
status: open
priority: high
phase: 14
parent: "FEAT-021"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-157", "TASK-158"]
tags: [tickets/task, "phase/14"]
aliases: ["TASK-159"]
---

# Resolve Markdown links through Oracle

> [!INFO] `TASK-159` · Task · Phase 14 · Parent: [[FEAT-021]] · Status: `open`

## Description

Extend the resolution Oracle so local Markdown link targets resolve to the same
documents and headings as equivalent wiki-link forms. Same-document fragments
must resolve against the source document and file-plus-fragment links must use
centralized heading anchor normalization.

---

## Implementation Notes

- Resolve `[Alpha](alpha.md)` to the same DocId as `[[alpha]]`.
- Resolve `[Heading](alpha.md#overview)` and `[Heading](#overview)` to heading
  targets when unambiguous.
- Resolve reference-style links through their document-local definitions.
- Return enough structured result data for diagnostics, definition,
  references, and rename.

## Implementation Details

- Extend `src/resolution/oracle.ts` with Markdown-specific resolution helpers
  rather than duplicating vault lookup logic in handlers.
- Add shared heading-anchor normalization in `src/resolution/heading-anchor.ts`
  or an equivalent small resolution utility.
- Resolve local Markdown target classifications from [[TASK-157]] to DocIds,
  then validate optional fragments against target document headings.
- Add tests in `src/resolution/__tests__/markdown-link-oracle.test.ts`.

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.LocalResolution` | Markdown local links resolve through vault rules | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.TargetClassification` | Oracle receives pre-classified local and non-local target kinds | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Same-document anchors resolve to headings | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Ambiguous heading matches are reported to diagnostics | [[requirements/functional/ofmarkdown-parity]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | `Local Markdown inline links resolve like wiki-links` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Reference-style links resolve through their link definitions` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Same-document Markdown anchors behave like heading references` |
| `docs/bdd/features/ofmarkdown-parity.feature` | `Duplicate heading anchors produce related information` |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/markdown-link-oracle.test.ts` | Unit | `Parity.MarkdownLinks.LocalResolution` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Markdown links use the existing vault Oracle for resolution |

---

## Parent Feature

[[FEAT-021]] - Markdown Link Intelligence

---

## Dependencies

**Blocked by:**

- [[TASK-157]] - Oracle needs classified target kinds.
- [[TASK-158]] - Oracle needs graph entries for Markdown refs and labels.

**Unblocks:**

- [[TASK-160]] - diagnostics consume unresolved and ambiguous Oracle results.
- [[TASK-161]] - definition and references consume resolved locations.
- [[TASK-162]] - rename consumes resolved heading references.

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Local file Markdown links resolve to existing vault documents.
- [ ] Same-document and file-plus-heading fragments resolve to headings.
- [ ] Missing and ambiguous heading states are represented explicitly.
- [ ] Reference-style links resolve through same-document label definitions.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] Linked BDD scenarios pass or are ready for diagnostics/navigation work.
- [ ] [[test/matrix]] and [[test/index]] are updated for new tests.
- [ ] Parent feature [[FEAT-021]] child task row updated to `in-review`.

---

## Notes

Centralize heading-anchor normalization here or in an existing shared resolver
so diagnostics and rename cannot drift.

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
> Step C implementation details added. Oracle write scope is
> `src/resolution/oracle.ts`, a heading-anchor utility if needed, and Oracle
> tests. Status: `open`.
