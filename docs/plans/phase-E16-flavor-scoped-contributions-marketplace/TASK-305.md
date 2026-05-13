---
id: "TASK-305"
title: "Update activation for flavor selector and Markdown-only startup"
type: task
status: open
priority: high
phase: E16
parent: "FEAT-046"
created: "2026-05-13"
updated: "2026-05-13"
dependencies: ["FEAT-045"]
tags: [tickets/task, "phase/E16", markdown-flavor, vscode]
aliases: ["TASK-305"]
---

# Update Activation For Flavor Selector And Markdown-Only Startup

## Description

Align activation events and startup gates with the selector model instead of
the old `ofmarkdown` language event.

## Work Scope

- Add selector command activation.
- Remove primary dependency on `onLanguage:ofmarkdown`.
- Keep generic Markdown idle without positive signal.
- Preserve explicit command wake behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Activation.MarkerEvents` | `GAP-E-009` |

## Linked Tests

| Test file | Expected coverage |
|---|---|
| `extension/src/activation-gate.test.ts` | Selector command activation and no `ofmarkdown` dependency. |

## Definition of Done

- [ ] Selector command can wake the extension.
- [ ] Startup gate does not require `ofmarkdown`.
- [ ] Generic Markdown idle behavior remains covered.
