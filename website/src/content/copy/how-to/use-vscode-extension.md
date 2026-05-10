---
title: "Use the VS Code Extension | Flavor Grenade LSP"
description: "Install and activate the Flavor Grenade VS Code extension for Obsidian Vault workflows."
h1: "Use the VS Code Extension"
summary: "Set up Flavor Grenade from the Visual Studio Marketplace and confirm activation."
related: ["quickstart","howToConfigureObsidianVaults","advancedDirectLspIntegration"]
---

# Use the VS Code Extension

Set up Flavor Grenade from the Visual Studio Marketplace and confirm activation.

## When to use it

Install from the Visual Studio Marketplace when you want VS Code activation, commands, and status UI. The extension packages the language server so the normal vault open path does not require configuring an LSP client yourself.

This is the path for users who want the extension to handle activation, status, commands, and server startup. It is the best first install because VS Code owns the editor integration while the bundled server focuses on vault intelligence.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Start from the Marketplace listing, then open the vault root instead of a parent workspace. Use a note with one valid wiki link and one intentionally missing wiki link so activation, completion, and diagnostics are all visible.

### Install

Install Flavor Grenade LSP from the Visual Studio Marketplace and let VS Code reload the extension host.

### Confirm vault open activation

Open the folder that contains `.obsidian/` or `.flavor-grenade.toml` so the server can detect the vault boundary.

### Verify activation

Open a Markdown note, check OFMarkdown mode, then type `[[` to confirm vault-aware completion is active.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Expected result

The extension activates for the vault open event, the server status is ready, and vault-local language features appear in Markdown notes.

A good install feels uneventful: the extension activates on vault open, OFMarkdown mode is available, and the server reaches a ready state without manual command-line work. Completion and diagnostics are the practical proof.

## Common failure mode

If activation does not happen, the folder may not be the vault root, workspace trust may be restricted, or the file may still be plain Markdown.

If nothing activates, verify workspace trust, the selected language mode, and whether the folder contains `.obsidian/` or `.flavor-grenade.toml`. If activation works but vault features are thin, the folder may not be the vault root.
