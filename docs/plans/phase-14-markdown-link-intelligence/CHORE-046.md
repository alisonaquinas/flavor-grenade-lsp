---
id: "CHORE-046"
title: "Phase 14 Documentation Trace Sweep"
type: chore
status: in-progress
priority: medium
phase: 14
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-156", "TASK-157", "TASK-158", "TASK-159", "TASK-160", "TASK-161", "TASK-162", "CHORE-045", "CHORE-057"]
tags: [tickets/chore, "phase/14"]
aliases: ["CHORE-046"]
---

# Phase 14 Documentation Trace Sweep

> [!INFO] `CHORE-046` · Chore · Phase 14 · Priority: `medium` · Status: `in-progress`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Audit Phase 14 documentation links after implementation. Confirm tickets,
requirements, BDD scenarios, OFM spec references, ADR references, and the phase
plan agree about the Markdown link intelligence scope and exclusions.

---

## Motivation

Phase 14 intentionally implements only the first server-side Marksman parity
slice. A trace sweep keeps later attachment, file-operation, and structural LSP
work from being accidentally implied as complete.

- Motivated by: [[plans/phase-14-markdown-link-intelligence]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.MarkdownLinks.LocalResolution` | Docs trace local Markdown link behavior | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.MarkdownLinks.SameDocumentAnchor` | Docs trace same-document anchor behavior | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.HeadingAmbiguity.Diagnostics` | Docs trace duplicate heading diagnostics | [[requirements/functional/ofmarkdown-parity]] |
| `Completion.Trigger.Coverage` | Docs trace Markdown link URL completion coverage | [[requirements/completions]] |
| `Navigation.Definition.AllLinkTypes` | Docs trace Markdown definition behavior | [[requirements/navigation]] |
| `Navigation.References.Completeness` | Docs trace Markdown references behavior | [[requirements/navigation]] |
| `Rename.Refactoring.Completeness` | Docs trace Markdown heading rename behavior | [[requirements/rename]] |

---

## Scope of Change

**Files modified:**

- `docs/plans/phase-14-markdown-link-intelligence.md` - trace corrections if
  implementation scope changed.
- `docs/plans/phase-14-markdown-link-intelligence/*.md` - ticket trace
  corrections.
- `docs/test/matrix.md` - trace correction only if CHORE-045 finds a mismatch.
- `docs/test/index.md` - trace correction only if CHORE-045 finds a mismatch.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[ADR017-standard-markdown-link-intelligence]] | Documentation must describe the implemented Markdown link intelligence slice |

---

## Dependencies

**Blocked by:**

- [[TASK-156]] - parser scope complete.
- [[TASK-157]] - classifier scope complete.
- [[TASK-158]] - RefGraph scope complete.
- [[TASK-159]] - Oracle scope complete.
- [[TASK-160]] - diagnostics scope complete.
- [[TASK-161]] - navigation scope complete.
- [[TASK-162]] - rename scope complete.
- [[CHORE-045]] - matrix and index evidence rows complete.
- [[CHORE-057]] - code quality and security sweeps complete.

**Unblocks:**

- [[FEAT-021]] - phase feature review.

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Phase plan, tickets, requirements, BDD, and test evidence agree on Phase
  14 scope.
- [ ] Out-of-scope parity work remains explicitly excluded.
- [ ] Links to [[ofm-spec/markdown-links]],
  `docs/bdd/features/ofmarkdown-parity.feature`, and linked requirements resolve.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] `bun test` passes.
- [ ] No behavior-affecting source changes are made during this chore.

---

## Notes

Keep changes narrow. This chore should only reconcile documentation and trace
metadata discovered after implementation.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[templates/tickets/lifecycle/chore-lifecycle]]

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
> Chore created. Status: `open`. Motivation: Phase 14 documentation trace.

> [!INFO] Started - 2026-05-06
> Documentation trace sweep started after test matrix evidence reached review.
> Status: `in-progress`.
