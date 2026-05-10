---
title: "Completions | Flavor Grenade LSP"
description: "Understand context-routed completions from the vault index, tag registry, and attachments."
h1: "Completions"
summary: "Understand context-routed completions from the vault index, tag registry, and attachments."
related: ["conceptVaultIndex","conceptWikiLinkResolution","howToCompleteWikiLinksHeadings"]
---

# Completions

Understand context-routed completions from the vault index, tag registry, and attachments.

## Compact definition

Completions are LSP suggestions built from indexed notes, headings, blocks, tags, callouts, and attachments, routed by the current OFM context.

Completion is context-routed: candidates depend on where the cursor is, the trigger text, and the indexed source of candidates. That keeps suggestions relevant instead of global.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example starts with a note prefix and then narrows to a heading prefix. That progression mirrors how users build precise OFM references while writing.

```text
Typing [[Pro can suggest [[Project Plan]] and typing [[Project Plan# can suggest its headings.
```

## For LLM maintainers

Do not claim vault-wide note-name completion in single-file mode because no vault index graph is built there.

Be explicit that vault-wide note completion depends on vault mode. Single-file mode can parse the open document, but it does not have a vault graph for note-name suggestions.

## Practical check

Type `[[Pro` in a vault with `Project Plan.md`, then type `[[Project Plan#` after the note exists. The first completion proves note candidates came from the index; the second proves heading candidates came from the resolved target. If either candidate is missing, the article should guide users toward root detection, indexing, and trigger context.

The reader should know how to diagnose missing candidates. Ask whether the vault was detected, whether indexing finished, whether the cursor is in an OFM context, and whether the target is hidden by ignore rules or opaque syntax.
