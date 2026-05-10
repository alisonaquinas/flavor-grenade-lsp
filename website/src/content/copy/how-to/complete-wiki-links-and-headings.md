---
title: "Complete Wiki-links and Headings | Flavor Grenade LSP"
description: "Use vault-aware completion for notes, headings, tags, embeds, and attachments."
h1: "Complete Wiki-links and Headings"
summary: "Use vault-aware completion for note names, headings, tags, embeds, and attachments."
related: ["conceptCompletions","conceptVaultIndex","howToUseTagsCompletion"]
---

# Complete Wiki-links and Headings

Use vault-aware completion for note names, headings, tags, embeds, and attachments.

## When to use it

Use this page when you want to type less and select local vault targets from indexed candidates.

Completion is the quickest visible proof that the vault index is useful. It turns indexed notes, headings, blocks, tags, callouts, and attachments into suggestions that match the current OFM context.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Try note completion first, then heading completion, then attachment or tag completion. This order makes it easier to tell whether the missing candidate is an index problem, a target-resolution problem, or just the wrong trigger context.

### Trigger note completion

Type `[[Pro` in a vault note and choose an indexed note candidate.

### Narrow to headings

Type `[[Project Plan#` to request headings from the resolved note.

### Keep the selected style

Use the configured link style so completions match your vault conventions.

```text
Today connects to [[Project Plan#Open questions]].
```

## Expected result

Completion inserts the selected vault target with the expected wiki-link or Markdown-link shape.

The inserted text should match the configured link style and point to a target the server can resolve later. Completion should make the next diagnostic or navigation action more accurate, not merely fill in text.

## Common failure mode

If the vault is not indexed, note-name completion is limited or unavailable because there is no vault graph to query.

In single-file mode, vault-wide note-name completion is unavailable because there is no vault graph. If suggestions are missing in vault mode, wait for indexing and confirm the target file is not ignored.
