---
title: "Features | Flavor Grenade LSP"
description: "Explore flavor-aware diagnostics, completions, navigation, hovers, symbols, folds, semantic tokens, rename, and code actions."
h1: "Features"
summary: "Explore the editor features that help flavor-aware Markdown feel connected, navigable, and safe to edit."
related: ["quickstart","howTo","concepts"]
---

# Features

Explore the editor features that help flavor-aware Markdown feel connected, navigable, and safe to edit.

## Flavor-aware Markdown

Flavor Grenade understands Markdown as project content, not just isolated text. It can work with Obsidian-style vaults and with configured Markdown projects that use `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, or `stack-overflow`.

Structured profiles layer document conventions on top of that base flavor. Keep a Changelog, Common Changelog, and MADR files can keep their Markdown flavor while also getting profile-specific structure.

## Diagnostics

Diagnostics are grouped by code family so warnings are easier to read and filter. Link diagnostics cover missing, ambiguous, malformed, and unsafe local targets. Flavor and profile diagnostics cover mismatches between the file and the configured Markdown or structured-document expectations.

## Completions

Completions are routed by context. Flavor Grenade can suggest wiki links, Markdown links, local attachments, headings, tags, flavor snippets, and structured headings when the surrounding text makes that kind of suggestion useful.

## Navigation and editing

Go to definition, references, highlights, prepare rename, rename, and code actions all use the same project model. That keeps navigation and edits aligned with the diagnostics you see.

## Reading support

Hovers explain recognized targets and document structure. Document symbols and folding ranges make long notes, changelogs, and structured Markdown files easier to scan. Semantic tokens let the editor distinguish links, embeds, tags, headings, and other flavor-aware syntax.
