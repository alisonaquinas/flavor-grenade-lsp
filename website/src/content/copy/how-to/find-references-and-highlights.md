---
title: "Find References and Highlights | Flavor Grenade LSP"
description: "Find backlinks, outbound references, tag references, and repeated local references."
h1: "Find References and Highlights"
summary: "See where a note, heading, tag, or local reference is used."
related: ["conceptReferencesNavigationTagsEmbeds","howToRenameNotesSafely","howToUseTagsCompletion"]
---

# Find References and Highlights

See where a note, heading, tag, or local reference is used.

## When to use it

Use this page before changing something that other notes may depend on.

References answer “what points here?” across the vault. Highlights answer the smaller “where does this repeat in this file?”

## Steps

Work in a vault folder so cross-file results come from the same context as navigation and rename.

Run references on a target Flavor Grenade can already resolve. Use the results list to understand the shape of the change before you edit or rename anything.

### Choose a resolved target

Place the cursor on a wiki link, tag, heading, or other local reference.

### Run references or highlights

Use VS Code references for cross-file results and document highlights for repeats in the current note.

### Review linked context

Read the results list before editing or renaming so you know what will be affected.

```text
[[Project Plan]]
#project/flavor-grenade
![[diagram.png]]
```

## Expected result

The editor shows references from indexed vault notes and highlights from the current document.

That gives you a safer picture than plain text search when links, tags, embeds, and headings are involved.

## Common failure mode

References outside the indexed vault or inside example regions may not appear.

If a known reference is missing, check whether the source note is indexed and whether the text is inside a code fence, comment, or template block.
