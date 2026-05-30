---
title: "Flavor Grenade LSP | Flavor-Aware Markdown Tools"
description: "Language server, VS Code extension, and LLM skill support for Obsidian vaults and flavor-aware Markdown projects."
h1: "Flavor Grenade LSP"
summary: "Flavor Grenade LSP helps editors and agents understand Markdown flavor, project structure, local links, tags, attachments, and structured profiles."
related: ["quickstart","features","howToChooseMarkdownFlavor"]
---

# Flavor Grenade LSP

Flavor Grenade LSP helps editors and agents understand Markdown flavor, project structure, local links, tags, attachments, and structured profiles.

## A friendlier editor for connected notes

Use it when Markdown is more than plain text: a workspace may contain Obsidian notes, GitHub documentation, CommonMark READMEs, MDX pages, changelogs, and MADR decision records. Flavor Grenade turns those relationships into editor features like detection, completion, navigation, references, hovers, document symbols, folds, semantic tokens, rename, code actions, and broken-link warnings.

`.fgattributes` can pin flavor or structured-profile rules, `.fgignore` hides files from processing, and Auto Detect runs whenever no concrete flavor rule applies. When there is no strong signal, generic Markdown falls back to CommonMark instead of being treated as Obsidian content.

## Install paths

Install the VS Code extension for the smooth authoring path, the npm language-server package for direct LSP clients, or the LLM skill/plugin when Claude, Codex, or another compatible agent needs JSON evidence before editing Markdown.

```text
VS Code: install from the Visual Studio Marketplace
LSP: npm install --save-dev flavor-grenade-lsp
Skill: npx skill install alisonaquinas/flavor-grenade-lsp --skill flavorgrenade-lsp
```
