---
title: "Wiki-link Resolution | Flavor Grenade LSP"
description: "Understand how Flavor Grenade resolves wiki links alongside flavor-aware Markdown links and local targets."
h1: "Wiki-link Resolution"
summary: "Wiki-link resolution is how Flavor Grenade turns Obsidian-style links into local notes, headings, blocks, and files."
related: ["conceptVaultIndex","conceptDiagnostics","howToFixBrokenLinks"]
---

# Wiki-link Resolution

Wiki-link resolution is how Flavor Grenade turns Obsidian-style links into local notes, headings, blocks, and files.

## In plain English

First, Flavor Grenade decides what kind of link it is looking at. Then it checks whether the target is local and supported. Only after that does it look for the note, heading, block, or attachment.

That first classification step keeps local vault links separate from web URLs, email links, and other targets Flavor Grenade should not edit.

Wiki links are one link family. Flavor-aware Markdown also includes normal Markdown links, images, and local attachments. They share the same safety rule: classify first, then resolve only the local targets that the project model can reason about.

## In a vault

In this example, `risk list` is display text. The actual target is still the `Project Plan` note and its `Risks` heading.

```text
[[Project Plan#Risks|risk list]] resolves the note first, then the heading, then the display alias.
```

## Why it matters

Use resolution language when writing about broken links, completions, navigation, hovers, references, rename, or code actions. Those features are different uses of the same "what does this point to?" question.

Use broader link-classification language when the page also covers Markdown links or non-Obsidian flavors.

## Try this

To verify the concept, compare `[[Project Plan|plan]]`, `[[Project Plan#Risks]]`, and `https://example.com`. The first two should resolve through the vault model, while the external URL should stay outside local resolution. That distinction is what lets diagnostics and rename be useful without pretending every Markdown target is a vault object.

Then compare `[plan](Project%20Plan.md)` or `[overview](./docs/overview.md)`. Those are Markdown links, not wiki links, but they can still be local project targets when the configured flavor and project boundary support them.

The plain-English version is: decide what kind of target it is, then look it up only if it belongs to the project.

That rule keeps the tool helpful without becoming reckless. A local note link can be completed, checked, hovered, navigated, referenced, and sometimes renamed. A web link can remain a perfectly good Markdown link without being treated as a missing vault note. The difference is not cosmetic; it decides what edits are safe to offer.
