---
title: "Phase E10: Status UX And Troubleshooting"
phase: E10
status: planned
tags: [plans, vscode, extension, status, troubleshooting]
aliases: [Phase E10, Status UX]
updated: 2026-05-07
---

# Phase E10: Status UX And Troubleshooting

| Field | Value |
|---|---|
| Phase | E10 |
| Title | Status UX And Troubleshooting |
| Status | planned |
| Gate | Known server and workspace states have accurate status, tooltip detail, and recovery actions |
| Depends on | Phase E9 |

## Objective

Make the status bar an operational control surface. Users should understand
whether Flavor Grenade is starting, indexing, ready, disabled, crashed, or
misconfigured without opening logs first.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/vscode-extension-parity#Extension.Status.Diagnostics]] | Represent lifecycle, disabled, error, and crash states |
| [[requirements/functional/vscode-extension-parity#Extension.Status.QuickActions]] | Provide restart, rebuild, output, diagnostic copy, and vault reveal actions |

## Scope

### In Scope

- Add tooltip fields for server state, server version, extension version, active
  vault root, vault count, document count, and last error.
- Add warning or disabled states for missing binary, crash exhaustion,
  Restricted Mode, virtual workspaces, and unsupported platforms.
- Add `flavorGrenade.copyDiagnosticInfo`.
- Add a status quick-action menu or equivalent command flow.
- Add troubleshooting documentation for common install and runtime failures.

### Out of Scope

- Remote workspace smoke execution.
- Marketplace screenshots.
- Custom tree views.

## Acceptance

- Every known status state has accurate text and tooltip detail.
- Every error or disabled state has a useful next action.
- Diagnostic copy output avoids secrets and includes actionable version and
  platform data.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

## Related

- [[features/vscode-extension-parity]]
- [[ddd/editor-client/domain-model]]
- [[research/marksman-vscode-feature-parity-ofmarkdown]]
