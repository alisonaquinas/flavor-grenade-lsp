---
title: Extension Markdown Flavor User Requirements
tags:
  - extension/docs
  - requirements/user/markdown-flavors
aliases:
  - Extension Markdown Flavor User Requirements
  - VS Code Markdown Flavor User Requirements
---

# Extension Markdown Flavor User Requirements

> [!NOTE] Scope
> These user requirements cover the VS Code UX for selecting Markdown flavor
> while `.md` files remain in the built-in `markdown` language mode. Server-side
> dialect semantics remain governed by root Markdown flavor requirements and
> flavor feature sets.

## User.ExtensionFlavor.KeepMarkdownMode

**Tag:** User.ExtensionFlavor.KeepMarkdownMode
**Goal:** Keep `.md` files in VS Code Markdown mode
**Need:** A VS Code user wants Flavor Grenade to add flavor-aware behavior without changing the document's language id away from `markdown`, so existing Markdown extensions, preview behavior, settings, snippets, and muscle memory keep working.
**Feature docs:** [VS Code extension parity](../../features/vscode-extension-parity.md), [root Markdown flavor selection](../../../../docs/features/ofmarkdown-language-mode.md)
**Maps to:** Extension.MarkdownLanguage.PreserveDefault

---

## User.ExtensionFlavor.ChooseFlavor

**Tag:** User.ExtensionFlavor.ChooseFlavor
**Goal:** Choose the active Markdown flavor from Flavor Grenade UI
**Need:** A Markdown author wants a visible Flavor Grenade control for choosing how the current Markdown document is interpreted, without using the VS Code language picker.
**Feature docs:** [VS Code extension parity](../../features/vscode-extension-parity.md), [root Markdown flavor selection](../../../../docs/features/ofmarkdown-language-mode.md)
**Maps to:** Extension.MarkdownFlavor.Selector, Extension.MarkdownFlavor.RequiredCoverage

---

## User.ExtensionFlavor.SeeSupportedChoices

**Tag:** User.ExtensionFlavor.SeeSupportedChoices
**Goal:** See every planned Markdown flavor as a supported choice
**Need:** A user wants the selector and setting to offer `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`, with an Auto Detect option for contextual defaults.
**Feature docs:** [Markdown flavor feature sets](../../../../docs/features/markdown-flavor-feature-sets.md), [VS Code extension parity](../../features/vscode-extension-parity.md)
**Maps to:** Extension.MarkdownFlavor.RequiredCoverage

---

## User.ExtensionFlavor.UseAutoDetection

**Tag:** User.ExtensionFlavor.UseAutoDetection
**Goal:** Let the extension infer the flavor from vault or workspace context
**Need:** A vault user wants Obsidian vault notes to behave as Obsidian flavored Markdown by default, while generic Markdown files keep a conservative default unless a workspace or user choice says otherwise.
**Feature docs:** [activation behavior](../../features/activation-behavior.md), [VS Code extension parity](../../features/vscode-extension-parity.md)
**Maps to:** Extension.MarkdownFlavor.AutoDetection, Extension.MarkdownFlavor.Refresh

---

## User.ExtensionFlavor.PersistChoice

**Tag:** User.ExtensionFlavor.PersistChoice
**Goal:** Keep a manual flavor choice at the right VS Code settings scope
**Need:** A team wants a project flavor choice to stay with the workspace, while a standalone-file user wants their personal choice remembered without creating project configuration.
**Feature docs:** [VS Code extension parity](../../features/vscode-extension-parity.md)
**Maps to:** Extension.MarkdownFlavor.OverridePersistence

---

## User.ExtensionFlavor.TrustSelectedBehavior

**Tag:** User.ExtensionFlavor.TrustSelectedBehavior
**Goal:** Have selected flavor affect language intelligence
**Need:** A user expects diagnostics, completions, hover, navigation, document symbols, folding, semantic tokens, and rename behavior to follow the selected flavor instead of merely updating UI text.
**Feature docs:** [VS Code extension parity](../../features/vscode-extension-parity.md), [Markdown flavor feature sets](../../../../docs/features/markdown-flavor-feature-sets.md)
**Maps to:** Extension.MarkdownFlavor.ServerPropagation, Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.Refresh

---

## User.ExtensionFlavor.PreserveManualLanguage

**Tag:** User.ExtensionFlavor.PreserveManualLanguage
**Goal:** Preserve manual non-Markdown language mode choices
**Need:** A user who manually changes a `.md` file to `plaintext`, `mdx`, or another VS Code language mode wants Flavor Grenade to respect that language-mode choice and skip Markdown flavor behavior until the document is back in `markdown`.
**Feature docs:** [VS Code extension parity](../../features/vscode-extension-parity.md), [root Markdown flavor selection](../../../../docs/features/ofmarkdown-language-mode.md)
**Maps to:** Extension.MarkdownFlavor.ManualLanguageSafety

---

## Flavor-Specific Needs

Each planned explicit flavor must be selectable while the VS Code language id
remains `markdown`. These needs trace to
[Markdown flavor feature sets](../../../../docs/features/markdown-flavor-feature-sets.md)
and to `Extension.MarkdownFlavor.RequiredCoverage` plus
`Extension.MarkdownFlavor.DialectProfiles`.

| User requirement | Flavor id | User need | Feature set |
|---|---|---|---|
| User.ExtensionFlavor.AuthorOriginal | `original` | A compatibility-focused author wants historical Markdown rules available without enabling modern extensions by default. | [Original Markdown](../../../../docs/features/original-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorCommonMark | `commonmark` | A portable Markdown author wants standardized CommonMark behavior without platform-specific extensions leaking in. | [CommonMark](../../../../docs/features/commonmark-flavor.md) |
| User.ExtensionFlavor.AuthorObsidian | `obsidian` | An Obsidian vault author wants wiki-links, embeds, tags, callouts, block references, frontmatter, and vault-local behavior in Markdown mode. | [Obsidian Markdown](../../../../docs/features/obsidian-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorGFM | `gfm` | A GitHub documentation author wants GFM tables, task lists, strikethrough, autolinks, and GitHub-specific boundaries understood. | [GitHub Flavored Markdown](../../../../docs/features/github-flavored-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorGLFM | `glfm` | A GitLab documentation author wants GLFM extensions classified without local tooling pretending to verify GitLab objects. | [GitLab Flavored Markdown](../../../../docs/features/gitlab-flavored-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorPandoc | `pandoc` | A technical author wants Pandoc Markdown syntax recognized while conversion-time filters, templates, and output formats stay explicit boundaries. | [Pandoc Markdown](../../../../docs/features/pandoc-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorMultiMarkdown | `multimarkdown` | A document-production author wants MultiMarkdown metadata, tables, footnotes, citations, labels, and cross-references treated as flavor-specific syntax. | [MultiMarkdown](../../../../docs/features/multimarkdown-flavor.md) |
| User.ExtensionFlavor.AuthorMDX | `mdx` | An MDX author wants MDX syntax awareness while still choosing to keep the document in VS Code's `markdown` language mode. | [MDX](../../../../docs/features/mdx-flavor.md) |
| User.ExtensionFlavor.AuthorKramdown | `kramdown` | A Ruby-oriented Markdown author wants kramdown attributes, definition lists, tables, footnotes, math, and local links interpreted as kramdown syntax. | [kramdown](../../../../docs/features/kramdown-flavor.md) |
| User.ExtensionFlavor.AuthorMarkdownExtra | `markdown-extra` | A web publishing author wants Markdown Extra tables, definition lists, footnotes, abbreviations, fenced code, and attributes recognized only for that flavor. | [Markdown Extra](../../../../docs/features/markdown-extra-flavor.md) |
| User.ExtensionFlavor.AuthorRMarkdown | `r-markdown` | An R Markdown author wants YAML metadata, code chunks, inline R, chunk labels, options, citations, cross-references, and local links analyzed without code execution. | [R Markdown](../../../../docs/features/r-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorReddit | `reddit` | A Reddit author wants Reddit Markdown syntax and platform references classified without treating subreddit, user, post, or comment references as local files. | [Reddit Markdown](../../../../docs/features/reddit-markdown-flavor.md) |
| User.ExtensionFlavor.AuthorStackOverflow | `stack-overflow` | A technical Q&A author wants Stack Overflow Markdown rules and post/comment boundaries understood without treating platform references as vault targets. | [Stack Overflow Markdown](../../../../docs/features/stack-overflow-markdown-flavor.md) |

## Related Functional Requirements

- [Markdown flavor auto-detection algorithm](../../../../docs/design/markdown-flavor-auto-detection.md)
- [Root Markdown flavor selection requirements](../../../../docs/requirements/functional/ofmarkdown-language-mode.md)
- [Extension functional requirements](../functional/vscode-extension-parity.md)
