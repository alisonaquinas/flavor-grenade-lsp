---
title: "Use Tags and Tag Completion | Flavor Grenade LSP"
description: "Complete nested Obsidian tags and find tag references across indexed vault notes."
h1: "Use Tags and Tag Completion"
summary: "Complete nested Obsidian tags and find tag references across indexed vault notes."
related: ["conceptReferencesNavigationTagsEmbeds","conceptCompletions","howToFindReferencesHighlights"]
---

# Use Tags and Tag Completion

Complete nested Obsidian tags and find tag references across indexed vault notes.

## When to use it

Use this page when your vault uses tags as a lightweight graph alongside wiki links.

Tags are a lightweight graph layered over notes and links. Completion helps keep nested tag spelling consistent, while references make it possible to inspect where a tag is actually used. Treat the tag registry as shared vocabulary for project pages, people notes, status notes, and generated wiki maintenance work.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Start with a tag prefix that already exists in more than one note, then add a new nested tag. This shows the difference between indexed candidates and new text the server has not seen yet.

### Type a tag prefix

Type `#project/` and select a known nested tag from the vault-wide tag registry.

### Find tag references

Run references on the tag to inspect notes that share the same project or topic.

### Keep tags outside opaque examples

Tags inside code fences and comments are examples, not indexed tag facts.

```text
#project/flavor-grenade
#project/flavor-grenade/docs
```

## Expected result

The tag candidate or reference result reflects tags parsed from indexed vault notes.

The tag candidate should preserve the nested path you chose, and references should find the same tag in indexed notes. This helps maintain project taxonomies without relying on memory.

## Common failure mode

A tag typed before indexing completes may not have vault-wide suggestions yet.

Tags inside code fences, comments, and templates should not become indexed facts. If a tag is missing from completion, confirm it appears in normal Markdown and that indexing has finished.
