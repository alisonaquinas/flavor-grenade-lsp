---
title: "Obsidian Flavored Markdown | Flavor Grenade LSP"
description: "Learn how Obsidian Flavored Markdown differs from plain Markdown in vault workflows."
h1: "Obsidian Flavored Markdown"
summary: "Obsidian Flavored Markdown is regular Markdown plus vault-aware links, embeds, tags, and habits."
related: ["conceptWikiLinkResolution","conceptOpaqueRegions","quickstart"]
---

# Obsidian Flavored Markdown

Obsidian Flavored Markdown is regular Markdown plus vault-aware links, embeds, tags, and habits.

## In plain English

OFM is Markdown that means more because it lives inside a vault. A wiki link is not just punctuation; it points to a note, heading, block, alias, or file in that local workspace.

Flavor Grenade reads those local relationships so editor features can help with completion, navigation, references, rename, and broken-link warnings.

## In a vault

This example combines a note target, heading target, embed, and tag because real vault notes often mix them in one paragraph.

```text
[[People/Ada Lovelace#Notes]] embeds context from ![[images/diagram.png]] and tags #project/flavor-grenade.
```

## For future docs

Use OFM when the prose depends on local vault relationships. Keep ordinary Markdown links separate from Obsidian-specific links so the docs do not imply that every link can be renamed or fixed as a vault object.

## Try this

Create one note with `[[Project Plan]]`, `[[Project Plan#Risks]]`, `![[diagram.png]]`, and `#project/flavor-grenade`. Those tokens should be described as OFM because their meaning depends on the vault. A normal paragraph, an external web link, and a fenced code sample should remain ordinary Markdown unless the article is explicitly explaining how the server classifies them.

The useful distinction is this: Markdown shows text and links; OFM adds local vault meaning that editor tools can understand.

That does not make plain Markdown less important. Flavor Grenade still respects normal Markdown paragraphs, code fences, headings, and web links. The extra OFM behavior appears when the syntax depends on the vault: note names, heading anchors, embeds, local attachments, tags, and block references. Keeping that line clear makes the docs easier to trust.
