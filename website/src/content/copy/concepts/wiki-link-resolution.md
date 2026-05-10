---
title: "Wiki-link Resolution | Flavor Grenade LSP"
description: "Understand how Flavor Grenade resolves wiki links, aliases, headings, and attachments."
h1: "Wiki-link Resolution"
summary: "Wiki-link resolution is how Flavor Grenade turns a written link into the local thing it points at."
related: ["conceptVaultIndex","conceptDiagnostics","howToFixBrokenLinks"]
---

# Wiki-link Resolution

Wiki-link resolution is how Flavor Grenade turns a written link into the local thing it points at.

## In plain English

First, Flavor Grenade decides what kind of link it is looking at. Then it checks whether the target is local and supported. Only after that does it look for the note, heading, block, or attachment.

That first classification step keeps local vault links separate from web URLs, email links, and other targets Flavor Grenade should not edit.

## In a vault

In this example, `risk list` is display text. The actual target is still the `Project Plan` note and its `Risks` heading.

```text
[[Project Plan#Risks|risk list]] resolves the note first, then the heading, then the display alias.
```

## For future docs

Use resolution language when writing about broken links, navigation, or rename. Those features are different uses of the same “what does this point to?” question.

## Try this

To verify the concept, compare `[[Project Plan|plan]]`, `[[Project Plan#Risks]]`, and `https://example.com`. The first two should resolve through the vault model, while the external URL should stay outside local resolution. That distinction is what lets diagnostics and rename be useful without pretending every Markdown target is a vault object.

The plain-English version is: decide what kind of target it is, then look it up only if it belongs to the vault.

That rule keeps the tool helpful without becoming reckless. A local note link can be completed, checked, navigated, referenced, and sometimes renamed. A web link can remain a perfectly good Markdown link without being treated as a missing vault note. The difference is not cosmetic; it decides what edits are safe to offer.
