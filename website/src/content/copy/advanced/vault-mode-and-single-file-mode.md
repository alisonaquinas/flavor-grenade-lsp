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

Vault mode starts when Flavor Grenade finds `.obsidian/`, `.mdfignore`, or `.mdfattributes` at the opened root or a safe ancestor. It can then scan the vault or project and build the map used by completion, diagnostics, references, and rename.

Use vault mode for normal Obsidian work. It gives the tool enough context to understand notes, inbound links, attachments, tags, and headings across files.

```text
MyVault/
  .obsidian/
  Notes/
    Home.md
```

Configured Markdown projects use `.mdfattributes` for flavor rules and `.mdfignore` for visibility rules. Legacy `.flavor-grenade.*` files and `.editorconfig` directives are not flavor assignment markers.

## Single-file mode

Single-file mode is the fallback when no vault marker or usable project root is available. Flavor Grenade can still parse the open file and resolve a Markdown flavor. If syntax and context do not identify a stronger flavor, the fallback is CommonMark.

That quiet behavior is intentional. A loose Markdown file may belong to another tool or to a vault that was not opened, so broad diagnostics and cross-file edits would be risky.

## Direct clients

A direct LSP client should send a file `rootUri` or workspace folder for the intended vault root.

If the client sends no usable file root, Flavor Grenade cannot discover vault markers or safely confine paths. That is the difference between full vault behavior and conservative single-file behavior.

```json
{
  "rootUri": "file:///Users/alex/MyVault",
  "workspaceFolders": [
    { "uri": "file:///Users/alex/MyVault", "name": "MyVault" }
  ]
}
```

## Practical check

Verify the boundary with the same Markdown file in two contexts: inside a detected vault, then as a loose file outside any marked root. In the vault, note completion and cross-file references can use indexed files. Outside the vault, Flavor Grenade should stay cautious because there is no safe vault map.

Single-file mode is not automatically a broken install. It is the correct fallback when the client has not provided enough workspace context, and CommonMark is the expected fallback for generic Markdown.
