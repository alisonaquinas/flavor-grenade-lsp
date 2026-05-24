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

Use this page when a wiki link, heading link, block link, Markdown link, Markdown image, or Obsidian-style embed points to something that is missing, misspelled, outside the vault, or otherwise not a supported local target.

Broken-link diagnostics are most helpful while writing, cleaning up after a rename, or reviewing generated docs. They point to local vault relationships you can actually fix, and they avoid external URLs that Flavor Grenade cannot responsibly repair.

The diagnostics are structured by target kind where relevant. A missing note, missing heading, missing block, missing image, and missing attachment are not the same problem, so the warning text should tell you what kind of target failed.

## Steps

Work in a vault folder so the warning is based on the same notes and attachments you see in the sidebar.

Read the warning before editing. A missing note, missing heading, missing image, broken embed, and unsupported local path each need a different fix.

### Read the diagnostic

Start with the underlined reference and identify what kind of local target it was trying to reach.

Hover the warning when you need more detail. Hovers and diagnostics share the same vault-aware resolution model, so the hover can often confirm whether Flavor Grenade sees a target as a note, heading, block, image, attachment, or unsupported link.

### Create or correct the target

Create the missing note, fix the heading text, update the block id, or correct the local attachment path. For Markdown links and images, make sure the destination is a local vault path when you expect Flavor Grenade to validate it.

### Use quick fixes when offered

Open code actions on the warning. When Flavor Grenade can offer a safe repair, use the editor action instead of hand-editing the target. If no action appears, the safest fix may require your judgement because the intended target is ambiguous.

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

That is the useful part: the fix changes the vault relationship, not just the visible text around the warning. After the repair, go to definition, document links, hovers, references, code lens, and rename planning should all agree about the same local target.

## Common failure mode

Not every Markdown link is treated like a vault target. A normal web link may be valid Markdown without becoming a vault warning.

External URLs, unsupported schemes, and paths that escape the vault are intentionally left alone or reported as unsafe local targets, depending on the syntax. Flavor Grenade should not pretend it can repair the wider web, and it should not plan edits outside the vault boundary.

Another common cause is opaque syntax. If link-looking text lives inside code, math, comments, frontmatter, or a template block, it is treated as an example or generated content instead of a real vault reference.
