---
title: "Fix Broken Links | Flavor Grenade LSP"
description: "Use diagnostics to repair missing notes, headings, embeds, images, and attachments."
h1: "Fix Broken Links"
summary: "Use diagnostics and navigation to fix broken local references."
related: ["conceptDiagnostics","conceptWikiLinkResolution","howToRenameNotesSafely"]
---

# Fix Broken Links

Use diagnostics and navigation to fix broken local references.

## When to use it

Use this page when `[[Missing Note]]`, `[[Project Plan#Risks]]`, a Markdown image, or an Obsidian embed does not resolve.

Broken-link diagnostics are meant to catch local references that look like vault targets but do not resolve. They are most useful during writing, rename cleanup, and LLM-maintained documentation passes where stale links can spread quickly.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Classify the target before editing it. A missing note, missing heading, missing Markdown image, and missing Obsidian embed all have different fixes, so read the diagnostic and compare it with the actual vault tree.

### Read the diagnostic

Start with the underlined local reference and identify whether the target is a note, heading, block, image, or embed.

### Create or correct the target

Create the missing note, fix the heading text, or update the vault-relative attachment path.

### Save and re-check

Save the note and wait for the vault index to refresh before assuming the diagnostic is stale.

```text
[[Missing Note]]
[[Project Plan#Risks]]
![diagram](assets/missing.png)
![[diagram.png]]
```

## Expected result

The broken-link diagnostic clears after the supported local target resolves inside the Obsidian Vault.

The diagnostic should clear only after the supported local target exists and the link points to it. That gives you confidence that the repair changed the vault relationship rather than merely hiding the warning text.

## Common failure mode

Plain Markdown asset links such as `[diagram](assets/diagram.png)` are not currently missing attachment diagnostics; use Markdown images or Obsidian embeds for attachment validation.

Some links are intentionally outside this check. Plain external URLs, unsupported URI schemes, and ordinary Markdown asset links that are not images should not be treated like missing vault notes.
