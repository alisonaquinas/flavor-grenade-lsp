---
title: "FAQ | Flavor Grenade LSP"
description: "Answers about Obsidian compatibility, VS Code setup, rename safety, and LSP behavior."
h1: "Frequently Asked Questions"
summary: "Straight answers about setup, Obsidian compatibility, indexing, and safe edits."
related: ["quickstart","advancedUsage","howToVsCodeExtension"]
---

# Frequently Asked Questions

Straight answers about setup, Obsidian compatibility, indexing, and safe edits.

## What is Flavor Grenade LSP?

It is a VS Code extension and language server for Obsidian-style Markdown. It helps your editor understand wiki links, headings, tags, embeds, broken-link warnings, navigation, references, and rename.

## Is Flavor Grenade LSP an Obsidian plugin?

No. It is editor tooling for VS Code and other language-server clients. Obsidian does not need to be running; the important thing is that VS Code opens the vault folder.

## How is it different from Marksman?

Marksman is excellent Markdown language-server prior art and helped inspire this project. Flavor Grenade focuses more narrowly on Obsidian-style vault behavior: wiki links, embeds, tags, and local vault relationships.

## Does Obsidian have to be installed?

No. Flavor Grenade reads the vault folder structure and Markdown files directly.

## Does it edit my vault automatically?

No. Warnings and completions are suggestions. Rename and code actions produce explicit editor edits, and those edits stay inside the vault boundary.

## Which Markdown and OFM features are understood?

Flavor Grenade understands wiki links, Markdown links, embeds, block references, tags, callouts, math blocks, comments, frontmatter, and Templater-style regions that should be ignored as examples or generated text.

## Can Neovim or another LSP client use it?

The server speaks LSP, so other editors can integrate with it. The VS Code extension is the supported packaged path; other clients may need manual launch, transport, and root-folder configuration.

## Why are some links not resolved?

Some links are valid Markdown but are not safe vault edits. External URLs, unsupported URI schemes, paths outside the vault, ambiguous headings, and ignored files are left alone.

## How do I report a bug?

Create a tiny vault that shows the problem, include the link text and expected target, and say where you saw it: diagnostics, completion, navigation, references, or rename.
