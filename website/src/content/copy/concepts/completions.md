---
title: "Completions | Flavor Grenade LSP"
description: "Understand context-routed completions for links, headings, tags, attachments, flavor snippets, and structured profiles."
h1: "Completions"
summary: "Completions suggest the links, headings, tags, files, snippets, and structured sections that fit where you are typing."
related: ["conceptVaultIndex","conceptWikiLinkResolution","howToCompleteWikiLinksHeadings"]
---

# Completions

Completions suggest the links, headings, tags, files, snippets, and structured sections that fit where you are typing.

## In plain English

Completion looks at the cursor, the trigger text, the project index, the configured Markdown flavor, and any structured profiles. Then it offers suggestions that make sense in that spot.

Typing inside `[[...]]` should suggest notes or headings. Typing a Markdown link target can suggest local files or headings. Typing a tag prefix should suggest tags. In a structured document, heading completion can suggest the next expected section.

Flavor snippets are also context-aware. They should help insert syntax for the active Markdown flavor instead of offering every possible Markdown convention at once.

## In a project

The example starts with a wiki-link note prefix and then narrows to a heading prefix, which is how many people build precise links while writing.

```text
Typing [[Pro can suggest [[Project Plan]] and typing [[Project Plan# can suggest its headings.
```

For Markdown links, the same project model can suggest local files or headings:

```text
Typing [overview](./do can suggest ./docs/overview.md.
```

## Why it matters

Be clear that project-wide completion depends on project detection. A loose file can be parsed, but it does not give Flavor Grenade a full index to search.

## Try this

Type `[[Pro` in a project with `Project Plan.md`, then type `[[Project Plan#` after the note exists. The first completion proves note candidates came from the index; the second proves heading candidates came from the resolved target. If either candidate is missing, the article should guide users toward root detection, indexing, and trigger context.

If suggestions are missing, check the basics first: was the project detected, did indexing finish, is the flavor what you expect, and is the cursor in a place where that completion applies?

The suggestion list should feel local to the moment. A note prefix should not bury you in tags, and a heading prefix should come from the note or file you already named. That is why completion depends on both the index and the exact text around the cursor. The context tells Flavor Grenade which part of the project is useful right now.
