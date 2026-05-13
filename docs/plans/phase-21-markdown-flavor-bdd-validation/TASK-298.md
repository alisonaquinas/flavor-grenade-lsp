---
id: "TASK-298"
title: "Add flavor validation review evidence"
type: task
status: open
priority: medium
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-296"]
tags: [tickets/task, "phase/21", validation, markdown-flavor]
aliases: ["TASK-298"]
---

# Add Flavor Validation Review Evidence

## Description

Create validation evidence showing the flavor list and dialect profiles match
product intent and research sources.

## Work Scope

- Add a product review checklist or validation note.
- Trace every displayed flavor to research or `ofm-spec`.
- Validate that BDD fixture constants match the intended product list only as
  temporary executable contracts.
- Require follow-up validation against the actual extension schema, product
  registry, and server configuration behavior after Phase 19/E15.
- Confirm `mdx` as a flavor does not authorize language-mode changes.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.DialectProfiles` | `GAP-S-011` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/test/markdown-flavor-validation-spec.md` | MF-VA-001 through MF-VA-004 evidence. |

## Definition of Done

- [ ] Validation artifact exists.
- [ ] Every flavor has source evidence.
- [ ] Validation distinguishes temporary harness fixtures from implemented
      product registry/server behavior.
- [ ] Platform flavor safety is explicitly reviewed.
