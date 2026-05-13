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

- Add selector command activation for exact command id
  `flavorGrenade.selectMarkdownFlavor`.
- Add the exact manifest command contribution:
  `contributes.commands[] = { "command": "flavorGrenade.selectMarkdownFlavor",
  "title": "Flavor Grenade: Select Markdown Flavor" }`.
- Add exact activation event `onCommand:flavorGrenade.selectMarkdownFlavor`.
- Remove current activation dependency on `onLanguage:ofmarkdown`.
- Preserve `onLanguage:markdown` as the lightweight language wake path for the
  built-in Markdown language.
- Prove generic Markdown language wake performs startup checks only and does not
  spawn indexing without `.obsidian/`, `.flavor-grenade.toml`, explicit selector
  override, or command intent.
- Keep `LanguageClient` `clientOptions.documentSelector` scoped to file-backed
  `markdown` documents only; fail tests if `ofmarkdown` remains in the current
  selector.
- Keep generic Markdown idle without positive signal.
- Add restricted and virtual workspace regression coverage for the selector
  command: the command may open safe UI/status, but it must not spawn the server
  or propagate flavor state in unsupported environments.
- Preserve explicit command wake behavior.

## Linked Requirements

| Requirement | Gap |
|---|---|
| `Extension.Activation.MarkerEvents` | `GAP-E-009`, `AUD-ET-001`, `AUD-ET-002` |
| `Extension.Workspace.EnvironmentModes` | `AUD-E-005`, `AUD-ET-012` |

## Linked Tests

| Spec IDs | Test file | Expected coverage |
|---|---|---|
| `EXT-MF-I-001`, `EXT-MF-I-002` | `extension/src/activation-gate.test.ts` | Vault-marker activation and generic Markdown idle startup without custom language id activation. |
| `EXT-MF-I-003` | `extension/src/activation-gate.test.ts` | Asserts `activationEvents` contains `onLanguage:markdown` and `onCommand:flavorGrenade.selectMarkdownFlavor`, excludes `onLanguage:ofmarkdown`, and selector command wake starts the extension. |
| `EXT-MF-I-007` | `extension/src/activation-gate.test.ts` or `extension/src/client-options.test.ts` | `clientOptions.documentSelector` contains file-backed `markdown` only and rejects `ofmarkdown`; restricted/virtual selector command paths do not spawn the server. |

## Definition of Done

- [ ] `flavorGrenade.selectMarkdownFlavor` is contributed in
      `extension/package.json`, has activation event
      `onCommand:flavorGrenade.selectMarkdownFlavor`, and can wake the
      extension.
- [ ] Startup gate does not require `onLanguage:ofmarkdown`.
- [ ] Manifest retains `onLanguage:markdown` and tests prove generic Markdown
      wake remains lightweight until positive vault/project-config, selector,
      or command intent exists.
- [ ] Current `documentSelector` contains no `ofmarkdown` entry.
- [ ] Restricted and virtual selector command paths preserve disabled/no-server
      behavior.
- [ ] Generic Markdown idle behavior remains covered.

## Workflow Log

> [!INFO] Opened - 2026-05-13
> Status set to `open`. Ticket created and ready for lifecycle transition.
