---
title: "Concepts | Flavor Grenade LSP"
description: "Short wiki-style explanations for flavor-aware Markdown language-server concepts."
h1: "Concepts"
summary: "Short concept pages explain the ideas behind the guides in plain language."
related: ["conceptMarkdownFlavorModel","conceptStructuredProfiles","conceptVaultIndex"]
---

# Concepts

Short concept pages explain the ideas behind the guides in plain language.

## Small ideas you can link to

These pages keep important terms small, linked, and easy to reuse. Read them when a guide mentions a term like Markdown flavor model, structured profiles, vault index, rename safety, or opaque regions and you want the plain-English version.

- Inspiration and Prior Art: What inspired the public wiki shape?
- Obsidian Flavored Markdown: What makes Markdown become Obsidian Flavored Markdown?
- Markdown Flavor Model: How does Auto Detect choose one base flavor?
- Structured Profiles: How can changelog and MADR structure layer onto any flavor?
- Vault Index: Why does the server build a vault index?
- Wiki-link Resolution: How does a wiki link find its target?
- DocId and Vault-Relative Paths: Why are document IDs vault-relative?
- Opaque Regions: Why does the parser skip some Markdown regions?
- Diagnostics: What should a diagnostic mean in an Obsidian Vault?
- Completions: What makes completion vault-aware?
- Rename Safety: How does rename avoid unsafe edits?
- References, Navigation, Tags, and Embeds: How do editor features share the same vault model?

- [Inspiration and Prior Art](/concepts/inspiration-and-prior-art/) - Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art.
- [Obsidian Flavored Markdown and Markdown Flavors](/concepts/obsidian-flavored-markdown/) - Learn how Obsidian Flavored Markdown fits into Flavor Grenade base-flavor detection.
- [Markdown Flavor Model](/concepts/markdown-flavor-model/) - Understand base Markdown flavors, explicit configuration, inference, and CommonMark fallback.
- [Structured Profiles](/concepts/structured-profiles/) - Understand changelog and MADR profiles as optional structure layered over a base Markdown flavor.
- [Vault Index](/concepts/vault-index/) - Understand how Flavor Grenade indexes vault documents, attachments, tags, and links.
- [Wiki-link Resolution](/concepts/wiki-link-resolution/) - Understand how Flavor Grenade resolves wiki links, aliases, headings, and attachments.
- [DocId and Vault-Relative Paths](/concepts/docid-and-vault-relative-paths/) - See why document identity is vault-relative, extension-free, and portable.
- [Opaque Regions](/concepts/opaque-regions/) - Learn why the parser skips OFM-looking text inside code, math, comments, and templates.
- [Diagnostics](/concepts/diagnostics/) - Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets.
- [Completions](/concepts/completions/) - Understand context-routed completions from the vault index, tag registry, and attachments.
- [Rename Safety](/concepts/rename-safety/) - Learn how rename uses resolved local references instead of blind text replacement.
- [References, Navigation, Tags, and Embeds](/concepts/references-navigation-tags-and-embeds/) - See how references, navigation, tags, highlights, and embeds share one vault graph.

## Shared vocabulary

Use these public terms when writing or updating docs so the site stays consistent about Markdown flavors, structured profiles, Obsidian vaults, local links, and the boundary between the VS Code extension and the language server.
