---
title: "References, Navigation, Tags, and Embeds | Flavor Grenade LSP"
description: "See how references, navigation, tags, highlights, and embeds share one vault graph."
h1: "References, Navigation, Tags, and Embeds"
summary: "References, navigation, tags, highlights, and embeds all use the same local picture of the vault."
related: ["conceptVaultIndex","conceptCompletions","features"]
---

# References, Navigation, Tags, and Embeds

References, navigation, tags, highlights, and embeds all use the same local picture of the vault.

## In plain English

These features look different in the editor, but they all depend on the same indexed vault. That shared map keeps them from disagreeing about notes, tags, and files.

References ask “who points here?” Navigation asks “where does this point?” Tags group notes. Embeds name local files or notes.

## In a vault

This example mixes a tag, note link, and embed because real vault notes often do the same.

```text
#project/flavor-grenade, [[Daily Note]], and ![[diagram.png]] are indexed together for navigation and lookup.
```

## For future docs

Explain these features as different views over shared vault data, not as unrelated parsers. Use the same vocabulary in tickets and public prose so future edits preserve that shared model.

## Try this

A combined check is to create a note with one tag, one wiki link, and one embed, then use navigation and references from each token. The results should feel like different views over the same vault facts. When docs describe those workflows, they should preserve that consistency instead of making each feature sound like a separate parser.

The reader should see tags, embeds, references, and navigation as connected editor behaviors. A fix in the shared vault model can improve several of them at once.

That shared view also makes bugs easier to explain. If navigation and references disagree about the same link, the problem is probably not two unrelated features failing at the same time. It is more likely that the indexed vault facts, link resolution, or ignored-file boundary needs a closer look.

For day-to-day use, this means one good vault model can make several editor actions feel calmer and more predictable.
