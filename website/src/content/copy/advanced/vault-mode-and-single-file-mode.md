---
title: "Vault Mode and Single-file Mode | Flavor Grenade LSP"
description: "Compare vault-wide behavior with the conservative single-file fallback mode."
h1: "Vault Mode and Single-file Mode"
summary: "Vault mode gives Flavor Grenade the whole local picture; single-file mode keeps it cautious."
related: ["advancedConfigurationModel","conceptVaultIndex","advancedDirectLspIntegration"]
---

# Vault Mode and Single-file Mode

Vault mode gives Flavor Grenade the whole local picture; single-file mode keeps it cautious.

## Vault mode

Vault mode starts when Flavor Grenade finds `.obsidian/` or `.flavor-grenade.toml`. It can then scan the vault and build the map used by completion, diagnostics, references, and rename.

Use vault mode for normal Obsidian work. It gives the tool enough context to understand notes, inbound links, attachments, tags, and headings across files.

```text
MyVault/
  .obsidian/
  Notes/
    Home.md
```

## Single-file mode

Single-file mode is the fallback when no vault marker is available. Flavor Grenade can still parse the open file, but it does not scan the whole workspace for note names.

That quiet behavior is intentional. A loose Markdown file may belong to another tool or to a vault that was not opened, so broad diagnostics and cross-file edits would be risky.

## Direct clients

A direct LSP client should send a `rootUri` or workspace folder for the intended vault root.

If the client sends no usable root, Flavor Grenade cannot discover vault markers. That is the difference between full vault behavior and conservative single-file behavior.

```text
{
  "rootUri": "file:///Users/alex/MyVault"
}
```

## Practical check

Verify the boundary with the same Markdown file in two contexts: inside a detected vault, then as a loose file outside any marked root. In the vault, note completion and cross-file references can use indexed files. Outside the vault, Flavor Grenade should stay cautious because there is no safe vault map.

Single-file mode is not automatically a broken install. It is the correct fallback when the client has not provided enough workspace context.
