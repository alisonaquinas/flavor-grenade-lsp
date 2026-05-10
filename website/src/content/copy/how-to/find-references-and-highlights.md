---
title: "Find References and Highlights | Flavor Grenade LSP"
description: "Find backlinks, outbound references, tag references, and repeated local references."
h1: "Find References and Highlights"
summary: "Find backlinks, outbound references, tag references, and repeated local references."
related: ["conceptReferencesNavigationTagsEmbeds","howToRenameNotesSafely","howToUseTagsCompletion"]
---

# Find References and Highlights

Find backlinks, outbound references, tag references, and repeated local references.

## When to use it

Use this page when you need to see where a note, heading, tag, or local target is mentioned.

References answer the question “what depends on this?” before you edit a note, heading, or tag. Highlights answer the smaller question “where does this repeat in the current document?”

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Run references on a resolved target, then compare the result list with a search in your vault. The reference graph should surface OFM-aware relationships that plain text search cannot safely distinguish.

### Choose a resolved target

Place the cursor on a wiki link, tag, heading, or local reference.

### Run references or highlights

Use VS Code references for cross-file results and document highlights for local repeats.

### Review linked context

Use the results list to inspect backlinks before editing or renaming.

```text
[[Project Plan]]
#project/flavor-grenade
![[diagram.png]]
```

## Expected result

The editor shows references derived from the indexed vault graph and the current parsed document.

The reference list should reflect indexed inbound links, tag usages, and local relationships the parser understands. Use the result list before rename or cleanup work so you know the blast radius.

## Common failure mode

References outside the indexed vault or inside opaque regions may not appear.

References can miss content outside the vault, ignored files, and example text inside opaque regions. If a known reference is missing, inspect the syntax and confirm the source document is indexed.
