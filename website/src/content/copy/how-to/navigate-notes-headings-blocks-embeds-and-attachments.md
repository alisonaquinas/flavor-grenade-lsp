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

Navigation is the everyday take-me-there action: from a wiki link to a note, from a heading link to a section, from a block reference to a block id, from a Markdown image to a local file, or from an embed to the content it names.

The same resolution model also powers document links and hovers. If a reference opens as a document link or shows target information on hover, go to definition should usually land on the same local target.

## Steps

Work in a vault folder so navigation can resolve local targets instead of treating the note as an isolated file.

Place the cursor on one local reference at a time and run go to definition. Compare the result with your vault tree if something opens in an unexpected place.

### Place the cursor on a local reference

Use a wiki link, heading anchor, block reference, Markdown link, Markdown image, embed, or supported attachment.

### Run go to definition

Let Flavor Grenade resolve the target through the vault.

You can also use clickable document links when your editor exposes them. They are useful for quick jumps from rendered-looking Markdown syntax while you are still editing the source file.

### Confirm the target

Check that the opened note, heading, block, or attachment is inside the vault.

```text
[[People/Ada Lovelace#Notes]]
[Ada notes](People/Ada Lovelace.md#Notes)
[[Project Plan#^decision-2026]]
![[assets/diagram.png]]
![diagram](assets/diagram.png)
```

## Expected result

Navigation lands on the local target without treating external URLs as vault files.

When navigation works, the same target is usually available to references, diagnostics, hovers, document links, code lens, code actions, and rename planning too. Symbols, folding ranges, selection ranges, and semantic tokens can make the target easier to inspect once you arrive: headings appear as document structure, sections fold cleanly, selections expand by Markdown structure, and token coloring follows the recognized syntax.

## Common failure mode

External links, unsupported schemes, and paths outside the vault are intentionally ignored.

If navigation does nothing, check whether the target is external, ambiguous, outside the vault, spelled differently after Markdown path rules, or sitting inside an example region such as a code fence.

For Markdown links, make sure the destination is local. `[site](https://example.com)` is a valid Markdown link, but it is not a vault target. For images and embeds, confirm the file is inside the vault and that the path matches the actual attachment location.
