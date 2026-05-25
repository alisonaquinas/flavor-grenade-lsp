---
title: "Quickstart | Flavor Grenade LSP"
description: "Install Flavor Grenade LSP through VS Code or the npm language-server package, then try a small vault workflow."
h1: "Quickstart"
summary: "Start with the VS Code extension if you want the smooth path, or use the npm package when you are wiring Flavor Grenade into another LSP-capable editor."
related: ["howToVsCodeExtension","advancedDirectLspIntegration","faq"]
---

# Quickstart

Start with the VS Code extension if you want the smooth path, or use the npm package when you are wiring Flavor Grenade into another LSP-capable editor.

## Prerequisites

Start with the VS Code extension if you want the smoothest setup. It packages the language server, starts it for trusted file-system workspaces, shows server status, and handles the normal vault open flow for you.

Use the npm package when you are setting up a direct LSP client. That path fits editors or tools that can launch a stdio language server, send the normal LSP initialize request, and provide a useful vault root through `rootUri` or workspace folders.

- Use the VS Code extension for the easiest first run.
- Use the npm package for Neovim, Helix, custom editor clients, or test harnesses that already know how to speak LSP.
- In both paths, open or point at the folder that contains `.obsidian/` or a Flavor Grenade project config file.

## Option 1: VS Code extension

Install Flavor Grenade LSP from the Visual Studio Marketplace when you want VS Code to own setup and activation. After installation, open the actual Obsidian Vault folder instead of a parent workspace or one loose file.

That folder choice matters. Flavor Grenade resolves wiki links, tags, embeds, and Markdown links relative to the vault root, so the right folder makes completion, navigation, diagnostics, references, and rename agree.

### Install from the Visual Studio Marketplace

Install [Flavor Grenade LSP from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=alisonaquinas.flavor-grenade-lsp), then reload VS Code if prompted.

### Open an Obsidian Vault folder

Use File > Open Folder and choose the folder that contains `.obsidian/` or project config such as `.flavor-grenade.toml`, `.flavor-grenade.jsonc`, or `.flavor-grenade.yaml`.

### Confirm flavor activation

Open a Markdown note in the vault. The Flavor Grenade status should show the effective flavor, such as OFMarkdown for Obsidian vault content or CommonMark for generic Markdown, and the server status should settle into a ready state after indexing.

```text
MyVault/
  .obsidian/
  .flavor-grenade.toml
  Notes/
    Daily Note.md
```

JSON, JSONC, YAML/YML, and Flavor Grenade `.editorconfig` directives can be used instead of TOML when they fit the project better.

## Option 2: npm language-server package

Install the npm package when another editor or tool will launch the language server directly. The package exposes the `flavor-grenade-lsp` command, which communicates over stdin and stdout using standard LSP messages.

This is not an interactive terminal app. If you run it by hand, it will wait for an LSP client to send protocol messages. In a real setup, your editor starts the command and passes the vault root during initialization.

### Install locally

Install the package in the workspace where your editor integration expects to find it.

### Try the latest package with npx

Use `npx` when you want a quick client command without pinning the package yet.

### Point your LSP client at the vault

Configure your client to launch `flavor-grenade-lsp` and send a `rootUri` or workspace folder for the vault. Without a usable root, Flavor Grenade falls back to a quieter single-file mode.

```text
npm install --save-dev flavor-grenade-lsp
npx flavor-grenade-lsp

command: flavor-grenade-lsp
rootUri: file:///Users/alex/MyVault
```

## Try one tiny vault workflow

Create or open a note with one real local reference and one intentionally missing reference. This small example shows both sides of the tool: helpful suggestions for things that exist and a broken-link diagnostic for something that does not.

You do not need a complicated vault to test the basics. A couple of notes are enough to prove that completion, navigation, references, rename, and diagnostics are all reading the same local context.

- Type `[[` and choose a completion from the indexed Obsidian Vault.
- Navigate to `[[Daily Note]]`, find references, then rename a heading or note.
- Leave `[[Missing Target]]` unresolved and confirm a broken-link diagnostic appears.

```text
[[Daily Note]] links to [[People/Ada Lovelace]] and [[Missing Target]].
```

## Troubleshooting

If the VS Code extension does not activate, check workspace trust, the selected language mode, the flavor status, the extension status, and whether you opened the intended workspace root.

If direct npm usage does not behave like vault mode, check that the client is actually launching `flavor-grenade-lsp`, using stdio transport, and sending a `rootUri` or workspace folder that points at the vault. If completion works but diagnostics do not, give the first index a moment to finish and make sure the target file is inside the vault.
