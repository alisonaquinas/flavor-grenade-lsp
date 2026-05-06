---
id: "TASK-171"
title: "Rewrite moved-target references without changing syntax"
type: task
status: green
priority: high
phase: 16
parent: "FEAT-023"
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-170"]
tags: [tickets/task, "phase/16"]
aliases: ["TASK-171"]
---

# Rewrite moved-target references without changing syntax

> [!INFO] `TASK-171` · Task · Phase 16 · Parent: [[FEAT-023]] · Status: `green`

## Description

Generate text edits for every local reference that resolves to a moved target.
The rewriter must preserve each reference family: wiki-links stay wiki-links,
embeds stay embeds, Markdown inline links stay Markdown links, reference
definitions stay reference definitions, and Markdown image links stay image
links.

---

## Implementation Notes

- Preserve heading fragments, block fragments, display aliases, and Markdown
  title text
- Preserve configured wiki-link style through existing style-binding helpers
- Rewrite only references that resolve to planner mappings
- Record skipped references when ambiguity prevents a safe syntax-preserving
  rewrite
- See also: [[ADR018-vault-file-operation-refactoring]]

---

## Linked Functional Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.FileOperations.ReferenceRewrite` | Resolved moved-target references are rewritten without changing syntax family | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.SkippedAmbiguousReporting` | Ambiguous moved-target references are reported without speculative edits | [[requirements/functional/ofmarkdown-parity]] |
| `Parity.FileOperations.AtomicRefactor` | Update every local reference form for moved targets | [[requirements/functional/ofmarkdown-parity]] |
| `Rename.Refactoring.Completeness` | Preserve completeness for existing wiki-link and heading references | [[requirements/rename]] |
| `Rename.StyleBinding.Consistency` | Preserve configured link style when wiki-link text is rewritten | [[requirements/rename]] |
| `Link.Wiki.StyleBinding` | Keep wiki-link output consistent with active style | [[requirements/wiki-link-resolution]] |

---

## Linked BDD Scenarios

| Feature File | Scenario Title |
|---|---|
| `docs/bdd/features/ofmarkdown-parity.feature` | File move scenarios |

---

## Linked Tests

| Test File | Type | Req Tag | Status |
|---|---|---|---|
| `src/resolution/file-operation-rewriter.spec.ts` | Unit | `Parity.FileOperations.AtomicRefactor` | 🔴 failing |

---

## Linked ADRs

| ADR | Decision |
|---|---|
| [[ADR018-vault-file-operation-refactoring]] | Rewrites must be syntax preserving and derived from resolved references |

---

## Parent Feature

[[FEAT-023]] — Vault File Operation Refactors

---

## Dependencies

**Blocked by:**

- [[TASK-170]] — rewriter needs vault-confined old/new mappings

**Unblocks:**

- [[TASK-172]] — edit validation requires the full generated edit set

---

## Definition of Done

All of the following must be true before this task is marked `done`:

- [ ] Failing test(s) written first (RED commit exists in git log)
- [ ] Implementation written to make test(s) pass (GREEN commit follows)
- [ ] Wiki-links, embeds, Markdown links, reference definitions, and Markdown
      image links are rewritten when they resolve to moved targets
- [ ] Fragments, aliases, and Markdown title text are preserved
- [ ] Ambiguous references are skipped and included in a structured refactor
  report for downstream logging, status, or diagnostics
- [ ] Skipped references never produce speculative text edits
- [ ] `bun run lint --max-warnings 0` passes
- [ ] `tsc --noEmit` exits 0
- [ ] Parent feature [[FEAT-023]] child task row updated to `in-review`

---

## Notes

This task should not validate edit overlap or all-or-nothing behavior. That is
owned by [[TASK-172]]. Skipped-reference reporting is owned here because the
rewriter has the syntax and resolution context needed to explain why a
reference was not safe to edit.

---

## Lifecycle

Full state machine, TDD phase rules, and agent obligations:
[[templates/tickets/lifecycle/task-lifecycle]]

**State path:** `open` → `red` → `green` → `refactor` _(optional)_ →
`in-review` → `done`
**Lateral states:** `blocked` (from any active state, resumes to prior state),
`cancelled`

> [!WARNING] `red` before `green` is non-negotiable. See
> See [[requirements/code-quality]] `Quality.TDD.StrictRedGreen`.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries.

> [!INFO] Opened — 2026-05-06
> Ticket created. Status: `open`. Parent: [[FEAT-023]].

> [!FAILURE] Red - 2026-05-06
> Added failing rewrite coverage for moved note and attachment targets across
> wiki-links, embeds, Markdown inline links, reference definitions, and
> Markdown image links. Status: `red`.

> [!SUCCESS] Green - 2026-05-06
> Added `FileOperationRewriter` to consume planner moves and `RefGraph` refs,
> preserving wiki-link, embed, Markdown link, reference-definition, and Markdown
> image syntax while replacing only the needed target text where parser ranges
> allow it. Focused rewrite test, `bun run typecheck`, and
> `bun run lint -- --max-warnings 0` pass. Status: `green`.
