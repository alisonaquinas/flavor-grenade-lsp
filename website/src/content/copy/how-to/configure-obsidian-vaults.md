---
title: "Configure Obsidian Vaults | Flavor Grenade LSP"
description: "Configure vault root detection, indexing boundaries, and generated-output behavior."
h1: "Configure Obsidian Vaults"
summary: "Configure vault detection and index behavior for Obsidian Vaults."
related: ["conceptVaultIndex","advancedConfigurationModel","howToFixBrokenLinks"]
---

# Configure Obsidian Vaults

Configure vault detection and index behavior for Obsidian Vaults.

## When to use it

Use this page when completions or diagnostics look incomplete because VS Code opened the wrong folder or the vault markers are unclear.

Use this guide when the server appears to be working but the vault graph is incomplete. Configuration starts with choosing the correct root because DocIds, attachments, and local paths are all interpreted relative to that boundary.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Check the folder tree before changing settings. A single `.obsidian/` folder or `.flavor-grenade.toml` marker should identify the content you want indexed, while generated output and unrelated repositories should stay outside the active root.

### Open the intended root

Prefer opening the folder that owns `.obsidian/` instead of a parent folder containing several unrelated vaults.

### Keep markers explicit

Use `.obsidian/` for Obsidian Vaults or `.flavor-grenade.toml` for a configured Flavor Grenade vault.

### Confirm indexed files

Keep generated output and external assets outside the indexed boundary when they should not participate in diagnostics.

```text
MyVault/
  .obsidian/
  Notes/
    Daily Note.md
  assets/
    diagram.png
```

## Expected result

The vault index can see notes, headings, tags, embeds, and attachments that belong to the current Obsidian Vault.

After configuration is right, completions should see vault notes, diagnostics should resolve local targets, and references should stay inside the intended workspace. The same note should not resolve differently across features.

## Common failure mode

Opening a parent folder can make vault-relative paths ambiguous; opening only one loose file can fall back to single-file behavior.

Opening a parent directory is the common trap: the server may see too much or fail to choose the vault you meant. Opening one loose file is the opposite trap because the server may fall back to single-file behavior.
