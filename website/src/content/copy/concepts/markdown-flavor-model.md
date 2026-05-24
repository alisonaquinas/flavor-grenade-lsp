---
title: "Markdown Flavor Model | Flavor Grenade LSP"
description: "Understand base Markdown flavors, explicit configuration, inference, and CommonMark fallback."
h1: "Markdown Flavor Model"
summary: "The Markdown flavor model separates base grammar selection from project structure and editor features."
related: ["conceptObsidianFlavoredMarkdown","conceptStructuredProfiles","advancedConfigurationModel"]
---

# Markdown Flavor Model

The Markdown flavor model separates base grammar selection from project structure and editor features.

## One base flavor per document

Flavor Grenade chooses one effective base flavor for each Markdown document. That base flavor tells the parser which syntax family should be active before structured profiles, vault links, or editor features are layered on top.

The supported base flavor ids are `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`. Auto Detect is a selection mode, not a flavor. It resolves to one effective flavor for the active file.

```toml
[core.markdown]
flavor = "pandoc"
structured_profiles = "auto"
```

## Detection order

The strongest signal is explicit configuration. VS Code settings can choose `flavorGrenade.markdownFlavor`, and `.flavor-grenade.toml` can declare `core.markdown.flavor` for the repository. Those signals beat inference because they are intentional.

When explicit TOML is absent, Flavor Grenade looks for context. An `.obsidian/` folder is strong evidence for Obsidian Markdown. MDX component syntax, R Markdown chunks, platform-specific tables, footnotes, attributes, and other syntax can also point to a flavor. If signals remain weak or ambiguous, the safe fallback is CommonMark.

## Why fallback matters

Generic Markdown must stay generic. A root-level README should not become Obsidian flavored only because a nearby project contains notes. CommonMark fallback prevents false wiki-link diagnostics, unexpected tag parsing, and noisy completions in files that are probably ordinary Markdown.

That conservative behavior is visible in editor features. Obsidian documents can use `[[Daily Note#Heading]]` and vault tags. CommonMark documents still get heading structure, Markdown links, hovers, symbols, folding ranges, and diagnostics appropriate to the flavor, but Obsidian-only constructs do not become active by default.

## Relationship to profiles

Structured profiles are independent flags. A file can be `gfm` with the Keep a Changelog profile, `commonmark` with MADR, or `obsidian` with a Common Changelog profile. The base flavor decides Markdown syntax; the profile describes expected document shape.

This split keeps configuration readable. It also prevents profile names from bloating the flavor selector. A changelog is not a new Markdown dialect, and an ADR file is not a replacement for the Markdown grammar it uses.

## Practical example

A documentation repository might contain all of these files:

- `README.md` with no special syntax, resolved as CommonMark.
- `docs/components/button.mdx`, inferred as MDX.
- `notes/Daily.md` under `.obsidian/`, resolved as Obsidian.
- `CHANGELOG.md`, resolved as GFM with a changelog profile.

Each file can still use the same language server. The important part is that Flavor Grenade reports and analyzes the effective flavor per document instead of forcing the whole workspace into one Markdown assumption.
