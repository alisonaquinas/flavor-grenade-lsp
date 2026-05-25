---
title: "Configuration Model | Flavor Grenade LSP"
description: "Understand VS Code settings, project config formats, vault markers, document extensions, and server options."
h1: "Configuration Model"
summary: "Learn how Flavor Grenade decides which folder is the vault and which files belong to it."
related: ["howToConfigureObsidianVaults","advancedVaultSingleFileMode","advancedIndexingPerformance"]
---

# Configuration Model

Learn how Flavor Grenade decides which folder is the vault, which files belong to it, and which Markdown flavor applies to each document.

## Configuration sources

Flavor Grenade starts with the folder your editor opened. From there, root detection looks for vault and project markers, then Auto Detect resolves the document flavor from project configuration, Obsidian vault evidence, syntax, and path context. Generic Markdown falls back to CommonMark instead of being treated as Obsidian content.

The strongest local markers are Flavor Grenade project config files and `.obsidian/`. They matter because not every Markdown folder is an Obsidian vault. If the marker is missing and syntax is ambiguous, Flavor Grenade stays conservative.

Project config discovery checks the first existing file in this order:

1. `.flavor-grenade.toml`
2. `.flavor-grenade.json`
3. `.flavor-grenade.jsonc`
4. `.flavor-grenade.yaml`
5. `.flavor-grenade.yml`
6. `.editorconfig` with Flavor Grenade directives

TOML remains the first supported format. The other formats are additive.

## Single project flavor

Use one global project flavor when every Markdown file in the folder should use the same base flavor.

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

The same global configuration in JSON:

```json
{
  "core": {
    "markdown": {
      "flavor": "gfm",
      "structured_profiles": ["keep-a-changelog"]
    }
  }
}
```

## One directory override

Use one override when a repository mostly follows one flavor, but a single folder needs another.

TOML:

```toml
[core.markdown]
flavor = "commonmark"
structured_profiles = "auto"

[[core.markdown.overrides]]
path = "docs/decisions"
flavor = "commonmark"
structured_profiles = ["madr"]
```

JSONC:

```jsonc
{
  // Default for ordinary docs.
  "core": {
    "markdown": {
      "flavor": "commonmark",
      "structured_profiles": "auto",
      "overrides": [
        {
          "path": "docs/decisions",
          "flavor": "commonmark",
          "structured_profiles": ["madr"]
        }
      ]
    }
  }
}
```

`.editorconfig`:

```ini
[docs/decisions/*.md]
flavor_grenade_markdown_flavor = commonmark
flavor_grenade_markdown_structured_profiles = madr
```

## Multiple directory overrides

Use multiple overrides when one repository contains docs for different renderers or conventions.

TOML:

```toml
[core.markdown]
flavor = "commonmark"
structured_profiles = "auto"

[[core.markdown.overrides]]
path = "docs/github"
flavor = "gfm"
structured_profiles = ["keep-a-changelog"]

[[core.markdown.overrides]]
path = "docs/gitlab"
flavor = "glfm"
structured_profiles = ["common-changelog"]

[[core.markdown.overrides]]
path = "docs/decisions"
flavor = "commonmark"
structured_profiles = ["madr"]
```

JSON:

```json
{
  "core": {
    "markdown": {
      "flavor": "commonmark",
      "structured_profiles": "auto",
      "overrides": [
        {
          "path": "docs/github",
          "flavor": "gfm",
          "structured_profiles": ["keep-a-changelog"]
        },
        {
          "path": "docs/gitlab",
          "flavor": "glfm",
          "structured_profiles": ["common-changelog"]
        },
        {
          "path": "docs/decisions",
          "flavor": "commonmark",
          "structured_profiles": ["madr"]
        }
      ]
    }
  }
}
```

YAML:

```yaml
core:
  markdown:
    flavor: commonmark
    structured_profiles: auto
    overrides:
      - path: docs/github
        flavor: gfm
        structured_profiles: [keep-a-changelog]
      - path: docs/gitlab
        flavor: glfm
        structured_profiles: [common-changelog]
      - path: docs/decisions
        flavor: commonmark
        structured_profiles: [madr]
```

YML:

```yaml
core:
  markdown:
    flavor: commonmark
    overrides:
      - path: docs/api
        flavor: pandoc
      - path: docs/components
        flavor: mdx
```

`.editorconfig`:

```ini
[docs/github/*.md]
flavor_grenade_markdown_flavor = gfm
flavor_grenade_markdown_structured_profiles = keep-a-changelog

[docs/gitlab/*.md]
flavor_grenade_markdown_flavor = glfm
flavor_grenade_markdown_structured_profiles = common-changelog

[docs/decisions/*.md]
flavor_grenade_markdown_flavor = commonmark
flavor_grenade_markdown_structured_profiles = madr
```

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

Check configuration by opening a folder that contains `.obsidian/` or a Flavor Grenade project config marker, then opening a parent folder that contains the same vault as a child. The first case should behave like a vault or configured Markdown project. The second should make the user or client be explicit about the intended root.

Keep the VS Code extension path and raw server path separate in docs. Marketplace installation is friendlier for most users because the extension owns activation, status, settings, and the bundled server module. Direct configuration belongs to people launching the language server themselves.

When someone reports that a setting "does nothing," ask which path they are using. VS Code settings, workspace folders, and extension activation are part of the extension path. Raw language-server clients need to send their own initialization options, configuration, and root information. Mixing those setup stories makes simple configuration issues look mysterious.
