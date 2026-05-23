---
title: "Use Tags and Tag Completion | Flavor Grenade LSP"
description: "Complete nested Obsidian tags and find tag references across indexed vault notes."
h1: "Use Tags and Tag Completion"
summary: "Keep tag spelling consistent and find where a tag is used across your vault."
related: ["conceptReferencesNavigationTagsEmbeds","conceptCompletions","howToFindReferencesHighlights"]
---

# Use Tags and Tag Completion

Keep tag spelling consistent and find where a tag is used across your vault.

## When to use it

Use this page when tags are part of how your vault groups projects, people, topics, or status.

Completion helps keep nested tag spelling consistent. References help you see where a tag already appears before you rename or split it.

## Steps

Work in a vault folder so tag suggestions come from more than the current note.

Start with a tag prefix that already exists in more than one note, then try a new nested tag so the difference is easy to see.

### Type a tag prefix

Type `#project/` and select a known nested tag from your vault.

### Find tag references

Run references on the tag to inspect notes that share the same project or topic.

### Keep tags outside opaque examples

Tags inside code fences and comments are examples, not real tag usage.

```text
#project/flavor-grenade
#project/flavor-grenade/docs
```

## Expected result

The tag suggestion or reference list reflects tags found in indexed vault notes.

That makes tag cleanup less dependent on memory and more grounded in the notes you already have.

## Common failure mode

A tag typed before indexing finishes may not have vault-wide suggestions yet.

If a tag is missing from completion, confirm it appears in normal Markdown, outside code fences or comments, and that indexing has finished.

If you are cleaning up a tag family, check references before changing the spelling. That gives you a list of notes that use the old tag and helps you decide whether the tag is truly obsolete, just misspelled, or still useful in another part of the vault. Tags are small, but they carry a lot of organizational meaning.
