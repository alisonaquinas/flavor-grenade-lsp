---
title: Vault Setup User Requirements
tags:
  - requirements/user/vault-setup
aliases:
  - Vault Setup
---

# Vault Setup User Requirements

> [!NOTE] Scope
> These user requirements cover how vault authors expect the server to discover and work with their vault without manual configuration. Implementation details are in [[workspace]].

---

**Tag:** User.Vault.AutoDetectVault
**Gist:** The server automatically identifies the vault root on startup without any manual path configuration from the author.
**Ambition:** Detection is reliable for every standard Obsidian vault and for any folder containing a `.flavor-grenade.toml` file, so no author ever needs to specify a vault path explicitly.
**Scale:** Percentage of vault-root detection attempts on a representative set of standard Obsidian vaults and custom-config-file vaults that succeed without manual configuration.
**Meter:** Integration test suite: `bun test tests/integration/workspace/` — initialises the server against a set of test vaults (standard `.obsidian/` present, `.flavor-grenade.toml` present, both present, neither present) and checks that the correct vault root is reported in each case.
**Fail:** Any standard Obsidian vault or `.flavor-grenade.toml`-marked folder for which the server fails to detect the vault root automatically.
**Goal:** Have the server automatically find and use the vault root
**Need:** A vault author opens their Obsidian vault folder in their editor and expects the language server to automatically recognise the vault root without any manual configuration. They expect detection to work for standard Obsidian vaults and for folders marked with the server's own configuration file, with no need to specify the vault path explicitly.
**Maps to:** Workspace.VaultDetection.Primary, Workspace.VaultDetection.Fallback

---

**Tag:** User.Vault.WorkAcrossEntireVault
**Gist:** All LSP features operate across every note in the vault, with the index kept current as files are created, edited, or deleted.
**Ambition:** No feature ever silently falls back to stale data — the vault index is always complete and up-to-date so that completion, link resolution, and find-references return results consistent with the vault's current state.
**Scale:** Percentage of LSP feature requests (completion, definition, references, diagnostics) that return results consistent with the current vault state within 1000 ms after a file creation, edit, or deletion event.
**Meter:** Integration test suite: `bun test tests/integration/workspace/` — creates, edits, and deletes notes in a test vault while issuing feature requests, and checks that each response reflects the post-change vault state within the latency threshold.
**Fail:** Any feature request that returns stale results more than 1000 ms after a vault change, or any note not included in the index after startup completes.
**Goal:** Have links resolve across all notes in the vault
**Need:** A vault author working within a single vault expects all features — link resolution, completion, find-references — to work across every note in that vault. They expect notes to be indexed automatically on startup, and for the index to stay up to date as they create, edit, or delete notes, so that no feature silently falls back to stale data.
**Maps to:** Workspace.FileExtension.Filter, Workspace.MultiFolder.Isolation
