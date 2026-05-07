---
title: VS Code Extension Parity Plan
tags: [extension/docs, plans, vscode, parity]
aliases: [Extension Parity Plan]
---

# VS Code Extension Parity Plan

## Delivery Slices

| Slice | Outcome |
|---|---|
| E7 Activation precision | Add vault marker activation and generic Markdown idle behavior for `Extension.Activation.MarkerEvents` |
| E8 Command bridges | Add native references, follow-link, embed, backlink, outlink, reveal, and diagnostic commands for `Extension.CommandBridges.GraphActions` |
| E9 Extension tests | Add extension-host tests for `Extension.Tests.HostCoverage`, `Extension.LanguageMode.MembershipRefresh`, and failure states |
| E10 Status UX | Add richer tooltip, disabled states, error states, quick actions, and diagnostic collection for `Extension.Status.QuickActions` |
| E11 Marketplace proof | Add screenshots and README sections for `Extension.Marketplace.AssetPackaging` |
| E12 OFMarkdown contributions | Add snippets, scoped keybindings, and language configuration refinements for `Extension.Contributions.OFMarkdownScoped` |
| E13 Workspace environments | Document restricted, virtual, remote, WSL, SSH, and Dev Container behavior for `Extension.Workspace.EnvironmentModes` |
| E14 Membership and compatibility | Harden membership refresh and package target/version checks for `Extension.LanguageMode.MembershipRefresh` |

## Gate

The phase is complete when:

- root `docs/bdd/features/vscode-extension-parity.feature` scenarios are backed
  by extension-host tests or documented manual verification
- `npm run test` passes under `extension/`
- `npm run compile` passes under `extension/`
- packaged VSIX inspection confirms required assets are present

## Root Phase Plans

- `docs/plans/phase-E7-activation-precision.md`
- `docs/plans/phase-E8-command-bridges-native-navigation.md`
- `docs/plans/phase-E9-extension-host-regression-harness.md`
- `docs/plans/phase-E10-status-ux-troubleshooting.md`
- `docs/plans/phase-E11-marketplace-evidence-packaging-proof.md`
- `docs/plans/phase-E12-ofmarkdown-editor-contributions.md`
- `docs/plans/phase-E13-workspace-environment-modes.md`
- `docs/plans/phase-E14-membership-refresh-compatibility-guardrails.md`
