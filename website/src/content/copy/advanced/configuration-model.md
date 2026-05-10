---
title: "Configuration Model | Flavor Grenade LSP"
description: "Understand VS Code settings, vault markers, document extensions, and server options."
h1: "Configuration Model"
summary: "Understand VS Code settings, vault markers, document extensions, and server options."
related: ["howToConfigureObsidianVaults","advancedVaultSingleFileMode","advancedIndexingPerformance"]
---

# Configuration Model

Understand VS Code settings, vault markers, document extensions, and server options.

## Configuration sources

Flavor Grenade starts from the editor root, then uses `.obsidian/` or `.flavor-grenade.toml` to decide whether a folder is a vault.

That marker-based approach keeps the tool from treating every Markdown folder as an Obsidian Vault. If the marker is missing, the server should stay conservative because it cannot know which files, attachments, and paths belong together.

```text
DocsProject/
  .flavor-grenade.toml
  docs/
    index.md
```

## Document boundaries

Supported document extensions and ignore rules should keep generated output from becoming noisy indexed content.

For example, a repository might contain source docs, generated API pages, and copied vendor Markdown. Only the human-maintained vault content should drive completions, diagnostics, and rename behavior.

## Operational rule

Prefer explicit vault markers over guessing from any Markdown folder.

If a user says completion is missing expected notes, the first check is usually folder selection rather than parser behavior: confirm the opened folder is the intended vault root and not a parent workspace.

## Practical check

Check configuration by opening a folder that contains `.obsidian/` or `.flavor-grenade.toml`, then opening a parent folder that contains the same vault as a child. The first case should behave like a vault; the second should force the user or client to be explicit about the intended root. That contrast keeps the article grounded in the actual source of configuration truth.

The public page should also show the server-only and VS Code paths separately. Marketplace installation is the friendly path for most users, while direct configuration belongs to people launching the language server themselves. Mixing those paths makes support harder because the extension and raw server do not own the same setup responsibilities.
