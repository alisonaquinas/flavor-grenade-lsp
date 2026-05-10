---
title: "Obsidian Flavored Markdown | Flavor Grenade LSP"
description: "Learn how Obsidian Flavored Markdown differs from plain Markdown in vault workflows."
h1: "Obsidian Flavored Markdown"
summary: "Obsidian Flavored Markdown extends Markdown with vault links, embeds, tags, and local conventions."
related: ["conceptWikiLinkResolution","conceptOpaqueRegions","quickstart"]
---

# Obsidian Flavored Markdown

Obsidian Flavored Markdown extends Markdown with vault links, embeds, tags, and local conventions.

## Compact definition

OFM is Markdown plus vault semantics: wiki links, embeds, tags, headings, block references, callouts, frontmatter, and local attachment conventions.

The language server treats OFM as Markdown with vault-local meaning. A wiki link is not just punctuation; it points to a document, heading, block, or alias inside a specific vault boundary.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example combines a note target, heading target, embed, and tag because real vault notes often use all of them together. That combination is why plain Markdown tooling is not enough.

```text
[[People/Ada Lovelace#Notes]] embeds context from ![[images/diagram.png]] and tags #project/flavor-grenade.
```

## For LLM maintainers

Use OFM when prose depends on vault-local relationships that plain Markdown cannot describe by itself.

When adding docs, distinguish generic Markdown features from Obsidian-specific conventions. Do not imply that every Markdown link is safe to rewrite as a vault reference.

## Practical check

Create one note with `[[Project Plan]]`, `[[Project Plan#Risks]]`, `![[diagram.png]]`, and `#project/flavor-grenade`. Those tokens should be described as OFM because their meaning depends on the vault. A normal paragraph, an external web link, and a fenced code sample should remain ordinary Markdown unless the article is explicitly explaining how the server classifies them.

The reader should be able to explain why OFM needs vault-aware tooling. Markdown syntax alone can show text and links, but OFM adds local graph meaning that powers completion, diagnostics, navigation, references, and rename.
