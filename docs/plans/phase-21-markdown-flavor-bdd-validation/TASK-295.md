---
id: "TASK-295"
title: "Implement Markdown flavor selection BDD steps"
type: task
status: open
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
- Add exact workspace-folder, workspace fallback, and user settings-target
  assertions.
- Add exact `workspace/didChangeConfiguration` propagation assertions with
  `flavorGrenade.markdownFlavor` and effective flavor.
- Add Auto Detect reset behavior.
- Add manual language preservation behavior.
- Replace hard-coded harness selector constants with the extension contribution
  schema once Phase 19/E15 implement the product setting surface.

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
- [ ] Settings-target scenarios distinguish workspace-folder, workspace, and
      user writes.
- [ ] Server propagation checks assert the recorded client notification
      payload.
- [ ] Manual language safety scenario passes.
