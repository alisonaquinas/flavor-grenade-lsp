---
title: Verification — Workspace
tags: [test/verification, "requirements/workspace"]
aliases: [Verify Workspace]
---

# Verification — Workspace

## Purpose

This document covers scripted and agent-driven test cases that verify the four Planguage requirements governing vault discovery, file-extension filtering, and multi-root isolation in `flavor-grenade-lsp`. Each test case maps directly to a requirement tag in [[requirements/workspace]] and to one or more BDD scenarios in [[bdd/features/workspace]] and [[bdd/features/vault-detection]]. Test cases must be executed in Phase 1 after the VaultDetector and VaultIndex are implemented; they form the acceptance gate before any LSP feature work proceeds.

## Requirements Covered

| Planguage Tag | Gist | Phase |
|---|---|---|
| `Workspace.VaultDetection.Primary` | Directories with `.obsidian/` are automatically detected and indexed | Phase 1 |
| `Workspace.VaultDetection.Fallback` | Directories with `.flavor-grenade.toml` (no `.obsidian/`) are detected as vault roots | Phase 1 |
| `Workspace.FileExtension.Filter` | Only configured-extension files enter VaultIndex; all others are silently ignored | Phase 1 |
| `Workspace.MultiFolder.Isolation` | Link resolution never crosses vault root boundaries in a multi-root session | Phase 1 |

## Test Cases

### TC-VER-WS-001 — Workspace.VaultDetection.Primary

**Planguage Tag:** `Workspace.VaultDetection.Primary`
**Gist:** Any directory containing a `.obsidian/` subdirectory must be automatically identified as a vault root and indexed without requiring additional user configuration.
**Type:** Both
**BDD Reference:** [[bdd/features/workspace]] — `Vault detected via .obsidian/ directory`; [[bdd/features/vault-detection]] — `.obsidian/ found — vault mode active with full features`
**Phase:** Phase 1

**Setup:** Create 5 directories each containing `.obsidian/` and at least 3 `.md` files. Create one additional directory without `.obsidian/` containing `.md` files. Start the server with a workspace root containing all 6 directories. Wait for `$/progress` to signal indexing complete.

**Scripted steps:**
```gherkin
Given a workspace root containing 5 subdirectories each with a ".obsidian/" directory and 3 markdown files
And one additional subdirectory containing only markdown files with no ".obsidian/" present
When the LSP server initializes with rootUri pointing to the workspace root
And the server completes initial indexing signalled by "$/progress" done
Then for each of the 5 ".obsidian/"-containing directories the VaultDetector reports vaultMode = "obsidian"
And textDocument/completion from a document in each of those 5 directories returns vault-aware candidates
And the directory without ".obsidian/" is not reported as a vault root
And the capability "flavorGrenade.crossFileLinks" is active for all 5 detected vaults
```

**Agent-driven steps:**
1. Create temporary directory tree with 5 vault subdirectories (`vault-01` through `vault-05`), each containing `.obsidian/` and three `.md` files (`a.md`, `b.md`, `c.md`).
2. Create a sixth directory `plain-dir/` with three `.md` files and no `.obsidian/`.
3. Start the LSP server with the workspace root pointing to the parent of all six directories.
4. Monitor `$/progress` notifications and wait until indexing is reported complete.
5. For each of `vault-01` through `vault-05`: open `a.md`, trigger `textDocument/completion` at a `[[` position, and confirm vault-scoped candidates appear.
6. Confirm `plain-dir` is absent from any vault-root list returned by the server.
7. Verify detection rate: (5 detected / 5 `.obsidian/` directories) = 100%.

**Pass criterion:** 100% of directories containing `.obsidian/` are detected and indexed as vault roots; the directory without `.obsidian/` is not detected.
**Fail criterion:** Any directory containing `.obsidian/` that is not detected and indexed as a vault root; any completion call from those directories returning non-vault results.

---

### TC-VER-WS-002 — Workspace.VaultDetection.Fallback

**Planguage Tag:** `Workspace.VaultDetection.Fallback`
**Gist:** A directory containing `.flavor-grenade.toml` but no `.obsidian/` must be detected as a vault root; when both markers coexist, `.obsidian/` takes precedence.
**Type:** Both
**BDD Reference:** [[bdd/features/workspace]] — `Vault detected via .flavor-grenade.toml when no .obsidian/ present`; [[bdd/features/vault-detection]] — `.flavor-grenade.toml found — vault mode active with full features` and `Both .obsidian/ and .flavor-grenade.toml present — obsidian takes precedence`
**Phase:** Phase 1

**Setup:** Create 3 directories each containing `.flavor-grenade.toml` and at least 3 `.md` files, with no `.obsidian/` present. Create a fourth directory containing both `.obsidian/` and `.flavor-grenade.toml`. Start the server with all 4 directories as workspace roots.

**Scripted steps:**
```gherkin
Given 3 directories each containing ".flavor-grenade.toml" and 3 markdown files with no ".obsidian/" present
And 1 directory containing both ".obsidian/" and ".flavor-grenade.toml" and 3 markdown files
When the LSP server initializes with a workspace root containing all 4 directories
And the server completes initial indexing
Then the VaultDetector reports vaultMode = "flavor-grenade" for the 3 toml-only directories
And cross-file features are active in all 3 toml-only directories
And the VaultDetector reports vaultMode = "obsidian" for the dual-marker directory
And the VaultDetector preference log records "obsidian marker takes precedence" for the dual-marker directory
```

**Agent-driven steps:**
1. Create `fg-01/`, `fg-02/`, `fg-03/`, each with `.flavor-grenade.toml` (minimal valid TOML: `[vault]`) and three `.md` files. Confirm no `.obsidian/` exists in any.
2. Create `dual/` containing both `.obsidian/` (as a directory) and `.flavor-grenade.toml`, plus three `.md` files.
3. Start the LSP server. Wait for indexing to complete.
4. Verify `fg-01`, `fg-02`, `fg-03` each appear in the server's vault-root list with mode `flavor-grenade`.
5. Verify `dual` appears in the vault-root list with mode `obsidian`, not `flavor-grenade`.
6. Check the server log for the precedence message on `dual`.
7. Compute: (3 toml-only detected / 3 toml-only directories) = 100%.

**Pass criterion:** 100% of `.flavor-grenade.toml`-only directories detected as vault roots; the dual-marker directory is reported as `obsidian` mode.
**Fail criterion:** Any `.flavor-grenade.toml`-only directory not detected; the dual-marker directory reported as `flavor-grenade` instead of `obsidian`.

---

### TC-VER-WS-003 — Workspace.FileExtension.Filter

**Planguage Tag:** `Workspace.FileExtension.Filter`
**Gist:** Only files whose extension appears in the configured extensions list (default `["md"]`) must be included in the VaultIndex; all other files are silently ignored with no warnings emitted.
**Type:** Both
**BDD Reference:** [[bdd/features/workspace]] — `Non-.md files are ignored with default extension filter`; [[bdd/features/vault-detection]] — `.flavor-grenade.toml configures custom extension list`
**Phase:** Phase 1

**Setup:** Create a vault containing exactly 10 `.md` files, 3 `.png` files, 3 `.pdf` files, 2 `.txt` files, and 2 `.mdx` files. Start the server with default extension configuration (`["md"]`). Then reconfigure to `["md", "mdx"]` and restart.

**Scripted steps:**
```gherkin
Given a vault with 10 ".md" files, 3 ".png" files, 3 ".pdf" files, 2 ".txt" files, and 2 ".mdx" files
And the server is configured with the default extension list ["md"]
When the LSP server initializes and indexes the vault
Then the document index contains exactly 10 entries all with ".md" extension
And the document index does NOT contain any entry with extension ".png", ".pdf", ".txt", or ".mdx"
And the server log contains no Warning or Error messages referencing ".png", ".pdf", ".txt", or ".mdx" files
When the extension configuration is changed to ["md", "mdx"] and the server restarts
Then the document index contains 10 ".md" entries and 2 ".mdx" entries
And the document index still does NOT contain any ".txt", ".png", or ".pdf" entry
```

**Agent-driven steps:**
1. Create a vault directory with the 20-file mix described in the setup.
2. Start the server with default config (no explicit extension override, so `["md"]` applies).
3. Query the server for all indexed document URIs; assert every URI ends in `.md`.
4. Grep the server log for any `WARN` or `ERROR` entries mentioning `.png`, `.pdf`, `.txt`, or `.mdx`; assert zero matches.
5. Write a `.flavor-grenade.toml` with `[vault]\nextensions = [".md", ".mdx"]` and restart the server.
6. Re-query indexed URIs; assert `.md` and `.mdx` files appear, `.txt` files do not.
7. Compute: (20 non-configured-extension files with zero index entries and zero warnings / 20) = 100% for step 3 run.

**Pass criterion:** 100% of non-configured-extension files produce zero index entries and zero Warning/Error log messages; after reconfiguration, `.mdx` files are correctly included.
**Fail criterion:** Any non-configured-extension file appearing in VaultIndex; any Warning or Error log message emitted for a non-configured-extension file.

---

### TC-VER-WS-004 — Workspace.MultiFolder.Isolation

**Planguage Tag:** `Workspace.MultiFolder.Isolation`
**Gist:** When the server manages multiple vault roots simultaneously, link resolution must not cross root boundaries.
**Type:** Both
**BDD Reference:** [[bdd/features/workspace]] — `Multi-folder workspace keeps folders isolated`
**Phase:** Phase 1

**Setup:** Configure the server with two vault roots (`vault-a/` and `vault-b/`), each containing at least 5 documents. Ensure vault B contains a document with the same file stem as at least one document in vault A (e.g., both contain `index.md`).

**Scripted steps:**
```gherkin
Given a multi-folder workspace with two roots:
  | root      | marker     |
  | vault-a/  | .obsidian/ |
  | vault-b/  | .obsidian/ |
And vault-a contains "index.md", "alpha.md", "beta.md", "gamma.md", "delta.md"
And vault-b contains "index.md", "one.md", "two.md", "three.md", "four.md"
When the LSP server initializes with both workspace folders
Then vault-a and vault-b maintain separate document indices
When textDocument/completion is triggered at a "[[" position in vault-a/alpha.md
Then no completion candidates reference any document in vault-b
When textDocument/definition is called on a wiki-link "[[index]]" in vault-a/alpha.md
Then the definition result points to "vault-a/index.md" not "vault-b/index.md"
When textDocument/references is called from vault-a/index.md
Then zero results reference any document under vault-b
And vault-a diagnostics are not influenced by the presence or absence of documents in vault-b
```

**Agent-driven steps:**
1. Create `vault-a/` with `.obsidian/` and files: `index.md`, `alpha.md`, `beta.md`, `gamma.md`, `delta.md`.
2. Create `vault-b/` with `.obsidian/` and files: `index.md`, `one.md`, `two.md`, `three.md`, `four.md`. Place a `[[alpha]]` link in `vault-b/one.md` to confirm cross-root link detection is possible.
3. Start the server with both vaults as workspace folders.
4. Open `vault-a/alpha.md`; trigger `textDocument/completion` at `[[`; confirm all candidates are scoped to vault-a.
5. Add `[[index]]` to `vault-a/alpha.md`; call `textDocument/definition`; verify result URI contains `vault-a/`, not `vault-b/`.
6. Call `textDocument/references` from `vault-a/index.md`; verify every result URI is within `vault-a/`.
7. Delete `vault-b/index.md`; verify vault-a diagnostics do not change.
8. Compute: (cross-root-isolated operations / total operations) = 100%.

**Pass criterion:** 0 cross-root resolution results; 100% of completion, definition, and reference operations are scoped to the originating vault root.
**Fail criterion:** Any completion candidate, definition result, or references result that crosses vault root boundaries.
