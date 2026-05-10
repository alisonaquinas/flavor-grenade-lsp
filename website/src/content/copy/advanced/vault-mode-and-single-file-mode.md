---
title: "Vault Mode and Single-file Mode | Flavor Grenade LSP"
description: "Compare vault-wide behavior with the conservative single-file fallback mode."
h1: "Vault Mode and Single-file Mode"
summary: "Compare vault-wide behavior with the conservative single-file fallback mode."
related: ["advancedConfigurationModel","conceptVaultIndex","advancedDirectLspIntegration"]
---

# Vault Mode and Single-file Mode

Compare vault-wide behavior with the conservative single-file fallback mode.

## Vault mode

Vault mode scans a detected `.obsidian/` or `.flavor-grenade.toml` root and builds the graph used by completions, diagnostics, references, and rename.

Use vault mode for normal Obsidian work. It gives the server enough context to understand document identity, inbound links, attachments, tags, and headings across files instead of treating one note as an island.

```text
MyVault/
  .obsidian/
  Notes/
    Home.md
```

## Single-file mode

Single-file mode skips recursive scanning when no vault marker is available. Wiki-link note-name completion is unavailable because no vault index graph is built.

This fallback is intentionally quiet. A loose Markdown file may use syntax from another editor or belong to a vault that was not opened, so the server should avoid broad diagnostics or cross-file rename edits.

## Direct clients

A direct LSP client should send a `rootUri` or workspace folder for the intended vault root.

If the client sends no usable file root, the server cannot discover vault markers. That is the difference between a direct client getting vault-wide behavior and only getting conservative single-file behavior.

```text
{
  "rootUri": "file:///Users/alex/MyVault"
}
```

## Practical check

Verify the mode boundary with the same Markdown file in two contexts: first inside a detected vault, then as a loose file outside any marked root. In the vault, note completion and cross-file references can use indexed files. Outside the vault, the server should stay conservative because there is no safe graph for vault-wide answers.

This distinction matters for documentation tone. Single-file mode is not a broken install by itself; it is the correct fallback when the client has not provided enough workspace context. The article should help users decide whether they need to reopen the vault root, add an explicit marker, or accept narrow behavior for a standalone note.
