---
title: Markdown Flavor Selection Requirements
tags:
  - requirements/markdown-flavor-selection
aliases:
  - Markdown Flavor Requirements
  - OFMarkdown Language Mode Requirements
  - VS Code Markdown Flavor Requirements
---

# Markdown Flavor Selection Requirements

> [!NOTE] Scope
> These requirements replace the earlier alternate `ofmarkdown` language-mode design. VS Code must keep `.md` files in the built-in `markdown` language mode and expose Markdown flavor as a separate selector. Server parsing, diagnostics, completion, and navigation semantics remain governed by the existing Markdown and OFM feature requirements.
>
> The `ofmarkdown-language-mode.md` slug is retained as a legacy backlink target. The current requirements target Markdown flavor selection, not alternate language-mode promotion.

---

## Extension.MarkdownLanguage.PreserveDefault

**Tag:** Extension.MarkdownLanguage.PreserveDefault
**User Req:** User.Extension.PreserveMarkdownLanguage
**Gist:** The VS Code extension must keep Markdown documents in VS Code's built-in `markdown` language mode instead of promoting them to an alternate language id.
**Ambition:** Users should keep the default Markdown editor ecosystem: built-in highlighting, Markdown extensions, editor settings, previews, snippets, and commands. Flavor Grenade should add flavor awareness without taking over the language picker.
**Scale:** Percentage of opened `.md` documents whose VS Code `languageId` remains `markdown` after extension activation, flavor detection, and user flavor override.
**Meter:**

1. Open a `.md` file in an Obsidian vault.
2. Wait for extension activation and flavor detection.
3. Verify the document `languageId` remains `markdown`.
4. Select each supported explicit flavor override from the required flavor set.
5. Verify the document `languageId` remains `markdown` after each override.
6. Repeat in a generic Markdown workspace and in single-file mode.
7. Compute: (documents remaining `markdown` / total `.md` documents tested) x 100.
**Fail:** Any `.md` document is reassigned to `ofmarkdown` or another custom Markdown language id by Flavor Grenade.
**Goal:** 100% of `.md` documents remain in `markdown`.
**Stakeholders:** Vault authors, VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/adr/ADR020-markdown-flavor-selection]], [[docs/features/ofmarkdown-language-mode]].

---

## Extension.MarkdownFlavor.Selector

**Tag:** Extension.MarkdownFlavor.Selector
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The extension must expose a second Markdown flavor selector near the VS Code language mode control, independent of the built-in language picker.
**Ambition:** Users need a visible way to understand and change how Flavor Grenade interprets the current Markdown document without changing the VS Code language mode. The selector should make flavor state obvious and reversible.
**Scale:** Percentage of editor contexts where a Markdown flavor selector is visible and reports the current effective flavor.
**Meter:**

1. Open a Markdown file in a workspace folder.
2. Verify a Flavor Grenade status item or equivalent selector is visible near the language mode area as VS Code allows.
3. Verify the selector label includes `Auto Detect` or one supported effective flavor.
4. Open the selector and verify choices include every required flavor listed in `Extension.MarkdownFlavor.RequiredCoverage`.
5. Select each choice and verify a second scope prompt offers `Selected file` and `All files in this directory`.
6. Verify the selector writes `.fgattributes` for the chosen scope and updates without changing the language id.
7. Compute: (selector contexts passing / total Markdown contexts tested) x 100.
**Fail:** The user must use the VS Code language picker to choose Markdown flavor, or the selector is absent for supported Markdown documents.
**Goal:** 100% selector availability for file-backed Markdown documents.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/ofmarkdown-language-mode]], [[docs/features/markdown-flavor-config-files]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/adr/ADR020-markdown-flavor-selection]].

---

## Extension.MarkdownFlavor.RequiredCoverage

**Tag:** Extension.MarkdownFlavor.RequiredCoverage
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The selector, `.fgattributes` flavor attribute, and server-facing flavor model must include every Markdown flavor researched in `docs/research/`, plus an `auto` mode.
**Ambition:** The research corpus is now product input. Users should be able to explicitly select any documented Markdown dialect without waiting for a new language id or a hidden setting.
**Scale:** Number of supported flavor ids present in the selector, `.fgattributes` parser, and client/server initialization payload.
**Meter:**

1. Inspect the flavor enum used by the selector specification.
2. Verify it contains exactly the required ids in the table below.
3. Verify user-facing labels match the table below.
4. Verify each id is accepted by `.fgattributes` `flavor=<id>`.
5. Verify the effective flavor can be propagated to the server.
6. Compute: (required flavor ids present / 14) x 100.
**Fail:** Any required flavor is missing, or an unsupported flavor is exposed as selectable.
**Goal:** 100% required flavor coverage.
**Stakeholders:** Markdown authors, vault authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/research/commonmark-and-original-markdown]], [[docs/research/github-flavored-markdown-analysis]], [[docs/research/gitlab-flavored-markdown-analysis]], [[docs/research/pandoc-markdown-deep-research-report]], [[docs/research/multimarkdown-analysis]], [[docs/research/mdx-analysis]], [[docs/research/kramdown-analysis]], [[docs/research/markdown-extra-analysis]], [[docs/research/r-markdown-analysis]], [[docs/research/reddit-markdown-analysis]], [[docs/research/stack-overflow-markdown-analysis]], [[docs/ofm-spec/index]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/adr/ADR020-markdown-flavor-selection]].

| Flavor id | Selector label | Research source |
|---|---|---|
| `auto` | Auto Detect | Workspace/vault detection requirements |
| `original` | Original Markdown | [[docs/research/commonmark-and-original-markdown]] |
| `commonmark` | CommonMark | [[docs/research/commonmark-and-original-markdown]] |
| `obsidian` | Obsidian | [[docs/ofm-spec/index]] |
| `gfm` | GitHub Flavored Markdown | [[docs/research/github-flavored-markdown-analysis]] |
| `glfm` | GitLab Flavored Markdown | [[docs/research/gitlab-flavored-markdown-analysis]] |
| `pandoc` | Pandoc Markdown | [[docs/research/pandoc-markdown-deep-research-report]] |
| `multimarkdown` | MultiMarkdown | [[docs/research/multimarkdown-analysis]] |
| `mdx` | MDX | [[docs/research/mdx-analysis]] |
| `kramdown` | kramdown | [[docs/research/kramdown-analysis]] |
| `markdown-extra` | Markdown Extra | [[docs/research/markdown-extra-analysis]] |
| `r-markdown` | R Markdown | [[docs/research/r-markdown-analysis]] |
| `reddit` | Reddit Markdown | [[docs/research/reddit-markdown-analysis]] |
| `stack-overflow` | Stack Overflow Markdown | [[docs/research/stack-overflow-markdown-analysis]] |

---

## Extension.MarkdownFlavor.DialectProfiles

**Tag:** Extension.MarkdownFlavor.DialectProfiles
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Every supported explicit flavor must have a documented dialect profile derived from its research note or normative OFM specification source.
**Ambition:** A flavor must be more than a selector label. Each supported flavor needs a stable profile of core syntax, extensions, disabled constructs, and host-specific behavior so diagnostics and completions can become precise over time.
**Scale:** Percentage of supported explicit flavors with a documented profile and source trace.
**Meter:**

1. Inspect the Markdown flavor profile registry or requirements table.
2. For each explicit flavor id, verify a profile names its research source.
3. Verify the profile distinguishes core Markdown, extension syntax, and host-specific behavior.
4. Verify platform flavors such as MDX, R Markdown, Reddit, and Stack Overflow are described without taking over non-`markdown` VS Code language ids.
5. Compute: (flavors with complete profiles / 13 explicit flavors) x 100.
**Fail:** Any required flavor exists only as a UI label or undocumented enum value.
**Goal:** 100% documented dialect profiles for required explicit flavors.
**Stakeholders:** Markdown authors, extension maintainers, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** Markdown flavor research notes in `docs/research/`, plus `docs/ofm-spec/` for the Obsidian profile.

---

## Extension.MarkdownFlavor.AutoDetection

**Tag:** Extension.MarkdownFlavor.AutoDetection
**User Req:** User.Extension.AutoDetectFlavor
**Gist:** In `auto` mode, the extension and server should continue to infer the effective flavor from vault and workspace signals.
**Ambition:** Existing vault users should not have to configure anything. Obsidian vaults should behave as Obsidian flavored Markdown, plain Markdown files should default conservatively, and future detection can expand without changing the UI model.
**Scale:** Percentage of documented contexts where `auto` resolves to the expected effective flavor.
**Meter:**

1. Open a Markdown file under a `.obsidian/` vault.
2. Verify `auto` resolves to `obsidian`.
3. Open a Markdown file matched by `.fgattributes` with no explicit in-memory selector state.
4. Verify `auto` resolves according to the `flavor` attribute if present, including any supported flavor id.
5. Open a single generic `.md` file outside a workspace.
6. Verify `auto` resolves to `commonmark` unless future evidence says otherwise.
7. Open a directory tree with no `.fgignore` or `.fgattributes` and verify every Markdown file in that tree uses Auto Detect.
8. Verify a matching `.fgattributes` `flavor=auto` rule also runs Auto Detect for that path.
9. Compute: (correct auto resolutions / total contexts tested) x 100.
**Fail:** Auto detection selects Obsidian for generic Markdown without a vault/config signal, ignores a matching `.fgattributes` rule, or fails to select Obsidian for `.obsidian/` vault notes.
**Goal:** 100% documented auto-detection correctness.
**Stakeholders:** Vault authors, Markdown authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/design/markdown-flavor-auto-detection]], [[docs/requirements/functional/workspace]], [[docs/features/markdown-flavor-config-files]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/adr/ADR020-markdown-flavor-selection]], [[docs/features/ofmarkdown-language-mode]].

---

## Extension.MarkdownFlavor.OverridePersistence

**Tag:** Extension.MarkdownFlavor.OverridePersistence
**User Req:** User.Extension.OverrideMarkdownFlavor
**Gist:** User flavor overrides must persist to `.fgattributes` at selected-file or active-directory scope.
**Ambition:** Overrides should land in project-visible Git-style config files so collaborators, CLI/editor integrations, and future sessions resolve the same effective flavor without hidden VS Code setting state.
**Scale:** Percentage of override operations written to the correct `.fgattributes` pattern and attribute target.
**Meter:**

1. Open a Markdown file inside a workspace folder.
2. Select `CommonMark` in the flavor selector.
3. Choose `Selected file` and verify `.fgattributes` in the active file's directory contains a file-specific `flavor=commonmark` rule.
4. Select `GitHub Flavored Markdown`.
5. Choose `All files in this directory` and verify `.fgattributes` contains a directory-local Markdown pattern with `flavor=gfm`.
6. Open a standalone Markdown file with no workspace folder.
7. Select `Original Markdown`, choose `Selected file`, and verify `.fgattributes` is written beside the file.
8. Clear the override by selecting `Auto Detect`.
9. Verify the same scope is cleared or reset through `!flavor` or rule removal.
10. Compute: (correct persistence operations / total operations tested) x 100.
**Fail:** A selector override is written to VS Code flavor settings, the wrong `.fgattributes` file, or a pattern broader than the selected scope.
**Goal:** 100% correct `.fgattributes` persistence scope.
**Stakeholders:** VS Code users, teams sharing repository config, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/features/markdown-flavor-config-files]], [[docs/adr/ADR020-markdown-flavor-selection]].

---

## Extension.MarkdownFlavor.IgnoreVisibility

**Tag:** Extension.MarkdownFlavor.IgnoreVisibility
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** Files matched by `.fgignore` must be inactive for Flavor Grenade and absent from server indexes.
**Ambition:** Users need a reliable way to hide generated, private, vendored, or otherwise irrelevant Markdown from diagnostics, completion, references, rename, and navigation without changing VS Code's language mode or repository layout.
**Scale:** Percentage of ignored-file scenarios where the file is omitted from processing and from cross-document results.
**Meter:**

1. Create `.fgignore` fixtures for direct file patterns, directory patterns, `**` patterns, anchored patterns, and negated re-inclusion.
2. Open matching Markdown files and verify the selector reports inactive or ignored state.
3. Verify the server does not parse, index, diagnose, complete, hover, navigate, semantically tokenize, or rename ignored files.
4. Verify references from visible files do not resolve to ignored files as local targets.
5. Modify `.fgignore` to re-include a file and verify the file becomes visible after refresh.
6. Compute: (correct ignored-file outcomes / total ignored-file outcomes) x 100.
**Fail:** Any ignored file appears in `VaultIndex`, receives language features, or participates in rename/reference results.
**Goal:** 100% ignored-file invisibility.
**Stakeholders:** Markdown authors, vault authors, extension maintainers, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/features/markdown-flavor-config-files]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/design/markdown-flavor-auto-detection]].

---

## Extension.MarkdownFlavor.ServerPropagation

**Tag:** Extension.MarkdownFlavor.ServerPropagation
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** The effective Markdown flavor must be propagated to the server so diagnostics, completion, parsing, and navigation use the selected dialect.
**Ambition:** A selector that changes only UI text is misleading. The effective flavor must affect language intelligence consistently once the server supports flavor-specific behavior.
**Scale:** Percentage of server-facing document analysis requests that include or can derive the current effective flavor.
**Meter:**

1. Start the extension with `auto` in an Obsidian vault.
2. Verify server initialization or document metadata reports effective flavor `obsidian`.
3. Write `.fgattributes` rules for each required explicit flavor id.
4. Verify the server receives a file-change or refresh signal and re-analyzes open documents with that flavor id.
5. Override a single-file context to `original` through `.fgattributes`.
6. Verify the server receives or derives `original`.
7. Compute: (correct server flavor states / total flavor-state transitions) x 100.
**Fail:** The UI selector changes but the server continues analyzing with the previous effective flavor.
**Goal:** 100% propagation for supported flavor transitions.
**Stakeholders:** Markdown authors, extension maintainers, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/design/markdown-flavor-auto-detection]], [[docs/design/api-layer]], [[docs/adr/ADR021-fgignore-fgattributes-flavor-configuration]], [[docs/adr/ADR020-markdown-flavor-selection]].

---

## Extension.MarkdownFlavor.ManualLanguageSafety

**Tag:** Extension.MarkdownFlavor.ManualLanguageSafety
**User Req:** User.Extension.PreserveManualMode
**Gist:** The flavor selector must not override documents whose current VS Code language id is not `markdown`.
**Ambition:** A user who manually sets a `.md` file to `mdx`, `plaintext`, or another language is making a language-mode choice. Flavor Grenade should not interpret that as permission to apply Markdown flavor behavior, even though `mdx` is also a supported flavor id for Markdown documents.
**Scale:** Percentage of non-`markdown` documents ignored by flavor auto-detection and override application.
**Meter:**

1. Open a `.md` file and manually change its language id to `plaintext`.
2. Trigger flavor detection and selector refresh.
3. Verify the document language id remains `plaintext`.
4. Verify no flavor override is applied to that document unless the user returns it to `markdown`.
5. Repeat with `mdx` if available.
6. Compute: (manual-language documents preserved / total manual-language documents tested) x 100.
**Fail:** Any non-`markdown` document is treated as active Markdown flavor scope or reassigned.
**Goal:** 100% manual language selections preserved.
**Stakeholders:** Advanced VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[docs/adr/ADR020-markdown-flavor-selection]], VS Code API documentation for language ids.
