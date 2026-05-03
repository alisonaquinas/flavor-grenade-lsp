---
title: OFMarkdown Language Mode Requirements
tags:
  - requirements/ofmarkdown-language-mode
aliases:
  - OFMarkdown Requirements
  - VS Code Language Mode Requirements
---

# OFMarkdown Language Mode Requirements

> [!NOTE] Scope
> These requirements govern the VS Code extension behavior that assigns the `ofmarkdown` language id to open documents that Flavor Grenade recognizes as Obsidian Flavored Markdown vault documents. Server parsing, diagnostics, completion, and navigation semantics are governed by the existing OFM feature requirements.

---

**Tag:** Extension.LanguageMode.Contribution
**User Req:** User.Extension.RecognizeOFMarkdown
**Gist:** The VS Code extension must contribute a language id `ofmarkdown` with aliases `OFMarkdown` and `Obsidian Flavored Markdown` without globally associating `.md` files to that language.
**Ambition:** OFMarkdown needs a first-class VS Code identity so authors can target language-specific settings and future snippets while preserving normal Markdown behavior for non-vault files. The language contribution must therefore create a selectable language mode but not hijack every Markdown file by extension.
**Scale:** Percentage of extension manifest inspections in which `contributes.languages` includes exactly one `ofmarkdown` language contribution with the required aliases and no `.md` extension binding.
**Meter:**

1. Inspect `extension/package.json`.
2. Verify `contributes.languages` contains an entry with `id = "ofmarkdown"`.
3. Verify the entry has aliases `OFMarkdown` and `Obsidian Flavored Markdown`.
4. Verify the entry does not list `.md` in `extensions`.
5. Verify the entry does not use `filenames` or `firstLine` patterns that would globally claim generic Markdown.
6. Compute: (manifest checks passing / total checks) × 100.
**Fail:** Any global `.md` association to `ofmarkdown`, missing language id, or missing alias.
**Goal:** 100% manifest conformance.
**Stakeholders:** Vault authors, VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR016-ofmarkdown-language-mode]], VS Code Extension API contribution point documentation.

---

**Tag:** Extension.LanguageMode.DynamicAssignment
**User Req:** User.Extension.RecognizeOFMarkdown
**Gist:** When a file-backed Markdown document is detected as belonging to an Obsidian vault or as present in the Flavor Grenade index, the extension must set that document's VS Code language id to `ofmarkdown`.
**Ambition:** Authors should see OFMarkdown as the active mode only when the document is semantically an OFM vault document. Detection must be automatic and should converge without the author manually changing the language picker.
**Scale:** Percentage of qualifying open documents whose `languageId` becomes `ofmarkdown` within 1000 ms after vault/index detection completes.
**Meter:**

1. Open a workspace folder containing `.obsidian/` and a Markdown file `notes/welcome.md`.
2. Open `notes/welcome.md` in VS Code.
3. Wait for extension activation and vault/index detection.
4. Verify the active document's `languageId` is `ofmarkdown`.
5. Repeat with a folder that has `.flavor-grenade.toml` and no `.obsidian/`; verify promotion after the server reports the document as indexed.
6. Compute: (qualifying documents promoted / total qualifying documents tested) × 100.
**Fail:** Any qualifying open Markdown document remains `markdown` after detection settles.
**Goal:** 100% of qualifying open documents promoted within 1000 ms of detection completion.
**Stakeholders:** Vault authors, VS Code users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-language-mode]], [[requirements/workspace]], [[adr/ADR016-ofmarkdown-language-mode]].

---

**Tag:** Extension.LanguageMode.NonVaultIsolation
**User Req:** User.Extension.PreserveMarkdown
**Gist:** Markdown documents that are not in an Obsidian vault and are not in the Flavor Grenade index must remain in VS Code's built-in `markdown` language mode.
**Ambition:** Flavor Grenade should be precise, not invasive. Users frequently open README files, changelogs, and generic Markdown documents in the same VS Code window; those files should keep the normal Markdown ecosystem unless Flavor Grenade has evidence that they belong to an OFM vault.
**Scale:** Percentage of non-qualifying Markdown documents whose language id remains `markdown` after extension activation and server readiness.
**Meter:**

1. Open a workspace folder with Markdown files but no `.obsidian/`, no `.flavor-grenade.toml`, and no server index membership.
2. Open at least 5 `.md` files.
3. Wait for extension activation and server readiness.
4. Verify each document's `languageId` remains `markdown`.
5. Compute: (non-qualifying documents remaining markdown / total non-qualifying documents tested) × 100.
**Fail:** Any non-qualifying Markdown document is changed to `ofmarkdown`.
**Goal:** 100% of non-qualifying Markdown documents remain `markdown`.
**Stakeholders:** VS Code users, non-Obsidian Markdown authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR016-ofmarkdown-language-mode]], [[features/ofmarkdown-language-mode]].

---

**Tag:** Extension.LanguageMode.UserOverrideSafety
**User Req:** User.Extension.PreserveManualMode
**Gist:** The extension must not change the language id of documents whose current language id is neither `markdown` nor `ofmarkdown`.
**Ambition:** Users may intentionally set a Markdown-looking file to another language mode such as `mdx`, `plaintext`, or a custom notebook language. Flavor Grenade must not fight that explicit choice.
**Scale:** Percentage of open documents with non-`markdown` and non-`ofmarkdown` language ids that remain unchanged after detection passes.
**Meter:**

1. Open a `.md` file inside an Obsidian vault.
2. Manually change its VS Code language mode to `plaintext`.
3. Trigger detection by restarting the extension or running the language mode refresh command.
4. Verify the document remains `plaintext`.
5. Repeat with at least one custom language id if available.
6. Compute: (manual-language documents preserved / total manual-language documents tested) × 100.
**Fail:** Any non-`markdown` or non-`ofmarkdown` document is reassigned by the extension.
**Goal:** 100% manual language selections preserved.
**Stakeholders:** Advanced VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR016-ofmarkdown-language-mode]], VS Code API documentation for `setTextDocumentLanguage`.

---

**Tag:** Extension.LanguageMode.LoopSafety
**User Req:** User.Extension.StableModeSwitch
**Gist:** Language-mode assignment must not create activation, restart, didOpen/didClose, or status notification loops.
**Ambition:** VS Code documents are closed and reopened internally when `setTextDocumentLanguage` changes the language id. Without explicit guards, a correct promotion could become an infinite loop or repeatedly restart the LanguageClient. The user-visible result must be stable: one promotion, no flicker, no repeated server process churn.
**Scale:** Number of language-mode assignment calls and LanguageClient restarts per qualifying document open.
**Meter:**

1. Instrument the extension test harness to count calls to `setTextDocumentLanguage`, LanguageClient starts, and LanguageClient restarts.
2. Open one qualifying Markdown document in a vault.
3. Wait until the document language id is `ofmarkdown` and the LanguageClient is running.
4. Verify `setTextDocumentLanguage` was called at most once for that document.
5. Verify the LanguageClient did not restart due solely to the language id transition.
6. Repeat across at least 5 documents.
**Fail:** More than one language-mode assignment for the same settled document, or any restart loop caused by assignment.
**Goal:** At most one assignment per qualifying document open; zero language-mode-induced restart loops.
**Stakeholders:** Vault authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR016-ofmarkdown-language-mode]], VS Code API documentation for `setTextDocumentLanguage`.

---

**Tag:** Extension.LanguageMode.MarkdownParity
**User Req:** User.Extension.PreserveMarkdownEditing
**Gist:** After a document is promoted to `ofmarkdown`, baseline Markdown editing behavior and highlighting must remain available.
**Ambition:** The new language mode should add identity and OFM targeting, not make the editor feel worse. Promotion must preserve Markdown-style highlighting, comments, bracket behavior, and LSP features while allowing OFM-specific semantic tokens to layer on top.
**Scale:** Percentage of baseline Markdown editor affordances that remain available in `ofmarkdown` mode across a smoke test document.
**Meter:**

1. Open a representative OFM document and allow promotion to `ofmarkdown`.
2. Verify Markdown headings, lists, fenced code blocks, links, and frontmatter still receive grammar highlighting.
3. Verify comment toggling and bracket auto-closing behave according to the contributed language configuration.
4. Verify OFM semantic tokens still apply to wiki-links, tags, embeds, callouts, and block anchors.
5. Compute: (affordances preserved / total affordances tested) × 100.
**Fail:** Promotion removes baseline Markdown highlighting or disables existing LSP features.
**Goal:** 100% of baseline Markdown smoke affordances preserved.
**Stakeholders:** Vault authors, VS Code users.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-language-mode]], [[features/semantic-tokens]], VS Code syntax highlight guide.
