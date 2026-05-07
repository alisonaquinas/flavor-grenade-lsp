---
title: Workspace Environment Modes
tags: [extension/docs, vscode, workspace, remote, troubleshooting]
aliases: [Workspace Environments, Remote Smoke Tests]
---

# Workspace Environment Modes

Flavor Grenade runs as a workspace extension so the bundled language server runs
next to the files it indexes. Local and remote file-system workspaces are
supported. Restricted Mode and virtual workspaces stay disabled before the
server process is created.

## Behavior Matrix

| Environment | Server startup | Expected status | Evidence |
|---|---|---|---|
| Local Windows | Starts from the Windows VSIX binary | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | Package target includes `server/flavor-grenade-lsp.exe`; vault opens in trusted file workspace |
| Local macOS | Starts from the macOS VSIX binary | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | Package target includes `server/flavor-grenade-lsp`; vault opens in trusted file workspace |
| Local Linux | Starts from the Linux VSIX binary | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | Package target includes `server/flavor-grenade-lsp`; vault opens in trusted file workspace |
| WSL | Starts in the WSL extension host | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | `remoteName` is `wsl` and diagnostic platform is Linux host architecture |
| SSH | Starts in the SSH extension host | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | `remoteName` is `ssh-remote` and diagnostic platform is the remote host platform |
| Dev Container | Starts in the container extension host | `FG: Starting`, `FG: Indexing`, then `FG: N docs` | `remoteName` is `dev-container` and diagnostic platform is the container platform |
| Restricted Mode | Does not start | `FG: Disabled` | Tooltip says workspace is not trusted and diagnostics show `serverPath: not started` |
| Virtual workspace | Does not start | `FG: Disabled` | Tooltip says file-system vault access is required and diagnostics show `serverPath: not started` |

## Manual Smoke Test

Use this checklist for local Windows, macOS, Linux, WSL, SSH, and Dev Container
verification:

1. Install the platform-specific Flavor Grenade VSIX for the environment where
   the extension host runs.
2. Open a trusted file-system Obsidian vault containing `.obsidian/`.
3. Open a vault Markdown note.
4. Confirm the status reaches `FG: N docs`.
5. Run **Flavor Grenade: Copy Diagnostic Info**.
6. Record the environment name, status text, diagnostic `platform`, diagnostic
   `serverPath`, and whether completions work for `[[`.

Manual evidence is acceptable for WSL, SSH, and Dev Container closeout because
CI cannot create those VS Code extension hosts. Automated tests cover the
environment classifier and no-spawn behavior for restricted and virtual
workspace inputs.

## Disabled Smoke Test

Use this checklist for unsupported modes:

1. Open a vault in Restricted Mode, or open a non-file virtual workspace.
2. Confirm the status is `FG: Disabled`.
3. Confirm **Flavor Grenade: Copy Diagnostic Info** reports
   `serverPath: not started`.
4. Confirm no Flavor Grenade server process is spawned from the extension.

## Related

- [troubleshooting.md](../troubleshooting.md)
- [activation-behavior.md](activation-behavior.md)
- [../plans/vscode-extension-parity.md](../plans/vscode-extension-parity.md)
