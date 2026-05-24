---
title: "Flavor Grenade LSP | Flavor-Aware Markdown Tools"
description: "Language server and VS Code extension support for Obsidian vaults and flavor-aware Markdown projects."
h1: "Flavor Grenade LSP"
summary: "Flavor Grenade LSP helps VS Code understand Markdown flavor, project structure, local links, tags, and attachments."
related: ["quickstart","features","howToChooseMarkdownFlavor"]
---

# Flavor Grenade LSP

Flavor Grenade LSP helps VS Code understand Markdown flavor, project structure, local links, tags, and attachments.

## A friendlier editor for connected notes

Use it when Markdown is more than plain text: a workspace may contain Obsidian notes, GitHub documentation, CommonMark READMEs, MDX pages, changelogs, and MADR decision records. Flavor Grenade turns those relationships into editor features like detection, completion, navigation, references, hovers, document symbols, folds, semantic tokens, rename, code actions, and broken-link warnings.

Auto Detect uses explicit project configuration first, then vault markers, syntax, and path context. When there is no strong signal, generic Markdown falls back to CommonMark instead of being treated as Obsidian content.
