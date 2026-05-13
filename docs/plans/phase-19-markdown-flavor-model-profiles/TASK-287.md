---
id: "TASK-287"
title: "Document research-to-profile validation trace"
type: task
status: open
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
| `docs/test/markdown-flavor-validation-spec.md` | Validation evidence references profile trace. |

## Definition of Done

- [ ] Every displayed flavor has a source trace.
- [ ] Validation docs can be reviewed without reading code first.
- [ ] Matrix links are updated.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
