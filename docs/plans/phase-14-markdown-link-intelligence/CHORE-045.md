---
id: "CHORE-045"
title: "Phase 14 Test Matrix Sweep"
type: chore
status: done
priority: medium
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156", "TASK-157", "TASK-158", "TASK-159", "TASK-160", "TASK-161", "TASK-162"]
tags: [tickets/chore, "phase/14"]
aliases: ["CHORE-045"]
---

# Phase 14 Test Matrix Sweep

> [!INFO] `CHORE-045` · Chore · Phase 14 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Audit every Phase 14 parser, classifier, RefGraph, Oracle, diagnostics,
navigation, and rename test. Ensure [[docs/test/matrix]] and [[docs/test/index]] include
the new tests and show passing evidence for every linked Phase 14 requirement.

---

## Motivation

Phase 14 spans several Planguage tags and BDD scenarios. The test matrix must
make the evidence trail obvious before the feature leaves review.

- Motivated by: [[docs/test/matrix]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.LocalResolution` | Test evidence covers local Markdown link resolution | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Test evidence covers same-document anchor behavior | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Test evidence covers ambiguous heading diagnostics | [[docs/requirements/functional/ofmarkdown-parity]] |
| `Navigation.Definition.AllLinkTypes` | Test evidence covers Markdown link definition | [[docs/requirements/navigation]] |
| `Navigation.References.Completeness` | Test evidence covers Markdown references | [[docs/requirements/navigation]] |
| `Rename.Refactoring.Completeness` | Test evidence covers Markdown heading rename edits | [[docs/requirements/rename]] |

---

## Scope of Change

**Files modified:**

- `docs/test/matrix.md` - add or update Phase 14 evidence rows.
- `docs/test/index.md` - add or update Phase 14 test file entries.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Matrix rows must trace Markdown link intelligence behaviors |

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parser tests complete.
- [[TASK-157]] - classifier tests complete.
- [[TASK-158]] - RefGraph tests complete.
- [[TASK-159]] - Oracle tests complete.
- [[TASK-160]] - diagnostics tests complete.
- [[TASK-161]] - navigation tests complete.
- [[TASK-162]] - rename tests complete.

**Unblocks:**

- [[FEAT-021]] - phase feature review.
- [[CHORE-046]] - documentation trace sweep can compare final evidence rows.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] [[docs/test/matrix]] has passing Phase 14 rows for every linked requirement.
- [ ] [[docs/test/index]] lists every test file introduced or updated by Phase 14.
- [ ] Linked BDD scenarios in `docs/bdd/features/ofmarkdown-parity.feature` are
  represented in matrix evidence.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] `bun test` passes.
- [ ] No behavior-affecting source changes are made during this chore.

---

## Notes

This chore is documentation and evidence bookkeeping. Do not add missing tests
here; route missing coverage back to the owning task.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src/` would alter the response of any LSP
> method, stop and convert this ticket to a `TASK-NNN` before making that
> change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order.
> Do not edit previous entries. Update the `status` frontmatter field to match
> the current state whenever adding an entry.

> [!INFO] Opened - 2026-05-06
> Chore created. Status: `open`. Motivation: Phase 14 test matrix coverage.

> [!INFO] Started - 2026-05-06
> Test matrix and test index sweep started after source, quality, and security
> checks reached review. Status: `in-progress`.

> [!INFO] Review Ready - 2026-05-06
> Updated [[docs/test/index]] and [[docs/test/matrix]] with Phase 14 parser, classifier,
> RefGraph, Oracle, diagnostics, navigation, rename, completion, and security
> evidence. `bun run lint:docs`, `bun run lint -- --max-warnings 0`,
> `bun run typecheck`, and `bun test` pass. Status: `in-review`.

> [!SUCCESS] Done - 2026-05-06
> PR #30 passed CI and the Phase 14 gate is ready to merge. Status: `done`.
