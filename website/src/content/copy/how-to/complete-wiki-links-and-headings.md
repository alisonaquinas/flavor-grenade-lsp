---
title: "Complete Wiki-links and Headings | Flavor Grenade LSP"
description: "Use vault-aware completion for notes, headings, tags, embeds, and attachments."
h1: "Complete Wiki-links and Headings"
summary: "Let the editor suggest notes, headings, tags, embeds, and attachments from your vault."
related: ["conceptCompletions","conceptVaultIndex","howToUseTagsCompletion"]
---

# Complete Wiki-links and Headings

Let the editor suggest notes, headings, tags, embeds, and attachments from your vault.

## When to use it

Use this page when you want to create local Markdown without memorizing exact note names, heading text, tag spellings, or attachment paths.

Flavor Grenade is flavor-aware: it understands common Obsidian-flavored Markdown shapes and plain Markdown shapes together. That means completion can help with wiki links, heading anchors, embeds, Markdown links, Markdown images, and tags while still respecting the syntax you are already writing.

Completion is also a quick health check. If suggestions come from your vault, the server has found the vault, indexed its notes, and can connect the current file to the rest of the workspace.

## Steps

Work in a vault folder so completion has more than the current file to draw from.

Try note completion first, then heading completion, then tag or attachment completion. That order makes missing suggestions easier to diagnose because each step depends on the vault index and the local link context.

### Trigger note completion

Type `[[Pro` in a vault note and choose a note suggestion. The suggestion should use a vault-relative target, not an absolute path.

### Narrow to headings

Type `[[Project Plan#` to ask for headings inside that note.

### Complete Markdown links and images

Use completion inside local Markdown link and image destinations when you want the visible label to stay separate from the target path.

```text
[Project plan](Project Plan.md)
![diagram](assets/diagram.png)
```

### Complete embeds and attachments

Use embed syntax when the target should be displayed inline by tools that support Obsidian-style embeds.

```text
![[Project Plan]]
![[assets/diagram.png]]
```

### Keep the current style

Choose the suggestion shape that matches the way your vault already writes links.

```text
Today connects to [[Project Plan#Open questions]].
```

If the editor shows a hover or document link for the inserted target afterward, that is a useful confirmation that completion inserted something other language features can resolve too.

## Expected result

Completion inserts the selected local target in the expected wiki-link, Markdown-link, image, embed, tag, or heading-anchor shape.

The inserted target should be something navigation, hovers, document links, references, diagnostics, and rename planning can understand later. The link remains local to the vault; Flavor Grenade does not turn unsupported URI schemes or paths outside the vault into completion targets.

## Common failure mode

If the vault has not been indexed yet, note-name suggestions may be thin or missing.

If suggestions are still missing in a vault, wait a moment for indexing and confirm the target file is not ignored.

Also check the exact place where you are typing. Completion is context-sensitive: `[[` asks for notes, `#` inside a resolved note link asks for headings, Markdown image destinations prefer local files, and a tag prefix asks for tags. If the cursor is inside a code fence, math block, comment, frontmatter, or template example, Flavor Grenade keeps quiet on purpose so examples do not turn into real vault relationships.
