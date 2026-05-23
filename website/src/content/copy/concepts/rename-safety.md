---
title: "Rename Safety | Flavor Grenade LSP"
description: "Learn how rename uses resolved local references instead of blind text replacement."
h1: "Rename Safety"
summary: "Safe rename changes links that point to the target and leaves uncertain text alone."
related: ["conceptDocIdVaultRelativePaths","conceptWikiLinkResolution","howToRenameNotesSafely"]
---

# Rename Safety

Safe rename changes links that point to the target and leaves uncertain text alone.

## In plain English

Rename should not be a blind search-and-replace. Flavor Grenade resolves the target first, plans the local edits it understands, and skips cases where guessing could damage unrelated text.

That smaller, more careful edit is the point.

## In a vault

The example keeps the edit local to `[[Project Plan#Risks]]`. It should not rewrite unrelated prose, external URLs, or headings that merely share the same words.

```text
Renaming #Risks can update [[Project Plan#Risks]] while leaving an unrelated external URL unchanged.
```

## For future docs

Use safety-focused language for rename docs. Tell readers to inspect proposed edits and respect skipped ambiguous references.

## Try this

Before a rename article claims broad coverage, test one inbound wiki link, one heading link, one external URL, and one fenced example. The supported inbound references should be candidates for a WorkspaceEdit. The external URL and fenced example should remain untouched because they are not safe vault references to rewrite.

Skipped edits are often protection. Prefer a smaller correct edit over a sweeping replacement that changes examples, external links, or ambiguous matches.

This is the difference between an editor feature and a text macro. Rename should understand the target before changing surrounding files. If the target cannot be resolved, or if two possible targets look the same, the safer behavior is to leave that text for a human review instead of guessing.

The user can always make a manual follow-up edit. The tool should avoid making a confident automated edit when it does not know the target.
