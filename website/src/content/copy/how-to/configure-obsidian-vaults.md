---
title: "Configure Obsidian Vaults | Flavor Grenade LSP"
description: "Configure vault root detection, indexing boundaries, and generated-output behavior."
h1: "Configure Obsidian Vaults"
summary: "Help Flavor Grenade find the right vault root so links, tags, and attachments line up."
related: ["conceptVaultIndex","advancedConfigurationModel","howToFixBrokenLinks"]
---

# Configure Obsidian Vaults

Help Flavor Grenade find the right vault root so links, tags, and attachments line up.

## When to use it

Use this page when completion or diagnostics look incomplete and you suspect VS Code opened the wrong folder.

Most vault problems start with the root folder. Flavor Grenade reads notes, attachments, and local paths relative to that folder, so opening the right one matters more than tweaking settings first.

## Steps

Start with the folder tree before changing configuration.

A single `.obsidian/` folder or `.flavor-grenade.toml` file should identify the content you want indexed. Keep generated output and unrelated repositories outside that active vault when they should not affect your notes.

### Open the intended root

Open the folder that owns `.obsidian/`, not a parent folder that happens to contain several projects.

### Keep markers explicit

Use `.obsidian/` for Obsidian Vaults or `.flavor-grenade.toml` for a configured Flavor Grenade vault.

### Confirm indexed files

Keep generated output and unrelated assets outside the indexed boundary when they should not show up in completion or diagnostics.

```text
MyVault/
  .obsidian/
  Notes/
    Daily Note.md
  assets/
    diagram.png
```

## Expected result

Flavor Grenade can see the notes, headings, tags, embeds, and attachments that belong to the current vault.

Once the root is right, completion, diagnostics, navigation, references, and rename should all agree about the same local targets.

## Common failure mode

Opening a parent folder can make local paths ambiguous. Opening only one loose file can leave Flavor Grenade without enough context for vault-wide features.

If the extension feels half-awake, check the folder first. It is often seeing too much workspace, or not enough.
