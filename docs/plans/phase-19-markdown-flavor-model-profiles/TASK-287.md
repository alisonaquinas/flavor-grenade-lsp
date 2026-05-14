---
id: "TASK-287"
title: "Document research-to-profile validation trace"
type: task
status: done
priority: medium
phase: 19
parent: "FEAT-042"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-284", "TASK-286"]
tags: [tickets/task, "phase/19", markdown-flavor, docs]
aliases: ["TASK-287"]
---

# Document Research-To-Profile Validation Trace

## Description

Add documentation or generated evidence that maps each explicit profile to the
research note that justified it.

## Work Scope

- Create or update profile trace documentation.
- Link profile ids to `docs/research/` or `ofm-spec`.
- Identify any future flavor that is intentionally excluded.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `src/parser/__tests__/markdown-flavor-profiles.test.ts`, `docs/test/markdown-flavor-validation-spec.md` | ✅ Passing coverage requires `docs/test/evidence/markdown-flavor-research-trace.md` to exist and cite every profile source. |

## Implementation Notes

- Create `docs/test/evidence/markdown-flavor-research-trace.md`.
- Map every explicit flavor id to its label, profile source files, feature page, research or OFM source, and owning Phase 22-34 ticket.
- Update `docs/test/index.md`, `docs/test/matrix.md`, and `docs/test/markdown-flavor-validation-spec.md` to reference the implemented evidence.
- Keep excluded future flavors explicit: only ADR020 flavors are supported by this phase.

## Definition of Done

- [x] Every displayed flavor has a source trace.
- [x] Validation docs can be reviewed without reading code first.
- [x] Matrix links are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!INFO] Planned - 2026-05-13
> Step C implementation shape recorded before coding.

> [!NOTE] RED - 2026-05-13
> Failing evidence-file assertion added before `docs/test/evidence/markdown-flavor-research-trace.md` exists.

> [!NOTE] GREEN - 2026-05-13
> Added `docs/test/evidence/markdown-flavor-research-trace.md` and traceability updates; focused profile test passes.

> [!INFO] In Review - 2026-05-13
> Lint, typecheck, unit, integration, BDD, docs lint, format, and build gates passed locally; awaiting PR CI.

> [!CHECK] Done - 2026-05-13
> PR #69 CI run `25815957887` passed.
