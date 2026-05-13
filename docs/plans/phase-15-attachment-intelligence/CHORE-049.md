---
id: "CHORE-049"
title: "Phase 15 Documentation Trace Sweep"
type: chore
status: done
priority: medium
phase: 15
created: "2026-05-06"
updated: "2026-05-06"
dependencies: ["TASK-168"]
tags: [tickets/chore, "phase/15"]
aliases: ["CHORE-049"]
---

# Phase 15 Documentation Trace Sweep

> [!INFO] `CHORE-049` · Chore · Phase 15 · Priority: `medium` · Status: `done`

> [!NOTE] A chore produces no user-visible behaviour change. It improves
> internal quality: tooling, configuration, documentation, refactoring, or
> process. If a chore inadvertently changes observable LSP behaviour, convert it
> to a `TASK` ticket.

---

## Description

Verify that Phase 15 documentation links remain coherent after implementation.
The phase plan, tickets, requirements, BDD feature, test matrix, and any
configuration notes should agree on supported attachment behavior and the
implementation sequence.

---

## Motivation

Attachment intelligence crosses docs, requirements, BDD, and configuration. A
trace sweep keeps implementation evidence discoverable for the next phase.

- Motivated by: [[docs/plans/phase-15-attachment-intelligence]]

---

## Linked Requirements

| Planguage Tag | Gist | Source File |
|---|---|---|
| `Parity.Attachments.Intelligence` | Attachment docs trace to evidence | [[docs/requirements/functional/ofmarkdown-parity]] |
| `HV-002` | Hover documentation traces to attachment metadata behavior | [[docs/requirements/hover]] |

---

## Scope of Change

**Files modified:**

- `docs/plans/phase-15-attachment-intelligence.md` — plan trace corrections if
  implementation scope clarified.
- `docs/plans/phase-15-attachment-intelligence/**` — ticket trace corrections.
- `docs/features/ofmarkdown-parity-roadmap.md` — roadmap trace corrections if
  needed.
- `docs/requirements/**` — only trace-link corrections if required.
- `docs/bdd/features/ofmarkdown-parity.feature` — only scenario trace metadata
  corrections if required.

**Files created:**

- None

**Files deleted:**

- None

---

## Affected ADRs

| ADR | Constraint |
|---|---|
| [[docs/adr/ADR017-standard-markdown-link-intelligence]] | Markdown image links remain attachment references |

---

## Dependencies

**Blocked by:**

- [[TASK-168]] — final config behavior must be known before documentation trace
  cleanup.

**Unblocks:**

- None

---

## Acceptance Criteria

All of the following must be true before this ticket is marked `done`:

- [ ] Phase 15 tickets link the implemented requirements and BDD scenarios.
- [ ] Phase 15 plan acceptance still matches the implemented behavior.
- [ ] Configuration docs mention any new attachment-folder key or discovery rule.
- [ ] [[docs/test/matrix]] and [[docs/test/index]] links are not stale.
- [ ] Markdown links added by this chore resolve in the docs vault.
- [ ] `bun run lint --max-warnings 0` passes.
- [ ] `tsc --noEmit` exits 0.
- [ ] No behaviour-affecting changes in `src/`; convert to TASK if needed.

---

## Notes

This is a traceability chore, not a scope expansion. Do not add new attachment
features here.

---

## Lifecycle

Full state machine, scope-creep rules, and no-behaviour-change invariant:
[[docs/templates/tickets/lifecycle/chore-lifecycle]]

**State path:** `open` -> `in-progress` -> `in-review` -> `done`
**Lateral states:** `blocked`, `cancelled`

> [!WARNING] If any change to `src` would alter the response of any LSP method,
> stop and convert this ticket to a `TASK-NNN` before making that change.

---

## Workflow Log

> [!NOTE] Append-only. LLM agents add entries below in chronological order. Do
> not edit previous entries. Update the `status` frontmatter field to match the
> current state whenever adding an entry. See
> See [[docs/templates/tickets/lifecycle/chore-lifecycle]] for callout-type conventions
> and full transition rules.

> [!INFO] Opened — 2026-05-06
> Chore created. Status: `open`. Motivation: post-Phase-15 documentation trace.

> [!SUCCESS] Done - 2026-05-06
> Reconciled Phase 15 feature, phase plan, BDD requirement tags, and test
> trace docs with the implemented Obsidian `attachmentFolderPath` discovery
> rule and focused unit-test evidence. Status: `done`.
