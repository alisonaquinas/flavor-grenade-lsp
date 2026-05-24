---
title: "Obsidian Flavored Markdown and Markdown Flavors | Flavor Grenade LSP"
description: "Learn how Obsidian Flavored Markdown fits into Flavor Grenade base-flavor detection."
h1: "Obsidian Flavored Markdown and Markdown Flavors"
summary: "Obsidian Flavored Markdown is one supported Markdown flavor in a broader flavor-aware language server."
related: ["conceptMarkdownFlavorModel","conceptWikiLinkResolution","quickstart"]
---

# Obsidian Flavored Markdown and Markdown Flavors

Obsidian Flavored Markdown is one supported Markdown flavor in a broader flavor-aware language server.

## In plain English

OFM is Markdown that means more because it lives inside a vault. A wiki link is not just punctuation; it points to a note, heading, block, alias, or file in that local workspace.

Flavor Grenade reads those local relationships so editor features can help with completion, navigation, references, rename, hovers, symbols, folds, semantic tokens, code actions, and broken-link warnings.

The same product also supports Markdown beyond Obsidian. Project configuration can choose a base flavor such as CommonMark, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, Stack Overflow, original Markdown, or Obsidian, then add structured profiles for document conventions.

## In a vault

This example combines a note target, heading target, embed, and tag because real vault notes often mix them in one paragraph.

```text
[[People/Ada Lovelace#Notes]] embeds context from ![[images/diagram.png]] and tags #project/flavor-grenade.
```

## Naming boundary

Use OFM when the prose depends on local vault relationships. Use flavor-aware Markdown when the point is broader than Obsidian, such as configured flavors, structured profiles, Markdown links, diagnostics by code family, or profile-specific headings.

Keep ordinary Markdown links separate from Obsidian-specific links so the docs do not imply that every link can be renamed or fixed as a vault object.

## Try this

Create one note with `[[Project Plan]]`, `[[Project Plan#Risks]]`, `![[diagram.png]]`, and `#project/flavor-grenade`. Those tokens should be described as OFM because their meaning depends on the vault. A normal paragraph, an external web link, and a fenced code sample should remain ordinary Markdown unless the article is explicitly explaining how the server classifies them.

The useful distinction is this: Markdown shows text and links; OFM adds local vault meaning that editor tools can understand.

That does not make plain Markdown less important. Flavor Grenade still respects normal Markdown paragraphs, code fences, headings, Markdown links, and web links. The extra OFM behavior appears when the syntax depends on the vault: note names, heading anchors, embeds, local attachments, tags, and block references.

Structured profiles are a separate layer. They can describe document shape, such as expected headings, without changing the base flavor into Obsidian Markdown. Keeping those layers clear makes the docs easier to trust.
