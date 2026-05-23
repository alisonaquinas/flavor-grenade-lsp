---
title: VS Code Markdown Flavor User Requirements
tags:
  - requirements/user/vscode-language-mode
aliases:
  - VS Code Language Mode
  - Markdown Flavor User Requirements
  - OFMarkdown User Requirements
---

# VS Code Markdown Flavor User Requirements

> [!NOTE] Scope
> These user requirements describe what VS Code users need from Markdown flavor selection. Functional requirements are in [[docs/requirements/functional/ofmarkdown-language-mode]]. The built-in VS Code language mode remains `markdown`.

---

## User.Extension.PreserveMarkdownLanguage

**Tag:** User.Extension.PreserveMarkdownLanguage
**Gist:** A Markdown author opens a `.md` file and it stays in VS Code's normal Markdown language mode.
**Ambition:** Flavor Grenade should improve Markdown intelligence without breaking the user's existing Markdown editor setup.
**Scale:** Percentage of opened Markdown documents that keep `languageId = markdown`.
**Meter:** Extension tests open Markdown files in Obsidian vaults, Flavor Grenade workspaces, generic workspaces, and standalone-file contexts, then read the active document language id.
**Fail:** Any Flavor Grenade behavior changes a `.md` file to `ofmarkdown` or another custom language id.
**Goal:** 100% of supported `.md` files remain `markdown`.
**Need:** A user wants their Markdown extensions, settings, highlighting, previews, and muscle memory to keep working.
**Maps to:** Extension.MarkdownLanguage.PreserveDefault

---

## User.Extension.SelectMarkdownFlavor

**Tag:** User.Extension.SelectMarkdownFlavor
**Gist:** A Markdown author can see and choose the active Markdown flavor from a separate Flavor Grenade selector.
**Ambition:** Flavor should be visible and editable without using the VS Code language picker.
**Scale:** Percentage of Markdown contexts where the selector shows and changes the effective flavor.
**Meter:** Extension tests open Markdown files, inspect the selector label, choose Auto Detect and every supported explicit flavor, then verify the effective flavor changes.
**Fail:** The user cannot choose flavor, or must change VS Code language mode to do it.
**Goal:** Selector available for every file-backed Markdown document.
**Need:** A user wants to say "treat this as `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, or `stack-overflow`" directly.
**Maps to:** Extension.MarkdownFlavor.Selector, Extension.MarkdownFlavor.RequiredCoverage

---

## User.Extension.AutoDetectFlavor

**Tag:** User.Extension.AutoDetectFlavor
**Gist:** A vault author opens an Obsidian note and Flavor Grenade automatically treats it as Obsidian flavored Markdown.
**Ambition:** Obsidian vaults should keep zero-config behavior, while generic Markdown should not be assumed to be Obsidian.
**Scale:** Percentage of auto-detected contexts that resolve to the expected flavor.
**Meter:** Tests open files in `.obsidian/` vaults, configured Flavor Grenade workspaces, generic Markdown folders, and standalone mode, then inspect the effective flavor.
**Fail:** Obsidian vault files do not auto-detect as Obsidian, or generic Markdown auto-detects as Obsidian without a vault/config signal.
**Goal:** 100% expected auto-detection for documented contexts.
**Need:** A user wants useful defaults before choosing any override.
**Maps to:** Extension.MarkdownFlavor.AutoDetection

---

## User.Extension.OverrideMarkdownFlavor

**Tag:** User.Extension.OverrideMarkdownFlavor
**Gist:** A user override persists at project scope when a folder is open and at user scope when only a standalone file is open.
**Ambition:** Flavor overrides should be durable without leaking into the wrong context.
**Scale:** Percentage of override operations written to the expected VS Code settings target.
**Meter:** Tests set flavor from a workspace file and from a standalone file, then inspect whether workspace/user settings changed.
**Fail:** A folder-backed override writes only to user settings, or a standalone-file override attempts a project setting.
**Goal:** 100% correct persistence scope.
**Need:** A team wants project files interpreted consistently; a single-file user wants their local preference remembered.
**Maps to:** Extension.MarkdownFlavor.OverridePersistence

---

## User.Extension.TrustFlavorBehavior

**Tag:** User.Extension.TrustFlavorBehavior
**Gist:** The selected flavor affects Flavor Grenade diagnostics, completions, and navigation.
**Ambition:** The selector must be real product state, not decorative UI.
**Scale:** Percentage of flavor transitions reflected by server analysis behavior.
**Meter:** Tests change flavor and verify the server receives or derives the effective flavor before refreshing document intelligence.
**Fail:** The selector changes but server analysis continues using stale flavor state.
**Goal:** 100% propagation for supported flavor transitions.
**Need:** A user expects every researched flavor choice to change how Markdown is interpreted, including parser rules, diagnostics, completions, navigation, hover, rename, and host-specific boundaries.
**Maps to:** Extension.MarkdownFlavor.ServerPropagation, Extension.MarkdownFlavor.DialectProfiles

---

## User.Extension.PreserveManualMode

**Tag:** User.Extension.PreserveManualMode
**Gist:** A user manually chooses another VS Code language mode and Flavor Grenade does not override it.
**Ambition:** Explicit language-mode choices outrank automatic flavor detection.
**Scale:** Percentage of documents with non-`markdown` language ids that remain unchanged after flavor detection refresh.
**Meter:** Extension tests set a `.md` file to `plaintext`, `mdx`, or another custom language and verify Flavor Grenade does not apply Markdown flavor behavior to that document.
**Fail:** Any manual non-Markdown language selection is overwritten or treated as active Markdown flavor scope.
**Goal:** 100% of manual non-Markdown language selections are preserved.
**Need:** Advanced users sometimes use MDX, plaintext, or other language modes for `.md` files and expect extensions not to fight the language picker.
**Maps to:** Extension.MarkdownFlavor.ManualLanguageSafety
