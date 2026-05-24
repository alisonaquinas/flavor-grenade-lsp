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

References answer what points here across the vault. Highlights answer the smaller where does this repeat in this file.

Use references before rename planning, before deleting a note, before changing a heading, or before splitting a tag family. Use highlights while editing a single note when you want repeated links, tags, or anchors to stand out without running a vault-wide search.

## Steps

Work in a vault folder so cross-file results come from the same context as navigation and rename.

Run references on a target Flavor Grenade can already resolve. Use the results list, hovers, and document links to understand the shape of the change before you edit or rename anything.

### Choose a resolved target

Place the cursor on a wiki link, Markdown link, Markdown image, tag, heading, block reference, embed, or other local reference.

### Run references or highlights

Use VS Code references for cross-file results and document highlights for repeats in the current note.

Use code lens when it appears above headings or other supported symbols. It gives a compact count or action near the content, while references opens the full result list.

### Review linked context

Read the results list before editing or renaming so you know what will be affected.

```text
[[Project Plan]]
[Project plan](Project Plan.md)
#project/flavor-grenade
![[diagram.png]]
![diagram](assets/diagram.png)
```

## Expected result

The editor shows references from indexed vault notes and highlights from the current document.

That gives you a safer picture than plain text search when links, tags, embeds, Markdown images, headings, and blocks are involved. It also means the result set should line up with diagnostics and rename planning: if Flavor Grenade can resolve the target, it can usually show who points to it and which edits would be safe.

Document symbols, folding ranges, selection ranges, and semantic tokens help you read the results after you open them. Symbols show the note structure, folding lets you collapse unrelated sections, selection ranges make structured Markdown selection more predictable, and token coloring distinguishes recognized links, tags, and headings from ordinary prose.

## Common failure mode

References outside the indexed vault or inside example regions may not appear.

If a known reference is missing, check whether the source note is indexed and whether the text is inside a code fence, math block, comment, frontmatter, or template block.

Another common miss is target mismatch. `[[Project Plan]]`, `[Project plan](Project Plan.md)`, and `![[Project Plan]]` can refer to the same note only when their normalized local target is the same. If one path escapes the vault, uses an unsupported scheme, or points to a different attachment location, it will not be grouped with the target you are inspecting.
