---
title: "Quickstart | Flavor Grenade LSP"
description: "Install Flavor Grenade LSP and verify Obsidian Flavored Markdown features in VS Code."
h1: "Quickstart"
summary: "Install the VS Code extension, open an Obsidian Vault folder, and verify that Flavor Grenade LSP is serving OFMarkdown features."
related: ["howToVsCodeExtension","concepts","faq"]
---

# Quickstart

Install the VS Code extension, open an Obsidian Vault folder, and verify that Flavor Grenade LSP is serving OFMarkdown features.

## Prerequisites

Use the recommended VS Code extension path when you want the fastest setup. Direct LSP server use is for advanced editor integrations.

Before installing anything, decide whether you want VS Code to manage the server for you or whether you are wiring the language server into another editor. The VS Code path is friendlier; the npm server path is lower-level and expects you to provide LSP client configuration.

- VS Code installed on Windows, macOS, Linux, WSL, SSH, or Dev Container.
- An Obsidian Vault folder or Markdown workspace that uses Obsidian-style links.
- A note you can edit, such as notes/Daily Note.md.

## Install from the Visual Studio Marketplace

Install Flavor Grenade LSP from the Visual Studio Marketplace, then reload VS Code if prompted. The Marketplace link is included in this page so you can use the canonical extension listing instead of searching by hand.

After installation, open the actual Obsidian Vault folder. Opening a parent workspace can make vault-relative paths ambiguous, while opening a single loose file can prevent vault-wide features from turning on.

### Open an Obsidian Vault folder

Use File > Open Folder and choose the folder that contains `.obsidian/` or `.flavor-grenade.toml`.

### Confirm OFMarkdown activation

Open a Markdown note in the vault and confirm the language mode becomes OFMarkdown while the server status is ready.

## Verify the first vault workflow

Create a note with a real local reference, then use completion, navigation, references, rename, and diagnostics in one pass.

A good first check deliberately mixes one valid target with one missing target. That lets you see both sides of the server: successful vault lookup and conservative diagnostics when a local reference cannot be resolved.

- Type `[[` and choose a completion from the indexed Obsidian Vault.
- Navigate to `[[Daily Note]]`, find references, then rename a heading or note.
- Leave `[[Missing Target]]` unresolved and confirm a broken-link diagnostic appears.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Troubleshooting

If activation does not happen, check workspace trust, the selected language mode, the extension status, and whether the opened folder is the vault root.

If completion works but diagnostics do not, give the initial index a moment to finish and verify that the target file is inside the vault. If diagnostics work but rename is skipped, the reference may be ambiguous or outside the supported local target set.
