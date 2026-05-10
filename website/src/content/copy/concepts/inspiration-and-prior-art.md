---
title: "Inspiration and Prior Art | Flavor Grenade LSP"
description: "Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art."
h1: "Inspiration and Prior Art"
summary: "Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art."
related: ["conceptObsidianFlavoredMarkdown","conceptVaultIndex","faq"]
---

# Inspiration and Prior Art

Credit the LLM wiki pattern, Obsidian vault workflows, and Markdown LSP prior art.

## Compact definition

Flavor Grenade uses a Karpathy-inspired LLM wiki shape: short, linked concept pages that let humans and LLM maintainers share vocabulary.

The public docs borrow the linked-wiki shape because it is easier for readers and LLM agents to reuse one precise concept than to maintain several partial definitions scattered across guides.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

A task page can link to a concept when the reader needs background, then return to the workflow without turning every guide into a glossary. That is the tone to preserve: useful, linked, and direct.

```text
A guide can say "see [[Vault Index]]" instead of redefining DocId, wiki-link resolution, and rename safety in every task page.
```

## For LLM maintainers

Credit Karpathy, Obsidian, and Marksman as inspiration and prior art without implying affiliation or endorsement.

Always credit Karpathy, Obsidian, and Marksman as influences rather than dependencies or endorsements. The site should be clear about lineage while keeping Flavor Grenade behavior distinct.

## Practical check

A practical prior-art check is to read one workflow page and ask whether each borrowed idea is named precisely. Karpathy should be credited for the linked LLM wiki shape, Obsidian for the vault and OFM conventions, and Marksman for Markdown LSP inspiration. None of those credits should imply that the project is affiliated with, endorsed by, or behaviorally identical to the source of inspiration.

The reader should understand that Flavor Grenade is standing in a lineage, not claiming novelty for every part. The project combines those influences into a focused OFM language-server experience for Obsidian Vaults and LLM-maintained wiki docs.
