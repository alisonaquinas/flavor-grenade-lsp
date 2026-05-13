---
title: "Phase E7: Activation Precision And Startup Gating"
phase: E7
status: complete
tags: [plans, vscode, extension, activation, marksman-parity]
aliases: [Phase E7, Activation Precision]
updated: 2026-05-07
---

# Phase E7: Activation Precision And Startup Gating

| Field | Value |
|---|---|
| Phase | E7 |
| Title | Activation Precision And Startup Gating |
| Status | complete |
| Gate | Vault-marker workspaces activate, generic Markdown stays idle, and command activation remains intentional |
| Depends on | Phase E6 |

## Objective

Match Marksman VSCode's project-scoped activation while using OFMarkdown-native
workspace signals. The extension should wake automatically for Obsidian and
Flavor Grenade vaults, but it should not start vault indexing just because a
generic Markdown file is opened.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.VaultPrecision]] | Correct active or idle state for vault and non-vault workspaces |
| [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]] | Manifest and controller support for `.obsidian/`, `.flavor-grenade.toml`, `markdown`, `ofmarkdown`, and command activation |

## Scope

### In Scope

- Add `workspaceContains:.obsidian` and
  `workspaceContains:.flavor-grenade.toml` activation events.
- Preserve `onLanguage:markdown`, `onLanguage:ofmarkdown`, and command
  activation for late-open and single-file paths.
- Add startup gating so expensive vault work waits for a positive vault signal.
- Add an idle generic Markdown state.
- Document activation behavior in extension docs and Marketplace README.

### Out of Scope

- New command bridges.
- Extension-host test harness expansion beyond activation fixtures.
- Remote and virtual workspace policy beyond idle/active startup gates.

## Acceptance

- `.obsidian/` workspaces activate and start membership detection.
- `.flavor-grenade.toml` workspaces activate and start membership detection.
- Generic Markdown workspaces remain idle until a command or positive vault
  signal appears.
- Explicit commands can wake the extension without bypassing startup checks.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

## Related

- [[docs/research/marksman-vscode-feature-parity-ofmarkdown]]
- [[docs/features/vscode-extension-parity]]
- [[ADR019-vscode-command-bridges-and-client-ux]]
