---
title: Wiki-Link Resolution Requirements
tags:
  - requirements/wiki-link-resolution
aliases:
  - Link Requirements
  - FG Link Resolution
---

# Wiki-Link Resolution Requirements

> [!NOTE] Scope
> These requirements govern how `flavor-grenade-lsp` resolves `[[wikilink]]` and `[text](url)` inline link syntax — including style-mode binding, alias expansion, single-file mode restrictions, non-markdown URL skipping, and ignore-glob enforcement. They do not cover embed (`![[...]]`) syntax, which is specified in [[embed-resolution]]. Diagnostic codes referenced here (FG001, FG002) are defined in [[diagnostics]].

---

**Tag:** Link.Wiki.StyleBinding
**User Req:** User.Navigate.JumpToNote, User.Author.CompleteWikiLink, User.Author.FollowLinkStyle, User.Config.CustomiseLinkStyle
**Gist:** Completion items and rename edits must conform to the wiki link style that is active in the current configuration.
**Ambition:** Obsidian vaults commit to one of three link-text conventions (file-stem, title-slug, file-path-stem). LSP edits that violate that convention corrupt the vault's internal consistency and break Obsidian's own link resolution. Enforcing style at the LSP layer prevents silent divergence between what the server proposes and what Obsidian accepts.
**Scale:** Percentage of completion items and rename `WorkspaceEdit` text edits in a given test session whose link text conforms to the active `wiki.style` setting. Scope: all wiki-link positions across all documents in the test vault.
**Meter:**

1. Configure a test vault with at least 10 documents whose titles differ from their file stems (e.g., `my-note.md` with title `My Note`).
2. Set `wiki.style` to each of the three values (`file-stem`, `title-slug`, `file-path-stem`) in turn.
3. For each style, trigger completion at a `[[` position and collect all returned `CompletionItem.insertText` values.
4. For each style, perform a rename on a document title and collect all `newText` values from the returned `WorkspaceEdit`.
5. Validate each collected string against the expected format for the active style using the style-normalisation function defined in [[design/domain-layer]].
6. Compute: (conforming items / total items) × 100.
**Fail:** Any single non-conforming item (i.e., < 100%).
**Goal:** 100% of items conform to the active style.
**Stakeholders:** Obsidian vault authors, plugin developers integrating flavor-grenade-lsp, LSP client maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/wiki-links]], [[design/api-layer#completion-handler]], [[design/domain-layer#wiki-style]].

---

**Tag:** Link.Wiki.AliasResolution
**User Req:** User.Navigate.JumpToNote
**Gist:** YAML `aliases:` frontmatter values must be treated as valid link targets equivalent to the document's primary name.
**Ambition:** Obsidian natively allows `[[My Alias]]` to resolve to a document that declares `aliases: [My Alias]` in its frontmatter. An LSP that ignores aliases rejects valid vault links, generates false-positive FG001 diagnostics, and breaks go-to-definition for an important authoring pattern widely used in Zettelkasten workflows.
**Scale:** Percentage of `[[alias-text]]` wiki-link completions and definition requests in a test vault that correctly resolve to the document declaring that alias in its `aliases:` frontmatter property. Scope: all alias values across all indexed documents.
**Meter:**

1. Create a test vault with at least 5 documents each declaring at least 2 distinct aliases in YAML frontmatter (e.g., `aliases: [Alias A, Alias B]`).
2. Open a new document and type `[[` to trigger completion.
3. Verify that all declared aliases appear as completion candidates with the correct `detail` pointing to the owning document.
4. Accept each alias completion and invoke `textDocument/definition`; verify the response `Location` points to the document declaring that alias.
5. Verify that no FG001 diagnostic is produced for any `[[alias-text]]` link that matches a declared alias.
6. Compute: (alias links resolving correctly / total alias links tested) × 100.
**Fail:** Any alias-based `[[link]]` that fails to resolve to its declaring document, or any alias link that produces FG001.
**Goal:** 100% of alias links resolve correctly.
**Stakeholders:** Obsidian vault authors, Zettelkasten practitioners, anyone using the aliases frontmatter property.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/properties#aliases]], [[design/domain-layer#alias-index]], [[bdd/features/alias-resolution]].

---

**Tag:** Link.Resolution.ModeScope
**User Req:** User.Diagnose.SpotBrokenLinks
**Gist:** Single-file mode must suppress all cross-file link resolution and must not return cross-file results in any LSP response.
**Ambition:** Single-file mode is used when the LSP client opens an isolated document without a workspace root, such as a standalone markdown file in a text editor without vault context. Returning cross-file resolution results in this mode is both incorrect (no VaultIndex is populated) and potentially confusing or harmful (stale data from a previous session). This mirrors the requirement as specified for the marksman LSP.
**Scale:** Percentage of LSP responses (completions, definitions, diagnostics, references) issued while the server is operating in single-file mode that contain any result referencing a file other than the currently open document.
**Meter:**

1. Start the server in single-file mode by opening a single `.md` file without a workspace root (no `rootUri` or `workspaceFolders` in `initialize`).
2. Trigger `textDocument/completion` at a `[[` position.
3. Trigger `textDocument/definition` on any wiki-link token.
4. Trigger `textDocument/references` on any heading token.
5. Inspect each response; count any result item whose `uri` differs from the currently open document's URI.
6. Compute: (cross-file result items / total result items) × 100. Target must equal 0%.
**Fail:** Any cross-file result item appearing in any LSP response while server is in single-file mode.
**Goal:** 0% of responses contain cross-file results.
**Stakeholders:** Text editor users opening individual markdown files, LSP client developers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer#single-file-mode]], [[architecture/overview#mode-detection]], [[ofm-spec/index]].

---

**Tag:** Link.Inline.URLSkip
**User Req:** User.Diagnose.SpotBrokenLinks
**Gist:** Standard inline Markdown links whose URL is not a markdown file path must produce no FG001 (BrokenWikiLink) diagnostic.
**Ambition:** Vault documents commonly contain external hyperlinks in the form `[text](https://example.com)` or `[text](mailto:user@example.com)`. These are not wiki-links and their targets are not resolvable by the LSP. Emitting FG001 for them would create noise that trains users to ignore real broken-link diagnostics, undermining the diagnostic system's signal value.
**Scale:** Percentage of inline link occurrences in a test vault whose URL is not a path to a `.md` file (or configured extension) that produce zero FG001 diagnostic entries.
**Meter:**

1. Create a document containing at least 10 inline links: at least 3 `https://` URLs, 2 `mailto:` URLs, 2 `#fragment-only` links, 2 `ftp://` URLs, and 1 relative link to a `.md` file.
2. Open the document in the LSP client and wait for `textDocument/publishDiagnostics`.
3. Collect all diagnostics with code `FG001`.
4. Filter to those whose range overlaps a non-markdown inline link URL.
5. Count must be 0.
6. Verify that the single `.md` relative link (if the target does not exist) correctly produces FG001.
**Fail:** Any FG001 diagnostic produced for a non-markdown inline link URL.
**Goal:** 0% of non-markdown inline links produce FG001.
**Stakeholders:** Vault authors who mix external links with wiki-links, technical writers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[ofm-spec/wiki-links#inline-links]], [[design/api-layer#diagnostic-handler]], [[diagnostics]].

---

**Tag:** Link.Resolution.IgnoreGlob
**User Req:** User.Author.CompleteWikiLink
**Gist:** Files matching `.gitignore`-style glob patterns in the server configuration must be absent from all completion candidates and go-to-definition results.
**Ambition:** Vaults often contain generated files, template directories, or attachment folders that should be invisible to the link-resolution layer. Exposing ignored files in completions degrades user experience with irrelevant candidates and may leak private or auto-generated content into links that are then committed to version control.
**Scale:** Percentage of completion-candidate lists and definition-result sets that contain zero entries whose file path matches a currently active ignore pattern. Scope: all LSP requests issued after the ignore configuration is applied.
**Meter:**

1. Configure `ignore_patterns` in `.flavor-grenade.toml` to match a specific subdirectory (e.g., `templates/**`).
2. Place at least 5 markdown documents inside that subdirectory and at least 5 outside.
3. Trigger `textDocument/completion` at a `[[` position in an un-ignored document.
4. Inspect all returned `CompletionItem` entries; verify none reference a file inside the ignored subdirectory.
5. Create a `[[link]]` pointing to an ignored file; invoke `textDocument/definition`; verify the response is `null` or empty.
6. Compute: (requests with no ignored-file results / total requests tested) × 100.
**Fail:** Any completion candidate or definition result whose resolved file path matches an active ignore pattern.
**Goal:** 0 ignored-file entries in any completion or definition response.
**Stakeholders:** Vault authors with template folders, teams using generated documentation, developers with build-output directories inside the vault.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/domain-layer#vault-index]], [[configuration]], [[architecture/overview#indexer]].
