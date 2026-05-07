---
title: "Phase E13: Workspace Environment Modes"
phase: E13
status: in-progress
tags: [plans, vscode, extension, workspace, remote]
aliases: [Phase E13, Workspace Environments]
updated: 2026-05-07
---

# Phase E13: Workspace Environment Modes

| Field | Value |
|---|---|
| Phase | E13 |
| Title | Workspace Environment Modes |
| Status | in-progress |
| Gate | Restricted, virtual, local, WSL, SSH, Dev Container, and remote behavior is explicit and verified |
| Depends on | Phase E12 |

## Objective

Make workspace environment behavior predictable. Flavor Grenade bundles a server
binary, so it needs clear rules for where that binary can run and how users see
unsupported modes.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[requirements/functional/vscode-extension-parity#Extension.Workspace.EnvironmentModes]] | Document and verify restricted, virtual, remote, WSL, SSH, and Dev Container behavior |
| [[requirements/functional/vscode-extension-parity#Extension.Status.Diagnostics]] | Surface disabled and unsupported modes through status UI |

## Scope

### In Scope

- Confirm Restricted Mode does not spawn the server and shows disabled status.
- Confirm virtual workspaces do not spawn the server and explain the file-system
  requirement.
- Document local Windows, macOS, and Linux behavior.
- Document WSL, SSH, and Dev Container smoke tests.
- Verify remote extension hosts resolve the correct platform-specific binary.

### Out of Scope

- Web extension support.
- Runtime binary download fallback.
- Remote vault protocols over HTTP.

## Acceptance

- Unsupported modes are blocked before server spawn.
- Supported remote modes have a documented verification path.
- Status and troubleshooting docs agree on environment behavior.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

Manual smoke tests are required for remote modes that cannot run in CI.

## Related

- [[research/vscode-extension-publishing]]
- [[features/vscode-extension-parity]]
- [[ADR015-platform-specific-vsix]]
