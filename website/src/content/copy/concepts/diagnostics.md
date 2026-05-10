---
title: "Diagnostics | Flavor Grenade LSP"
description: "Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets."
h1: "Diagnostics"
summary: "Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets."
related: ["conceptWikiLinkResolution","conceptOpaqueRegions","howToFixBrokenLinks"]
---

# Diagnostics

Understand vault-aware diagnostics for broken, ambiguous, malformed, and unsafe targets.

## Compact definition

Diagnostics report local reference problems only when the server has enough vault context to avoid guessing.

A diagnostic should mean the server has enough local context to make a useful claim. It should not complain about external links or targets it cannot safely classify.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

The example contrasts a missing vault note with an external URL. One belongs to the local graph; the other is intentionally outside local vault validation.

```text
[[Missing Note]] can report a broken-link diagnostic while https://example.com remains outside local vault checking.
```

## For LLM maintainers

Describe diagnostics as conservative feedback, not as proof that every possible external or future target has been checked.

Explain diagnostics as conservative editor feedback. Avoid suggesting that the server validates the entire web, every editor convention, or every possible Markdown interpretation.

## Practical check

A good diagnostic example should name the local thing the user can fix. `[[Missing Note]]` can produce an actionable warning because creating or correcting the note resolves it. `mailto:team@example.com` should not produce the same warning because the server cannot repair that target through an Obsidian Vault edit.

The reader should treat diagnostics as scoped claims, not universal validation. A useful warning says what local relationship failed and gives enough context for a user or LLM maintainer to choose the next edit safely without inventing unsupported validation behavior.
