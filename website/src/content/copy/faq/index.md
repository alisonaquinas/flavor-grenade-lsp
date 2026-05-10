---
title: "FAQ | Flavor Grenade LSP"
description: "Answers about Obsidian compatibility, VS Code setup, rename safety, and LSP behavior."
h1: "Frequently Asked Questions"
summary: "Answers to common questions about compatibility, activation, indexing, and rename safety."
related: ["quickstart","advancedUsage","howToVsCodeExtension"]
---

# Frequently Asked Questions

Answers to common questions about compatibility, activation, indexing, and rename safety.

## What is Flavor Grenade LSP?

It is a language server and VS Code extension for Obsidian Flavored Markdown workflows: links, headings, tags, embeds, diagnostics, navigation, references, and rename.

## Is Flavor Grenade LSP an Obsidian plugin?

No. It is editor tooling for VS Code and LSP clients. Obsidian does not need to run for the server to understand an Obsidian Vault folder.

## How is it different from Marksman?

Marksman inspired the project and is excellent Markdown LSP prior art. Flavor Grenade focuses specifically on Obsidian Flavored Markdown conventions and vault-aware behavior.

## Does Obsidian have to be installed?

No. The important input is the Obsidian Vault folder structure and Markdown content.

## Does it edit my vault automatically?

No. Diagnostics and completions are suggestions. Rename and code actions produce explicit editor edits that stay vault-confined.

## Which Markdown and OFM features are understood?

The parser understands wiki links, Markdown links, embeds, block references, tags, callouts, math, comments, frontmatter, and Templater-style opaque regions.

## Can Neovim or another LSP client use it?

The server is an LSP server, but the VS Code extension is the supported packaged path. Other clients may require manual transport and configuration.

## Why are some links not resolved?

External URLs, unsupported URI schemes, paths outside the vault, ambiguous headings, and intentionally ignored files are not resolved as editable local targets.

## How do I report a bug?

Create a minimal vault that reproduces the issue, include the link text and expected target, and note whether the problem appears in diagnostics, completion, navigation, references, or rename.
