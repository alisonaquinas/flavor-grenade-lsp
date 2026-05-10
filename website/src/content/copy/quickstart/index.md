---
title: "Quickstart | Flavor Grenade LSP"
description: "Install Flavor Grenade LSP and verify Obsidian Flavored Markdown features in VS Code."
h1: "Quickstart"
summary: "Install the VS Code extension, open your vault, and try one small note workflow to make sure everything is working."
related: ["howToVsCodeExtension","concepts","faq"]
---

# Quickstart

Install the VS Code extension, open your vault, and try one small note workflow to make sure everything is working.

## Prerequisites

For most people, the VS Code extension is the right starting point. It installs the language server for you and handles activation when you open a vault.

If you are wiring the server into another editor, the npm package is available too, but that path expects you to configure the editor client yourself.

- VS Code installed on Windows, macOS, Linux, WSL, SSH, or Dev Container.
- An Obsidian Vault folder or Markdown workspace that uses Obsidian-style links.
- A note you can edit, such as notes/Daily Note.md.

## Install from the Visual Studio Marketplace

Install Flavor Grenade LSP from the Visual Studio Marketplace, then reload VS Code if prompted. After that, open the folder that is actually your Obsidian Vault.

That folder choice matters. If you open a parent workspace, links may be hard to interpret. If you open one loose file, Flavor Grenade may not have enough context to offer vault-wide help.

### Open an Obsidian Vault folder

Use File > Open Folder and choose the folder that contains `.obsidian/` or `.flavor-grenade.toml`.

### Confirm OFMarkdown activation

Open a Markdown note in the vault and confirm the language mode becomes OFMarkdown while the server status is ready.

## Verify the first vault workflow

Create a note with one real local reference and one intentionally missing reference. That small example lets you see both the helpful path and the warning path.

You do not need a complicated vault to test the basics. A couple of notes are enough to prove that completion, navigation, references, rename, and diagnostics are all reading the same local context.

- Type `[[` and choose a completion from the indexed Obsidian Vault.
- Navigate to `[[Daily Note]]`, find references, then rename a heading or note.
- Leave `[[Missing Target]]` unresolved and confirm a broken-link diagnostic appears.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Troubleshooting

If activation does not happen, check workspace trust, the selected language mode, the extension status, and whether you opened the vault root.

If completion works but diagnostics do not, give the first index a moment to finish and make sure the target file is inside the vault. If diagnostics work but rename is skipped, the reference may be ambiguous or outside the set of local links Flavor Grenade can safely edit.
