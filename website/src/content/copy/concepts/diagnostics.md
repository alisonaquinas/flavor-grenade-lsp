---
title: "Diagnostics | Flavor Grenade LSP"
description: "Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets."
h1: "Diagnostics"
summary: "Diagnostics are careful warnings about local vault links Flavor Grenade can actually reason about."
related: ["conceptWikiLinkResolution","conceptOpaqueRegions","howToFixBrokenLinks"]
---

# Diagnostics

Diagnostics are careful warnings about local vault links Flavor Grenade can actually reason about.

## In plain English

Diagnostics are editor warnings. In Flavor Grenade, they should appear when a local vault reference looks broken and there is enough context to say so safely.

They should not complain about web links, email links, or targets the tool cannot classify.

## In a vault

This example contrasts a missing vault note with an external URL. One belongs to the local vault; the other is outside local validation.

```text
[[Missing Note]] can report a broken-link diagnostic while https://example.com remains outside local vault checking.
```

## For future docs

Describe diagnostics as conservative editor feedback. Do not imply Flavor Grenade validates the whole web or every possible Markdown convention.

## Try this

A good diagnostic example should name the local thing the user can fix. `[[Missing Note]]` can produce an actionable warning because creating or correcting the note resolves it. `mailto:team@example.com` should not produce the same warning because the server cannot repair that target through an Obsidian Vault edit.

A useful warning says what local relationship failed and gives the reader a safe next edit.

Good diagnostic copy should be humble. It can say “this local note target is missing” or “this heading could not be found.” It should not imply that every possible future file, every external service, or every editor-specific convention has been checked. Scoped warnings are easier to fix and easier to trust.

When in doubt, diagnostics should favor fewer, clearer warnings over noisy guesses. A quiet editor is better than one that teaches users to ignore it.
