---
title: Extension User Requirements Index
tags:
  - extension/docs
  - requirements/user
aliases:
  - Extension User Requirements
  - VS Code Extension User Requirements
---

# Extension User Requirements Index

This document indexes VS Code extension user requirements. These requirements
describe what users need from the client UX; functional behavior is specified in
[extension functional requirements](../functional/vscode-extension-parity.md)
and root Markdown flavor requirements.

## Format

| Field | Purpose |
|---|---|
| **Tag** | Stable user requirement identifier. |
| **Goal** | Short user-facing objective. |
| **Need** | Plain-language user need, avoiding implementation details. |
| **Feature docs** | Extension or root feature documents that define the product surface. |
| **Maps to** | Functional requirement tags that can satisfy the user need. |

## Tag Table

| Tag | Goal | Theme file | Maps to |
|---|---|---|---|
| User.ExtensionFlavor.KeepMarkdownMode | Keep `.md` files in VS Code Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownLanguage.PreserveDefault |
| User.ExtensionFlavor.ChooseFlavor | Choose the active Markdown flavor from Flavor Grenade UI | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.Selector, Extension.MarkdownFlavor.RequiredCoverage |
| User.ExtensionFlavor.SeeSupportedChoices | See every planned Markdown flavor as a supported choice | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage |
| User.ExtensionFlavor.UseAutoDetection | Let the extension infer the flavor from vault or workspace context | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.AutoDetection, Extension.MarkdownFlavor.Refresh |
| User.ExtensionFlavor.PersistChoice | Keep a manual flavor choice in `.fgattributes` | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.OverridePersistence |
| User.ExtensionFlavor.TrustSelectedBehavior | Have selected flavor affect language intelligence | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.ServerPropagation, Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.Refresh |
| User.ExtensionFlavor.PreserveManualLanguage | Preserve manual non-Markdown language mode choices | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.ManualLanguageSafety |
| User.ExtensionFlavor.AuthorOriginal | Use Original Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorCommonMark | Use CommonMark rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorObsidian | Use Obsidian rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.AutoDetection |
| User.ExtensionFlavor.AuthorGFM | Use GitHub Flavored Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorGLFM | Use GitLab Flavored Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorPandoc | Use Pandoc Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorMultiMarkdown | Use MultiMarkdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorMDX | Use MDX rules without switching VS Code to MDX language mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles, Extension.MarkdownFlavor.ManualLanguageSafety |
| User.ExtensionFlavor.AuthorKramdown | Use kramdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorMarkdownExtra | Use Markdown Extra rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorRMarkdown | Use R Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorReddit | Use Reddit Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |
| User.ExtensionFlavor.AuthorStackOverflow | Use Stack Overflow Markdown rules in Markdown mode | [markdown-flavors](markdown-flavors.md) | Extension.MarkdownFlavor.RequiredCoverage, Extension.MarkdownFlavor.DialectProfiles |

## Related

- [Markdown flavor user requirements](markdown-flavors.md)
- [VS Code extension parity feature](../../features/vscode-extension-parity.md)
- [Extension functional requirements](../functional/vscode-extension-parity.md)
- [Root Markdown flavor selection requirements](../../../../docs/requirements/functional/ofmarkdown-language-mode.md)
