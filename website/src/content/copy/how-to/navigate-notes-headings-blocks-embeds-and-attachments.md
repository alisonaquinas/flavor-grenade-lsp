---
title: "Navigate Notes, Headings, Blocks, Embeds, and Attachments | Flavor Grenade LSP"
description: "Jump from Obsidian-style references to local notes, anchors, embeds, and attachments."
h1: "Navigate Notes, Headings, Blocks, Embeds, and Attachments"
summary: "Jump from a link or embed to the note, heading, block, or file it names."
related: ["conceptReferencesNavigationTagsEmbeds","conceptWikiLinkResolution","howToFindReferencesHighlights"]
---

# Navigate Notes, Headings, Blocks, Embeds, and Attachments

Jump from a link or embed to the note, heading, block, or file it names.

## When to use it

Use this page when you want the editor to follow a local reference for you.

Navigation is the everyday “take me there” action: from a wiki link to a note, from a heading link to a section, or from an embed to the local file.

## Steps

Work in a vault folder so navigation can resolve local targets instead of treating the note as an isolated file.

Place the cursor on one local reference at a time and run go to definition. Compare the result with your vault tree if something opens in an unexpected place.

### Place the cursor on a local reference

Use a wiki link, heading anchor, block reference, embed, or supported attachment.

### Run go to definition

Let Flavor Grenade resolve the target through the vault.

### Confirm the target

Check that the opened note, heading, block, or attachment is inside the vault.

```text
[[People/Ada Lovelace#Notes]]
![[assets/diagram.png]]
```

## Expected result

Navigation lands on the local target without treating external URLs as vault files.

When navigation works, the same target is usually available to references, diagnostics, and rename too.

## Common failure mode

External links, unsupported schemes, and paths outside the vault are intentionally ignored.

If navigation does nothing, check whether the target is external, ambiguous, outside the vault, or sitting inside an example region such as a code fence.
