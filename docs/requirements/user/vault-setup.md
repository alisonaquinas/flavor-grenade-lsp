---
title: Vault Setup User Requirements
tags:
  - requirements/user/vault-setup
---

# Vault Setup User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors expect the server to discover and work with their vault without manual configuration. Implementation details are in [[workspace]].

---

**Tag:** User.Vault.AutoDetectVault
**Goal:** Have the server automatically find and use the vault root
**Need:** A vault author opens their Obsidian vault folder in their editor and expects the language server to automatically recognise the vault root without any manual configuration. They expect detection to work for standard Obsidian vaults and for folders marked with the server's own configuration file, with no need to specify the vault path explicitly.
**Maps to:** Workspace.VaultDetection.Primary, Workspace.VaultDetection.Fallback

---

**Tag:** User.Vault.WorkAcrossEntireVault
**Goal:** Have links resolve across all notes in the vault
**Need:** A vault author working within a single vault expects all features — link resolution, completion, find-references — to work across every note in that vault. They expect notes to be indexed automatically on startup, and for the index to stay up to date as they create, edit, or delete notes, so that no feature silently falls back to stale data.
**Maps to:** Workspace.FileExtension.Filter, Workspace.MultiFolder.Isolation
