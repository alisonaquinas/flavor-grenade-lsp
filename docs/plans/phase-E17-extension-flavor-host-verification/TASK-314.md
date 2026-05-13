---
id: "TASK-314"
title: "Close extension flavor traceability matrices"
type: task
status: open
priority: medium
phase: E17
parent: "FEAT-047"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-310", "TASK-311", "TASK-312", "TASK-313"]
tags: [tickets/task, "phase/E17", docs, traceability]
aliases: ["TASK-314"]
---

# Close Extension Flavor Traceability Matrices

## Description

Update root and extension-local matrices after extension flavor implementation
and host verification.

## Work Scope

- Update `docs/test/matrix.md`.
- Update `extension/docs/tests/matrix.md`.
- Update `docs/test/index.md` and `extension/docs/tests/index.md` for new files.
- Mark obsolete language-mode tests accurately.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Tests.HostCoverage` | `GAP-E-011`, `GAP-E-014` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/docs/tests/matrix.md` | Implemented evidence replaces planned rows. |

## Definition of Done

- [ ] Root matrix reflects passing extension flavor evidence.
- [ ] Extension matrix reflects local unit, host, verification, and validation evidence.
- [ ] Obsolete rows are retired honestly.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
