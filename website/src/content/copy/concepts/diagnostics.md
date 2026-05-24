---
title: "Diagnostics | Flavor Grenade LSP"
description: "Understand flavor-aware diagnostics for links, Markdown flavors, and structured profiles."
h1: "Diagnostics"
summary: "Diagnostics are careful warnings about local targets, Markdown flavors, and structured document conventions."
related: ["conceptWikiLinkResolution","conceptOpaqueRegions","howToFixBrokenLinks"]
---

# Diagnostics

Diagnostics are careful warnings about local targets, Markdown flavors, and structured document conventions.

## In plain English

Diagnostics are editor warnings. In Flavor Grenade, they appear when the server has enough context to say that something local, flavor-specific, or profile-specific looks wrong.

They should not complain about web links, email links, or targets the tool cannot classify safely.

Diagnostic codes are grouped by family. Link diagnostics cover broken, ambiguous, malformed, and unsafe local targets. Flavor diagnostics cover syntax that does not match the detected or configured Markdown flavor. Structured-profile diagnostics cover document conventions such as expected sections or heading shapes.

## In a project

This example contrasts a missing local note with an external URL. One belongs to the local project; the other is outside local validation.

```text
[[Missing Note]] can report a broken-link diagnostic while https://example.com remains outside local checking.
```

In a structured profile, a malformed changelog heading can produce a different diagnostic family than a broken local link. That distinction helps users fix the right kind of problem.

## Why it matters

Describe diagnostics as conservative editor feedback. Do not imply Flavor Grenade validates the whole web or every possible Markdown convention.

## Try this

A good diagnostic example should name the local thing the user can fix. `[[Missing Note]]` can produce an actionable warning because creating or correcting the note resolves it. `mailto:team@example.com` should not produce the same warning because the server cannot repair that target through a local Markdown edit.

A useful warning says what local relationship or document convention failed and gives the reader a safe next edit.

Good diagnostic copy should be humble. It can say "this local note target is missing" or "this heading could not be found." It should not imply that every possible future file, every external service, or every editor-specific convention has been checked. Scoped warnings are easier to fix and easier to trust.

When in doubt, diagnostics should favor fewer, clearer warnings over noisy guesses. A quiet editor is better than one that teaches users to ignore it.
