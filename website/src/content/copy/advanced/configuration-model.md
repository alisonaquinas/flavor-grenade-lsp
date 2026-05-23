---
title: "Configuration Model | Flavor Grenade LSP"
description: "Understand VS Code settings, vault markers, document extensions, and server options."
h1: "Configuration Model"
summary: "Learn how Flavor Grenade decides which folder is the vault and which files belong to it."
related: ["howToConfigureObsidianVaults","advancedVaultSingleFileMode","advancedIndexingPerformance"]
---

# Configuration Model

Learn how Flavor Grenade decides which folder is the vault and which files belong to it.

## Configuration sources

Flavor Grenade starts with the folder your editor opened. From there, it looks for `.obsidian/` or `.flavor-grenade.toml` to confirm that the folder should be treated as a vault.

Those markers matter because not every Markdown folder is an Obsidian Vault. If the marker is missing, Flavor Grenade stays conservative instead of guessing which files belong together.

```text
DocsProject/
  .flavor-grenade.toml
  docs/
    index.md
```

## Document boundaries

Supported document extensions and ignore rules keep generated output from becoming noisy indexed content.

A repository might contain source docs, generated API pages, and copied vendor Markdown. Only the human-maintained vault content should drive completion, diagnostics, and rename.

## Operational rule

Prefer explicit vault markers over guessing from any Markdown folder.

If completion is missing expected notes, check folder selection before parser behavior. Make sure the opened folder is the intended vault root, not a parent workspace.

## Practical check

Check configuration by opening a folder that contains `.obsidian/` or `.flavor-grenade.toml`, then opening a parent folder that contains the same vault as a child. The first case should behave like a vault. The second should make the user or client be explicit about the intended root.

Keep the VS Code extension path and raw server path separate in docs. Marketplace installation is friendlier for most users; direct configuration belongs to people launching the language server themselves.

When someone reports that a setting “does nothing,” ask which path they are using. VS Code settings, workspace folders, and extension activation are part of the extension path. Raw language-server clients need to send their own initialization options and root information. Mixing those setup stories makes simple configuration issues look mysterious.
