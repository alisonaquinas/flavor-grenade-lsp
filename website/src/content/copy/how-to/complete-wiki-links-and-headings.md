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

Use this page when you want to type less and choose a local target instead of remembering the exact note or heading name.

Completion is also a quick health check. If suggestions come from your vault, Flavor Grenade has found and indexed the notes you are working with.

## Steps

Work in a vault folder so completion has more than the current file to draw from.

Try note completion first, then heading completion, then tag or attachment completion. That order makes missing suggestions easier to diagnose.

### Trigger note completion

Type `[[Pro` in a vault note and choose a note suggestion.

### Narrow to headings

Type `[[Project Plan#` to ask for headings inside that note.

### Keep the selected style

Choose the suggestion shape that matches the way your vault already writes links.

```text
Today connects to [[Project Plan#Open questions]].
```

## Expected result

Completion inserts the selected local target in the expected wiki-link or Markdown-link shape.

The inserted link should be something navigation and diagnostics can understand later.

## Common failure mode

If the vault has not been indexed yet, note-name suggestions may be thin or missing.

If suggestions are still missing in a vault, wait a moment for indexing and confirm the target file is not ignored.

Also check the exact place where you are typing. Completion is context-sensitive: `[[` asks for notes, `#` inside a resolved note link asks for headings, and a tag prefix asks for tags. If the cursor is inside a code fence, comment, or other example region, Flavor Grenade keeps quiet on purpose so examples do not turn into real vault edits.
