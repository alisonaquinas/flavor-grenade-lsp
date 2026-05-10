---
title: "Compatibility and Direct LSP Integration | Flavor Grenade LSP"
description: "Use the supported VS Code extension path first; direct LSP clients own advanced setup."
h1: "Compatibility and Direct LSP Integration"
summary: "Use the VS Code extension for the smooth path; use direct LSP integration when your editor can own the setup."
related: ["howToVsCodeExtension","advancedConfigurationModel","advancedVaultSingleFileMode"]
---

# Compatibility and Direct LSP Integration

Use the VS Code extension for the smooth path; use direct LSP integration when your editor can own the setup.

## Supported path

The VS Code extension packages the server, handles activation, and is the recommended setup for most users.

The extension path should be boring in the best way: install, open a vault, wait for ready status, and start using completion or diagnostics. Choose the server-only path when you are integrating another editor or testing the server directly.

## Install the server from npm

For direct LSP use, install the language server package with npm in the environment where your editor client will launch it. This does not install the VS Code extension or configure an editor by itself.

Use a local project install when you want the server pinned with the workspace, or use `npx` for a quick test. Your client still needs to start the command and send a usable `rootUri`.

```text
npm install --save-dev flavor-grenade-lsp
npx flavor-grenade-lsp
```

## Direct LSP clients

Direct clients must launch the server, provide a usable `rootUri`, and handle file watching.

The root URI is not cosmetic. It decides whether Flavor Grenade can find `.obsidian/` or `.flavor-grenade.toml`, build a vault index, and provide vault-wide features such as note completion, references, and rename.

```text
{
  "rootUri": "file:///Users/alex/MyVault",
  "workspaceFolders": [
    { "uri": "file:///Users/alex/MyVault", "name": "MyVault" }
  ]
}
```

## Compatibility boundary

The server speaks LSP, but non-VS-Code clients may need custom transport and configuration work.

If a direct client can launch a Node-based stdio language server and send normal LSP initialize parameters, it has the right starting point. If it cannot provide a stable file root, expect single-file behavior rather than full vault behavior.

## Practical check

A direct-client example should include both the command that launches the npm-installed server and the initialize data the client sends afterward. Installing the package is only half the work; the client still owns stdio transport, workspace folders, root URI selection, and restart behavior.

Keep the VS Code article linked from here because it is the supported path for most readers. Direct integration is for editor maintainers, advanced users, and test harnesses that already understand LSP wiring.
