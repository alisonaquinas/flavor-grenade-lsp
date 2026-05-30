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
| E9 Extension tests | Legacy complete: extension-host tests cover activation, command bridges, and status/failure surfaces; Markdown flavor selector host coverage is superseded by E17 |
| E10 Status UX | Complete: rich tooltip, disabled states, error states, quick actions, troubleshooting docs, and diagnostic collection cover `Extension.Status.Diagnostics` and `Extension.Status.QuickActions` |
| E11 Marketplace proof | Complete: README visuals and packaged asset checks cover `Extension.Marketplace.OFMProof` and `Extension.Marketplace.AssetPackaging` |
| E12 OFMarkdown contributions | Legacy complete: `ofmarkdown` contribution scoping was implemented before ADR020; Markdown flavor/context contribution scoping is superseded by E16 |
| E13 Workspace environments | Complete: restricted, virtual, remote, WSL, SSH, and Dev Container behavior is classified and smoke-tested for `Extension.Workspace.EnvironmentModes` |
| E14 Membership refresh and compatibility | Legacy complete: language-mode membership refresh was implemented before ADR020; Markdown flavor refresh is superseded by E15/E17 |
| E15 Markdown flavor selector and config files | Planned: add selector, `.fgattributes` persistence, `.fgignore` inactive state, auto-detect, manual-language safety, and server propagation |
| E16 Flavor-scoped contributions and Marketplace | Planned: replace `ofmarkdown` contribution scoping and Marketplace proof with Markdown flavor selector/context evidence |
| E17 Extension flavor host verification | Planned: close `EXT-MF-VF-001` through `EXT-MF-VF-006`, including unit, compile, host, Marketplace, CI, and extension docs lint gates |

## Gate

The phase is complete when:

- root `docs/bdd/features/vscode-extension-parity.feature` scenarios are backed
  by extension-host tests or documented manual verification
- `npm run test` passes under `extension/`
- `npm run compile` passes under `extension/`
- `npm run test:host` passes under `extension/`
- `npm run verify:marketplace-assets` covers Markdown flavor selector proof
- repository `bun run lint:docs` covers `extension/docs/**/*.md`
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
- `docs/plans/phase-E15-markdown-flavor-selector-settings.md`
- `docs/plans/phase-E16-flavor-scoped-contributions-marketplace.md`
- `docs/plans/phase-E17-extension-flavor-host-verification.md`
