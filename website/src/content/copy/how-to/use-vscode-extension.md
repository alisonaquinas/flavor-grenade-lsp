---
title: "Use the VS Code Extension | Flavor Grenade LSP"
description: "Install and activate the Flavor Grenade VS Code extension for Markdown workspace workflows."
h1: "Use the VS Code Extension"
summary: "Install the VS Code extension, open your Markdown workspace, and confirm the editor sees the effective flavor."
related: ["quickstart","howToConfigureObsidianVaults","advancedDirectLspIntegration"]
---

# Use the VS Code Extension

Install the VS Code extension, open your Markdown workspace, and confirm the editor sees the effective flavor.

## When to use it

Install from the Visual Studio Marketplace when you want the easiest path. The extension packages the language server, starts it for trusted file-system Markdown workspaces, and gives you normal server status, flavor status, and commands.

This is the recommended first install. You should not need to configure an LSP client by hand just to try completion, navigation, or broken-link warnings in your notes.

## Steps

Work from inside the real workspace folder so the extension can see the notes, docs, changelogs, decisions, and attachments your links refer to.

After installation, open the project or vault root rather than a parent workspace. A small note with one valid link and one missing link is enough to confirm that both completion and diagnostics are active.

### Install

Install Flavor Grenade LSP from the Visual Studio Marketplace and reload VS Code if prompted.

### Confirm vault open activation

Open the folder that contains `.obsidian/`, a Flavor Grenade project config file, or the Markdown files you want analyzed. That folder is the boundary Flavor Grenade uses for local links.

### Verify activation

Open a Markdown note, check that the status bar shows the effective flavor such as OFMarkdown, GFM, MDX, or CommonMark, then type `[[` in Obsidian content or a local Markdown link in generic content and look for workspace-aware suggestions.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Expected result

The extension activates when the workspace opens, the server reaches a ready state, and flavor-aware features appear in Markdown files.

A healthy install should feel uneventful. Completion and diagnostics are the easiest proof: one suggests notes that exist, the other warns about local targets that do not.

## Common failure mode

If activation does not happen, VS Code may not trust the workspace, the file may still be plain Markdown, or the opened folder may not be the vault root.

If activation works but suggestions are sparse, double-check that you opened the folder containing `.obsidian/` or project config, not a parent folder or one loose file. For generic Markdown without strong evidence, CommonMark fallback is expected.
