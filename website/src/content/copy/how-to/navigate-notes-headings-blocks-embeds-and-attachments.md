---
title: "Navigate Notes, Headings, Blocks, Embeds, and Attachments | Flavor Grenade LSP"
description: "Jump from Obsidian-style references to local notes, anchors, embeds, and attachments."
h1: "Navigate Notes, Headings, Blocks, Embeds, and Attachments"
summary: "Jump from Obsidian-style references to local notes, headings, blocks, embeds, and attachments."
related: ["conceptReferencesNavigationTagsEmbeds","conceptWikiLinkResolution","howToFindReferencesHighlights"]
---

# Navigate Notes, Headings, Blocks, Embeds, and Attachments

Jump from Obsidian-style references to local notes, headings, blocks, embeds, and attachments.

## When to use it

Use this page when you want definition navigation to move from a reference to the local vault target.

Navigation turns the link graph into an editor workflow. Use it when you need to jump from a wiki link, heading anchor, embed, block reference, or attachment reference to the thing it names.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Place the cursor on one local reference at a time and use go to definition. Compare the result with the vault tree so you can spot alias mistakes, heading mismatches, and attachments stored outside the expected folder.

### Place the cursor on a local reference

Use a wiki link, heading anchor, block reference, embed, or supported attachment reference.

### Run go to definition

Let the server resolve the target through the same vault model used by diagnostics.

### Confirm the target

Check that the opened note, heading, block, or attachment is inside the vault boundary.

```text
[[People/Ada Lovelace#Notes]]
![[assets/diagram.png]]
```

## Expected result

Navigation lands on the resolved vault-local target without treating external URLs as editable targets.

Successful navigation should land on the note, heading, block, or attachment inside the vault boundary. The same target should also be eligible for references, diagnostics, and rename where those features apply.

## Common failure mode

Unsupported URI schemes and paths outside the vault are intentionally ignored.

If navigation does nothing, the target may be external, unsupported, ambiguous, or hidden in an opaque region. Check whether diagnostics report the same issue before rewriting the link.
