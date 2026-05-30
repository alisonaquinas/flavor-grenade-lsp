---
title: "FAQ | Flavor Grenade LSP"
description: "Answers about flavor-aware Markdown, Obsidian compatibility, VS Code setup, safe edits, and LSP behavior."
h1: "Frequently Asked Questions"
summary: "Straight answers about setup, flavors, profiles, Obsidian compatibility, indexing, and safe edits."
related: ["quickstart","advancedUsage","howToVsCodeExtension"]
---

# Frequently Asked Questions

Straight answers about setup, flavors, profiles, Obsidian compatibility, indexing, and safe edits.

## What is Flavor Grenade LSP?

It is a VS Code extension and language server for flavor-aware Markdown. It helps editors understand local links, wiki links, Markdown links, headings, tags, embeds, document structure, diagnostics, completions, navigation, references, rename, hovers, symbols, folds, semantic tokens, and code actions.

## Is Flavor Grenade LSP an Obsidian plugin?

No. It is editor tooling for VS Code and other language-server clients. Obsidian does not need to be installed or running. Obsidian vaults are supported, but the product is not loaded by Obsidian.

## How is it different from Marksman?

Marksman is a general Markdown language server. Flavor Grenade focuses on flavor-aware Markdown and project-specific structure: Obsidian-style vault links, Markdown links, attachments, structured profiles, diagnostics by code family, flavor snippets, structured heading completion, and safety boundaries for local edits.

## Does Obsidian have to be installed?

No. Flavor Grenade reads Markdown files and project markers directly. An Obsidian vault can be detected through `.obsidian/`, and non-Obsidian Markdown projects can use `.fgattributes` for flavor rules or `.fgignore` for visibility rules.

## Does it edit my vault automatically?

No. Diagnostics, hovers, symbols, folds, semantic tokens, and completions do not change files. Rename and code actions produce explicit editor edits, and local edits stay inside the detected project boundary.

## Which Markdown flavors are supported?

Flavor Grenade can work with `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`. `.fgattributes` can pin one of those flavors, and Auto Detect resolves to one effective flavor from markers, syntax, context, or CommonMark fallback when no concrete rule applies.

## What are structured profiles?

Structured profiles describe document conventions layered on top of a base Markdown flavor. Current profile flags are `keep-a-changelog`, `common-changelog`, and `madr`; they are separate from the Markdown flavor list and can be inferred or configured.

## What completions does it provide?

Completions can include wiki links, Markdown links, headings, tags, local attachments, flavor snippets, and structured headings. The list depends on the cursor context and the indexed project.

## What do diagnostic code families mean?

Code families group related warnings. Link diagnostics, flavor diagnostics, and structured-profile diagnostics can be surfaced separately, which makes problems easier to filter and explain.

## Can Neovim or another LSP client use it?

The server speaks LSP, so other editors can integrate with it. The VS Code extension is the supported packaged path; other clients may need manual launch, transport, and root-folder configuration.

## Why are some links not resolved?

Some links are valid Markdown but are not safe local edits. External URLs, unsupported URI schemes, paths outside the project boundary, ambiguous headings, and ignored files are left alone.

## Does it only help with links?

No. Links are a major use case, but the server also provides hovers, document symbols, folding ranges, semantic tokens, references, highlights, rename, and code actions.

## How do I report a bug?

Create a tiny project that shows the problem. Include the Markdown flavor, any structured profiles, the link or heading text, the expected target, and where you saw it: diagnostics, completion, hover, symbols, folds, semantic tokens, navigation, references, rename, or code actions.
