---
title: Workspace and Vault Detection Requirements
tags:
  - requirements/workspace
aliases:
  - Workspace Requirements
  - FG Workspace
---

# Workspace and Vault Detection Requirements

> [!NOTE] Scope
> These requirements govern how the server discovers vault roots, filters the file set that enters the index, and enforces isolation between distinct vault roots in a multi-root workspace. Configuration of detection behaviour (extensions, ignore patterns) is governed by [[configuration]]. The VaultIndex implementation details are in [[design/domain-layer#vault-index]]. Multi-root workspace LSP protocol handling is in [[design/api-layer#workspace-handler]].

---

**Tag:** Workspace.VaultDetection.Primary
**Gist:** Any directory that contains a `.obsidian/` subdirectory must be automatically identified as a vault root and indexed by the server without requiring additional user configuration.
**Ambition:** `.obsidian/` is the canonical marker of an Obsidian vault — it is created automatically by Obsidian on first open and is universally present in every vault managed by Obsidian. Automatic detection without configuration is the zero-friction path: an author opens their vault directory in an LSP-capable editor and the server begins indexing immediately. Requiring manual declaration of vault roots creates an unnecessary setup barrier and introduces a class of user error (forgetting to declare the vault, declaring the wrong path) that automatic detection eliminates entirely.
**Scale:** Percentage of directories containing a `.obsidian/` subdirectory that are correctly identified as vault roots and indexed by the server when they appear as workspace folders in the `initialize` request or as subdirectories of the workspace root. Scope: at least 5 distinct vault directories per test run.
**Meter:**
1. Create 5 directories, each containing a `.obsidian/` subdirectory and at least 3 markdown documents.
2. Start the server with a workspace root that contains all 5 directories.
3. Wait for the server to complete initial indexing (monitor `$/progress` or equivalent).
4. For each directory, verify the server has indexed its documents by issuing `textDocument/completion` from a document in that directory and confirming vault-aware results.
5. Create one additional directory without `.obsidian/` containing markdown documents; verify it is not detected as a vault root.
6. Compute: (directories with `.obsidian/` correctly detected / total directories with `.obsidian/`) × 100.
**Fail:** Any directory containing `.obsidian/` that is not detected and indexed as a vault root.
**Goal:** 100% of `.obsidian/`-containing directories detected.
**Stakeholders:** All vault authors, editor plugin integrators, Obsidian users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/domain-layer#vault-detection]], [[architecture/overview#indexer]], Obsidian documentation on vault structure.

---

**Tag:** Workspace.VaultDetection.Fallback
**Gist:** A directory containing a `.flavor-grenade.toml` configuration file must be detected as a vault root when no `.obsidian/` directory is present, enabling use of the server in non-Obsidian markdown environments.
**Ambition:** The server is designed for Obsidian-Flavored Markdown but is not exclusively tied to Obsidian the application. Developers, technical writers, and teams using OFM syntax in other editors or build pipelines need a way to declare a vault root without creating an Obsidian application directory. `.flavor-grenade.toml` serves as the escape hatch: a lightweight, explicit declaration that activates vault detection for non-Obsidian contexts. The fallback ordering (Obsidian-first) preserves backwards compatibility and prevents the presence of a `.flavor-grenade.toml` inside an Obsidian vault from interfering with primary detection.
**Scale:** Percentage of directories containing `.flavor-grenade.toml` but no `.obsidian/` subdirectory that are correctly detected as vault roots and indexed by the server.
**Meter:**
1. Create 3 directories: each contains `.flavor-grenade.toml` and at least 3 markdown documents, and none contains `.obsidian/`.
2. Create 1 additional directory containing both `.obsidian/` and `.flavor-grenade.toml` to verify primary detection takes precedence.
3. Start the server with a workspace root containing all 4 directories.
4. Verify the 3 fallback-detection directories are indexed as vault roots.
5. Verify the dual-presence directory is indexed via primary detection (not dependent on `.flavor-grenade.toml`).
6. Compute: (directories with `.flavor-grenade.toml`-only correctly detected / total such directories) × 100.
**Fail:** Any directory containing `.flavor-grenade.toml` (without `.obsidian/`) that is not detected as a vault root.
**Goal:** 100% of `.flavor-grenade.toml`-only directories detected.
**Stakeholders:** Non-Obsidian OFM users, developers, technical writing teams, CI pipeline operators.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[configuration]], [[design/domain-layer#vault-detection]], [[architecture/overview#indexer]].

---

**Tag:** Workspace.FileExtension.Filter
**Gist:** Only files whose extension appears in the configured extensions list (default: `["md"]`) must be included in the VaultIndex; files with other extensions must be silently ignored without emitting errors or warnings.
**Ambition:** Vault directories contain many non-markdown files: images, PDFs, attachments, configuration files, and generated content. Including all files in the index would degrade index build performance, pollute completion candidates, and create false-positive diagnostics for file types the server has no semantics for. Silent filtering (rather than noisy skipping) respects the author's vault layout without imposing operational overhead on every non-markdown file encountered. Configurability of the extension list accommodates vaults that use `.mdx`, `.markdown`, or custom extensions.
**Scale:** Percentage of files encountered during vault indexing with extensions not in the configured list that produce zero index entries, zero diagnostics, and zero log messages at Warning level or above.
**Meter:**
1. Create a vault directory with at least 20 files: 10 `.md` files, 3 `.png` files, 3 `.pdf` files, 2 `.txt` files, and 2 `.mdx` files.
2. Start the server with the default extension configuration (`["md"]`).
3. After indexing, query VaultIndex for all indexed document URIs.
4. Verify only `.md` files appear in the index.
5. Verify the server log contains no Warning or Error messages related to `.png`, `.pdf`, `.txt`, or `.mdx` files.
6. Reconfigure extensions to `["md", "mdx"]`; restart; verify `.mdx` files are now indexed and `.txt` files are still excluded.
7. Compute: (non-configured-extension files producing zero index entries and zero warnings / total non-configured-extension files) × 100.
**Fail:** Any file with a non-configured extension appearing in VaultIndex, or any Warning/Error log message emitted for a non-configured-extension file.
**Goal:** 100% of non-configured-extension files silently ignored.
**Stakeholders:** Vault authors with mixed-content directories, attachment-heavy vaults, teams with generated content.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[configuration]], [[design/domain-layer#vault-index]], [[architecture/overview#indexer]].

---

**Tag:** Workspace.MultiFolder.Isolation
**Gist:** When the server manages multiple vault roots simultaneously, link resolution must not cross root boundaries — a wiki-link in vault A must never resolve to a document in vault B.
**Ambition:** Multi-folder workspaces in editors like VS Code often contain multiple unrelated projects. If the LSP resolves links across vault roots, a common filename in vault B may shadow a document in vault A, producing incorrect go-to-definition results. Worse, completion candidates from vault B may appear when authoring in vault A, silently polluting the document with cross-vault links that are unresolvable in Obsidian. Root isolation is a hard correctness boundary that preserves the semantic integrity of each vault as an independent unit.
**Scale:** Percentage of link resolution operations (completion, definition, references, diagnostics) performed while the cursor document belongs to vault A that return zero results referencing documents in vault B (or any other co-managed vault root). Scope: at least 2 vault roots co-managed in a single server session.
**Meter:**
1. Configure the server with two distinct vault roots (A and B), each containing at least 5 documents. Ensure vault B contains a document with the same file stem as one in vault A.
2. Open a document in vault A. Trigger `textDocument/completion` at a `[[` position; verify no candidates reference documents in vault B.
3. Issue `textDocument/definition` on a wiki-link in vault A whose target exists in both A and B; verify the result points to vault A's document.
4. Issue `textDocument/references` from a document in vault A; verify zero results reference vault B documents.
5. Verify vault A diagnostics are not influenced by the presence or absence of documents in vault B.
6. Compute: (cross-root-isolated operations / total operations tested) × 100.
**Fail:** Any completion candidate, definition result, or references result that crosses vault root boundaries.
**Goal:** 0 cross-root resolution results; 100% of operations isolated to their originating vault root.
**Stakeholders:** Developers with multi-project workspaces, teams with separate vault hierarchies in a single editor window.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/domain-layer#vault-index]], [[architecture/overview#multi-root]], [[design/api-layer#workspace-handler]], LSP specification §3.6 workspaceFolders.
