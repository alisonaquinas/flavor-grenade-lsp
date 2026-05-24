---
title: "Configure Markdown Workspaces | Flavor Grenade LSP"
description: "Configure root detection, indexing boundaries, explicit flavor markers, and generated-output behavior."
h1: "Configure Markdown Workspaces"
summary: "Help Flavor Grenade find the right project root so flavor detection, links, tags, and attachments line up."
related: ["howToChooseMarkdownFlavor","conceptVaultIndex","advancedConfigurationModel"]
---

# Configure Markdown Workspaces

Help Flavor Grenade find the right project root so flavor detection, links, tags, and attachments line up.

## When to use it

Use this page when completion, diagnostics, or Markdown flavor detection look incomplete and you suspect VS Code opened the wrong folder.

Most workspace problems start with the root folder. Flavor Grenade reads notes, docs, attachments, configuration, and local paths relative to that folder, so opening the right one matters more than tweaking settings first.

## Steps

Start with the folder tree before changing configuration.

A single `.obsidian/` folder or `.flavor-grenade.toml` file should identify the content you want indexed. Keep generated output and unrelated repositories outside that active workspace when they should not affect your notes or docs.

### Open the intended root

Open the folder that owns `.obsidian/` or `.flavor-grenade.toml`, not a parent folder that happens to contain several projects.

### Keep markers explicit

Use `.obsidian/` for Obsidian vaults or `.flavor-grenade.toml` for a configured Markdown project.

### Confirm indexed files

Keep generated output and unrelated assets outside the indexed boundary when they should not show up in completion or diagnostics.

```text
DocsProject/
  .flavor-grenade.toml
  docs/
    README.md
    decisions/
      0001-use-language-server.md
  CHANGELOG.md
```

```toml
[core.markdown]
flavor = "auto"
structured_profiles = "auto"
```

## Expected result

Flavor Grenade can see the files, headings, tags, embeds, structured documents, and attachments that belong to the current workspace.

Once the root is right, completion, diagnostics, navigation, references, and rename should all agree about the same local targets.

## Common failure mode

Opening a parent folder can make local paths ambiguous. Opening only one loose file can leave Flavor Grenade without enough context for workspace-wide features.

If the extension feels half-awake, check the folder first. It is often seeing too much workspace, or not enough.
