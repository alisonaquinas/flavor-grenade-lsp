---
id: "TASK-295"
title: "Implement Markdown flavor selection BDD steps"
type: task
status: done
priority: high
phase: 21
parent: "FEAT-044"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["TASK-294"]
tags: [tickets/task, "phase/21", bdd, markdown-flavor]
aliases: ["TASK-295"]
---

# Implement Markdown Flavor Selection BDD Steps

## Description

Implement the selector, persistence, auto-detection, and manual-language steps
in `ofmarkdown-language-mode.feature`.

## Work Scope

- Add steps for selector display and required choices.
- Add exact selected-file and directory `.mdfattributes` target assertions.
- Add exact resource-specific propagation assertions with selected and effective
  flavor.
- Add Auto Detect reset behavior for the same `.mdfattributes` scope.
- Add `.mdfignore` inactive-state behavior.
- Add manual language preservation behavior.
- Replace hard-coded harness selector constants with the extension contribution
  schema once Phase 19/E15 implement the product selector surface.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.MarkdownFlavor.Selector` | `GAP-S-009` |
| `Extension.MarkdownFlavor.OverridePersistence` | `GAP-S-009` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `docs/bdd/features/ofmarkdown-language-mode.feature` | MF-E-001 selection and persistence scenarios. |

## Definition of Done

- [ ] All scenarios in `ofmarkdown-language-mode.feature` execute.
- [ ] Required flavor examples map labels to ids.
- [ ] Scope-target scenarios distinguish selected-file and directory
      `.mdfattributes` writes.
- [ ] Server propagation checks assert the recorded client notification
      payload.
- [ ] Manual language safety scenario passes.

## Implementation Notes

- Primary files: `docs/bdd/features/ofmarkdown-language-mode.feature` and
  `src/test/bdd/step-definitions/extension-harness.steps.ts`.
- Step contracts: selector labels map to ADR020 flavor ids, overrides write
  scoped `.mdfattributes` rules, and propagation assertions inspect recorded
  payloads with selected and effective flavor.
- Scope targets: selected-file and directory targets stay distinct in the
  harness state.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.

> [!SUCCESS] Done - 2026-05-13
> The Markdown flavor selection feature executes through the root BDD harness,
> including selector enumeration, selected-file/directory `.mdfattributes`
> persistence, auto-detect reset, recorded resource-specific payloads, and
> manual non-Markdown language safety.
