---
title: "References, Navigation, Tags, and Embeds | Flavor Grenade LSP"
description: "See how references, navigation, tags, highlights, and embeds share one vault graph."
h1: "References, Navigation, Tags, and Embeds"
summary: "See how references, navigation, tags, highlights, and embeds share one vault graph."
related: ["conceptVaultIndex","conceptCompletions","features"]
---

# References, Navigation, Tags, and Embeds

See how references, navigation, tags, highlights, and embeds share one vault graph.

## Compact definition

References, definitions, highlights, tags, and embeds read from the same indexed OFM graph so editor actions stay consistent.

These features are different views over the same graph. References ask who points here, navigation asks where this points, tags group notes, and embeds name local attachments or documents.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example mixes a tag, note link, and embed because real vault workflows do the same. The server should keep those relationships consistent across editor actions.

```text
#project/flavor-grenade, [[Daily Note]], and ![[diagram.png]] are indexed together for navigation and lookup.
```

## For LLM maintainers

Explain these features as different views over shared vault data, not as unrelated parsers.

When adding feature docs, link back to the shared graph model. Avoid presenting each editor action as if it parses OFM independently.

## Practical check

A combined check is to create a note with one tag, one wiki link, and one embed, then use navigation and references from each token. The results should feel like different views over the same vault facts. When docs describe those workflows, they should preserve that consistency instead of making each feature sound like a separate parser.

The reader should see tags, embeds, references, and navigation as connected editor behaviors. That framing helps both users and LLM agents predict why a fix in the vault model can improve several features at once instead of chasing isolated symptoms in separate pages.
