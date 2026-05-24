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

Flavor Grenade starts with the folder your editor opened. From there, Auto Detect uses project configuration first, then vault markers, then syntax and path context. Generic Markdown falls back to CommonMark instead of being treated as Obsidian content.

The strongest local markers are `.flavor-grenade.toml` and `.obsidian/`. They matter because not every Markdown folder is an Obsidian vault. If the marker is missing and syntax is ambiguous, Flavor Grenade stays conservative.

```toml
[core.markdown]
flavor = "gfm"
structured_profiles = ["keep-a-changelog"]
```

```text
DocsProject/
  .flavor-grenade.toml
  docs/
    index.md
```

Use `structured_profiles = "none"` to disable structured profile behavior for a project.

## VS Code settings

The VS Code extension is the packaged path for most users. It starts the bundled JavaScript server module, keeps ordinary `.md` files in VS Code's Markdown mode unless there is project evidence, and sends flavor state to the server.

Useful settings:

- `flavorGrenade.markdownFlavor`: `auto` or an explicit base Markdown flavor such as `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, or `stack-overflow`.
- `flavorGrenade.markdownStructuredProfiles`: `auto`, `none`, or an array such as `["keep-a-changelog"]`.
- `flavorGrenade.linkStyle`: wiki-link completion style.
- `flavorGrenade.completion.candidates`: maximum completion items returned.
- `flavorGrenade.diagnostics.suppress`: diagnostic codes to suppress.
- `flavorGrenade.trace.server`: LSP trace level.
- `flavorGrenade.server.path`: user-level custom server command path; workspace values are ignored for safety.

## Document boundaries

Supported document extensions, selected Markdown flavor, structured profiles, and ignore rules keep generated output from becoming noisy indexed content.

A repository might contain source docs, generated API pages, and copied vendor Markdown. Only the human-maintained vault content should drive completion, diagnostics, and rename.

## Operational rule

Prefer explicit project evidence over guessing from any Markdown folder.

If completion is missing expected notes, check folder selection before parser behavior. Make sure the opened folder is the intended vault root or project root, not an unrelated parent workspace.

## Practical check

Check configuration by opening a folder that contains `.obsidian/` or `.flavor-grenade.toml`, then opening a parent folder that contains the same vault as a child. The first case should behave like a vault or configured Markdown project. The second should make the user or client be explicit about the intended root.

Keep the VS Code extension path and raw server path separate in docs. Marketplace installation is friendlier for most users because the extension owns activation, status, settings, and the bundled server module. Direct configuration belongs to people launching the language server themselves.

When someone reports that a setting "does nothing," ask which path they are using. VS Code settings, workspace folders, and extension activation are part of the extension path. Raw language-server clients need to send their own initialization options, configuration, and root information. Mixing those setup stories makes simple configuration issues look mysterious.
