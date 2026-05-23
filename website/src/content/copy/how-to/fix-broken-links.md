---
title: "Fix Broken Links | Flavor Grenade LSP"
description: "Use diagnostics to repair missing notes, headings, embeds, images, and attachments."
h1: "Fix Broken Links"
summary: "Use editor warnings to find local links that no longer point anywhere useful."
related: ["conceptDiagnostics","conceptWikiLinkResolution","howToRenameNotesSafely"]
---

# Fix Broken Links

Use editor warnings to find local links that no longer point anywhere useful.

## When to use it

Use this page when a note link, heading link, Markdown image, or Obsidian embed points to something that is missing or misspelled.

Broken-link warnings are most helpful while writing, cleaning up after rename, or reviewing generated docs. They point to local vault relationships you can actually fix.

## Steps

Work in a vault folder so the warning is based on the same notes and attachments you see in the sidebar.

Read the warning before editing. A missing note, missing heading, missing image, and missing embed each need a different fix.

### Read the diagnostic

Start with the underlined reference and identify what kind of local target it was trying to reach.

### Create or correct the target

Create the missing note, fix the heading text, or update the local attachment path.

### Save and re-check

Save the note and give the vault a moment to refresh before assuming the warning is stale.

```text
[[Missing Note]]
[[Project Plan#Risks]]
![diagram](assets/missing.png)
![[diagram.png]]
```

## Expected result

The warning clears after the local target exists and the link points to it.

That is the useful part: the fix changes the vault relationship, not just the visible text around the warning.

## Common failure mode

Not every Markdown link is treated like a vault target. A normal text link may be valid Markdown without becoming an attachment warning.

External URLs, unsupported schemes, and non-image Markdown links are intentionally left alone so Flavor Grenade does not pretend it can repair the wider web.
