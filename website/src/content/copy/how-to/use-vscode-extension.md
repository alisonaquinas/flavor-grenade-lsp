---
title: "Use the VS Code Extension | Flavor Grenade LSP"
description: "Install and activate the Flavor Grenade VS Code extension for Obsidian Vault workflows."
h1: "Use the VS Code Extension"
summary: "Install the VS Code extension, open your vault, and confirm the editor sees Obsidian-style Markdown."
related: ["quickstart","howToConfigureObsidianVaults","advancedDirectLspIntegration"]
---

# Use the VS Code Extension

Install the VS Code extension, open your vault, and confirm the editor sees Obsidian-style Markdown.

## When to use it

Install from the Visual Studio Marketplace when you want the easiest path. The extension packages the language server, starts it for your vault, and gives you normal server status and commands.

This is the recommended first install. You should not need to configure an LSP client by hand just to try completion, navigation, or broken-link warnings in your notes.

## Steps

Work from inside a real vault folder so the extension can see the notes and attachments your links refer to.

After installation, open the vault root rather than a parent workspace. A small note with one valid link and one missing link is enough to confirm that both completion and diagnostics are active.

### Install

Install Flavor Grenade LSP from the Visual Studio Marketplace and reload VS Code if prompted.

### Confirm vault open activation

Open the folder that contains `.obsidian/` or `.flavor-grenade.toml`. That folder is the boundary Flavor Grenade uses for local links.

### Verify activation

Open a Markdown note, check that the language mode is OFMarkdown, then type `[[` and look for note suggestions from your vault.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Expected result

The extension activates when the vault opens, the server reaches a ready state, and vault-aware features appear in Markdown notes.

A healthy install should feel uneventful. Completion and diagnostics are the easiest proof: one suggests notes that exist, the other warns about local targets that do not.

## Common failure mode

If activation does not happen, VS Code may not trust the workspace, the file may still be plain Markdown, or the opened folder may not be the vault root.

If activation works but suggestions are sparse, double-check that you opened the folder containing `.obsidian/` or `.flavor-grenade.toml`, not a parent folder or one loose file.
