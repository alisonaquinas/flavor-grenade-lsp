---
title: "Wiki-link Resolution | Flavor Grenade LSP"
description: "Understand how Flavor Grenade resolves wiki links, aliases, headings, and attachments."
h1: "Wiki-link Resolution"
summary: "Wiki-link resolution connects Obsidian-style links, Markdown links, aliases, headings, and attachments."
related: ["conceptVaultIndex","conceptDiagnostics","howToFixBrokenLinks"]
---

# Wiki-link Resolution

Wiki-link resolution connects Obsidian-style links, Markdown links, aliases, headings, and attachments.

## Compact definition

Resolution classifies the target, checks whether it is local and supported, resolves the vault document or attachment, then narrows to headings or blocks when needed.

Resolution starts by classifying the link target before looking it up. That is how the server keeps local notes separate from external URLs and unsupported schemes.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The alias in the example is display text, not the identity of the target. The target still resolves through the note and heading so rename and diagnostics can reason about it.

```text
[[Project Plan#Risks|risk list]] resolves the note first, then the heading, then the display alias.
```

## For LLM maintainers

Keep external URLs and unsupported schemes separate from editable vault targets.

Use resolution language whenever docs discuss broken links, navigation, or rename. Those features should sound like different uses of one resolver, not separate guessing systems.

## Practical check

To verify the concept, compare `[[Project Plan|plan]]`, `[[Project Plan#Risks]]`, and `https://example.com`. The first two should resolve through the vault model, while the external URL should stay outside local resolution. That distinction is what lets diagnostics and rename be useful without pretending every Markdown target is a vault object.

The reader should leave knowing that resolution is classification plus lookup. Display aliases, heading anchors, and local paths can participate in vault behavior, while external targets keep their Markdown meaning without becoming editable vault facts.
