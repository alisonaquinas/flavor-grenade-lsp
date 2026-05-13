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
the old `ofmarkdown` language event. Any documented `ofmarkdown` activation
path is non-authoritative historical context unless explicitly marked as
current compatibility behavior.

## Work Scope

- Add selector command activation.
- Remove current activation dependency on `onLanguage:ofmarkdown`.
- Keep `LanguageClient` `clientOptions.documentSelector` scoped to file-backed
  `markdown` documents only; fail tests if `ofmarkdown` remains in the current
  selector.
- Keep generic Markdown idle without positive signal.
- Preserve explicit command wake behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Activation.MarkerEvents` | `GAP-E-009` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-I-001`, `EXT-MF-I-002` | `extension/src/activation-gate.test.ts` | Vault-marker activation and generic Markdown idle startup without custom language id activation. |
| `EXT-MF-I-003` | `extension/src/activation-gate.test.ts` | Selector command activation and no current `onLanguage:ofmarkdown` activation dependency. |
| `EXT-MF-I-006` | `extension/src/activation-gate.test.ts` or `extension/src/client-options.test.ts` | `clientOptions.documentSelector` contains file-backed `markdown` only and rejects `ofmarkdown`. |

## Definition of Done

- [ ] Selector command can wake the extension.
- [ ] Startup gate does not require `onLanguage:ofmarkdown`.
- [ ] Current `documentSelector` contains no `ofmarkdown` entry.
- [ ] Generic Markdown idle behavior remains covered.
