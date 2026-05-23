---
title: "Completions | Flavor Grenade LSP"
description: "Understand context-routed completions from the vault index, tag registry, and attachments."
h1: "Completions"
summary: "Completions suggest the notes, headings, tags, and files that fit where you are typing."
related: ["conceptVaultIndex","conceptWikiLinkResolution","howToCompleteWikiLinksHeadings"]
---

# Completions

Completions suggest the notes, headings, tags, and files that fit where you are typing.

## In plain English

Completion looks at the cursor, the trigger text, and the vault index, then offers suggestions that make sense in that spot.

Typing inside `[[...]]` should suggest notes or headings. Typing a tag prefix should suggest tags. That context keeps the list useful instead of dumping everything in the vault.

## In a vault

The example starts with a note prefix and then narrows to a heading prefix, which is how many people build precise links while writing.

```text
Typing [[Pro can suggest [[Project Plan]] and typing [[Project Plan# can suggest its headings.
```

## For future docs

Be clear that vault-wide note completion depends on vault mode. A loose file can be parsed, but it does not give Flavor Grenade a full vault to search.

## Try this

Type `[[Pro` in a vault with `Project Plan.md`, then type `[[Project Plan#` after the note exists. The first completion proves note candidates came from the index; the second proves heading candidates came from the resolved target. If either candidate is missing, the article should guide users toward root detection, indexing, and trigger context.

If suggestions are missing, check the basics first: was the vault detected, did indexing finish, and is the cursor in a place where OFM completion applies?

The suggestion list should feel local to the moment. A note prefix should not bury you in tags, and a heading prefix should come from the note you already named. That is why completion depends on both the index and the exact text around the cursor. The context tells Flavor Grenade which part of the vault is useful right now.
