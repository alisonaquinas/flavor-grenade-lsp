---
title: "VS Code Extension Parity Phase Index"
phase: E7-E14
status: superseded
tags: [plans, vscode, extension, marksman-parity]
aliases: [Phase E7, VS Code Extension Parity]
updated: 2026-05-07
---

# VS Code Extension Parity Phase Index

This file previously described one broad Phase E7. That scope is now split into
smaller execution phases so each parity slice can be implemented, reviewed, and
merged independently.

## Split Phases

| Phase | Plan | Primary requirement focus |
|---|---|---|
| E7 | [[phase-E7-activation-precision]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Activation.MarkerEvents]] |
| E8 | [[phase-E8-command-bridges-native-navigation]] | [[docs/requirements/functional/vscode-extension-parity#Extension.CommandBridges.GraphActions]] |
| E9 | [[phase-E9-extension-host-regression-harness]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Tests.HostCoverage]] |
| E10 | [[phase-E10-status-ux-troubleshooting]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Status.QuickActions]] |
| E11 | [[phase-E11-marketplace-evidence-packaging-proof]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Marketplace.AssetPackaging]] |
| E12 | [[phase-E12-ofmarkdown-editor-contributions]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Contributions.OFMarkdownScoped]] |
| E13 | [[phase-E13-workspace-environment-modes]] | [[docs/requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]] |
| E14 | [[phase-E14-membership-refresh-compatibility-guardrails]] | [[docs/requirements/functional/vscode-extension-parity#Extension.LanguageMode.MembershipRefresh]] |

## Source

The split is derived from [[docs/research/marksman-vscode-feature-parity-ofmarkdown]]
and the current Marksman VSCode public extension surface:

- project-scoped activation
- server command discovery
- restart and show-output commands
- custom show-references and follow-link command bridges
- status notification UI
- Marketplace screenshots for editor behavior

## Related

- [[roadmap]]
- [[docs/features/vscode-extension-parity]]
- [[docs/requirements/functional/vscode-extension-parity]]
