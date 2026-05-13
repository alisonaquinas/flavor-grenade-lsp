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

---

**Tag:** Extension.MarkdownLanguage.PreserveDefault
**User Req:** User.Extension.PreserveMarkdownLanguage
**Gist:** The VS Code extension must keep Markdown documents in VS Code's built-in `markdown` language mode instead of promoting them to an alternate language id.
**Ambition:** Users should keep the default Markdown editor ecosystem: built-in highlighting, Markdown extensions, editor settings, previews, snippets, and commands. Flavor Grenade should add flavor awareness without taking over the language picker.
**Scale:** Percentage of opened `.md` documents whose VS Code `languageId` remains `markdown` after extension activation, flavor detection, and user flavor override.
**Meter:**

1. Open a `.md` file in an Obsidian vault.
2. Wait for extension activation and flavor detection.
3. Verify the document `languageId` remains `markdown`.
4. Select each supported flavor override: `original`, `commonmark`, and `obsidian`.
5. Verify the document `languageId` remains `markdown` after each override.
6. Repeat in a generic Markdown workspace and in single-file mode.
7. Compute: (documents remaining `markdown` / total `.md` documents tested) x 100.
**Fail:** Any `.md` document is reassigned to `ofmarkdown` or another custom Markdown language id by Flavor Grenade.
**Goal:** 100% of `.md` documents remain in `markdown`.
**Stakeholders:** Vault authors, VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR020-markdown-flavor-selection]], [[features/ofmarkdown-language-mode]].

---

**Tag:** Extension.MarkdownFlavor.Selector
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The extension must expose a second Markdown flavor selector near the VS Code language mode control, independent of the built-in language picker.
**Ambition:** Users need a visible way to understand and change how Flavor Grenade interprets the current Markdown document without changing the VS Code language mode. The selector should make flavor state obvious and reversible.
**Scale:** Percentage of editor contexts where a Markdown flavor selector is visible and reports the current effective flavor.
**Meter:**

1. Open a Markdown file in a workspace folder.
2. Verify a Flavor Grenade status item or equivalent selector is visible near the language mode area as VS Code allows.
3. Verify the selector label includes the effective flavor: `Auto`, `Original`, `CommonMark`, or `Obsidian`.
4. Open the selector and verify choices include `Auto Detect`, `Original Markdown`, `CommonMark`, and `Obsidian`.
5. Select each choice and verify the selector updates without changing the language id.
6. Compute: (selector contexts passing / total Markdown contexts tested) x 100.
**Fail:** The user must use the VS Code language picker to choose Markdown flavor, or the selector is absent for supported Markdown documents.
**Goal:** 100% selector availability for file-backed Markdown documents.
**Stakeholders:** VS Code users, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[features/ofmarkdown-language-mode]], [[adr/ADR020-markdown-flavor-selection]].

---

**Tag:** Extension.MarkdownFlavor.InitialCoverage
**User Req:** User.Extension.SelectMarkdownFlavor
**Gist:** The initial flavor set must include `original`, `commonmark`, and `obsidian`, plus an `auto` mode.
**Ambition:** The first version should cover the major baseline choices without over-designing for every researched dialect. `auto` preserves low-friction behavior, while explicit values let users resolve incorrect detection.
**Scale:** Number of supported flavor ids present in the selector, settings schema, and client/server initialization payload.
**Meter:**

1. Inspect the flavor enum used by the selector specification.
2. Verify it contains exactly these initial ids: `auto`, `original`, `commonmark`, `obsidian`.
3. Verify user-facing labels are `Auto Detect`, `Original Markdown`, `CommonMark`, and `Obsidian`.
4. Verify unsupported future flavors are not exposed yet.
5. Compute: (required flavor ids present / 4) x 100.
**Fail:** Any required flavor is missing, or an unsupported flavor is exposed as selectable.
**Goal:** 100% initial flavor coverage.
**Stakeholders:** Markdown authors, vault authors, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[research/commonmark-and-original-markdown]], [[ofm-spec/index]], [[adr/ADR020-markdown-flavor-selection]].

---

**Tag:** Extension.MarkdownFlavor.AutoDetection
**User Req:** User.Extension.AutoDetectFlavor
**Gist:** In `auto` mode, the extension and server should continue to infer the effective flavor from vault and workspace signals.
**Ambition:** Existing vault users should not have to configure anything. Obsidian vaults should behave as Obsidian flavored Markdown, plain Markdown files should default conservatively, and future detection can expand without changing the UI model.
**Scale:** Percentage of documented contexts where `auto` resolves to the expected effective flavor.
**Meter:**

1. Open a Markdown file under a `.obsidian/` vault.
2. Verify `auto` resolves to `obsidian`.
3. Open a Markdown file under a `.flavor-grenade.toml` workspace with no explicit flavor setting.
4. Verify `auto` resolves according to project config if present, otherwise to `obsidian` only when Flavor Grenade vault semantics are enabled.
5. Open a single generic `.md` file outside a workspace.
6. Verify `auto` resolves to `commonmark` unless future evidence says otherwise.
7. Compute: (correct auto resolutions / total contexts tested) x 100.
**Fail:** Auto detection selects Obsidian for generic Markdown without a vault/config signal, or fails to select Obsidian for `.obsidian/` vault notes.
**Goal:** 100% documented auto-detection correctness.
**Stakeholders:** Vault authors, Markdown authors.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[requirements/workspace]], [[adr/ADR020-markdown-flavor-selection]], [[features/ofmarkdown-language-mode]].

---

**Tag:** Extension.MarkdownFlavor.OverridePersistence
**User Req:** User.Extension.OverrideMarkdownFlavor
**Gist:** User flavor overrides must persist as project settings when a workspace folder is open and as user settings when the context is a standalone file.
**Ambition:** Overrides should land at the least surprising scope. A folder-level choice belongs with the project so collaborators and future sessions get the same interpretation. A single-file choice cannot be written to a project, so it belongs to the user's settings.
**Scale:** Percentage of override operations written to the correct VS Code configuration target.
**Meter:**

1. Open a Markdown file inside a workspace folder.
2. Select `CommonMark` in the flavor selector.
3. Verify the setting is written at workspace-folder or workspace scope, not user scope.
4. Open a standalone Markdown file with no workspace folder.
5. Select `Original Markdown`.
6. Verify the setting is written at user scope.
7. Clear the override by selecting `Auto Detect`.
8. Verify the same scope is cleared or reset.
9. Compute: (correct persistence operations / total operations tested) x 100.
**Fail:** A folder-backed override is written only to user settings, or a standalone-file override attempts to write a project setting.
**Goal:** 100% correct persistence scope.
**Stakeholders:** VS Code users, teams sharing workspace settings, extension maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[adr/ADR020-markdown-flavor-selection]], VS Code configuration target behavior.

---

**Tag:** Extension.MarkdownFlavor.ServerPropagation
**User Req:** User.Extension.TrustFlavorBehavior
**Gist:** The effective Markdown flavor must be propagated to the server so diagnostics, completion, parsing, and navigation use the selected dialect.
**Ambition:** A selector that changes only UI text is misleading. The effective flavor must affect language intelligence consistently once the server supports flavor-specific behavior.
**Scale:** Percentage of server-facing document analysis requests that include or can derive the current effective flavor.
**Meter:**

1. Start the extension with `auto` in an Obsidian vault.
2. Verify server initialization or document metadata reports effective flavor `obsidian`.
3. Override the folder to `commonmark`.
4. Verify the server receives a configuration change or refresh signal and re-analyzes open documents as `commonmark`.
5. Override a single-file context to `original`.
6. Verify the server receives or derives `original`.
7. Compute: (correct server flavor states / total flavor-state transitions) x 100.
**Fail:** The UI selector changes but the server continues analyzing with the previous effective flavor.
**Goal:** 100% propagation for supported flavor transitions.
**Stakeholders:** Markdown authors, extension maintainers, server maintainers.
**Owner:** flavor-grenade-lsp contributors.
**Source:** [[design/api-layer]], [[adr/ADR020-markdown-flavor-selection]].

---

**Tag:** Extension.MarkdownFlavor.ManualLanguageSafety
**User Req:** User.Extension.PreserveManualMode
**Gist:** The flavor selector must not override documents whose current VS Code language id is not `markdown`.
**Ambition:** A user who manually sets a `.md` file to `mdx`, `plaintext`, or another language is making a language-mode choice. Flavor Grenade should not interpret that as permission to apply Markdown flavor behavior.
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
**Source:** [[adr/ADR020-markdown-flavor-selection]], VS Code API documentation for language ids.
