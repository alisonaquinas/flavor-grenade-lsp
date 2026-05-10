---
title: "Opaque Regions | Flavor Grenade LSP"
description: "Learn why the parser skips OFM-looking text inside code, math, comments, and templates."
h1: "Opaque Regions"
summary: "Learn why the parser skips OFM-looking text inside code, math, comments, and templates."
related: ["conceptObsidianFlavoredMarkdown","conceptDiagnostics","advancedParserBoundaries"]
---

# Opaque Regions

Learn why the parser skips OFM-looking text inside code, math, comments, and templates.

## Compact definition

Opaque regions protect code, math, comments, frontmatter, and Templater blocks from false link and tag parsing.

Opaque regions are parsed before tokens so examples, code, math, comments, and templates do not produce fake vault facts. They protect both diagnostics and the index.

## Vault example

Use this example as the public vocabulary for humans and LLM maintainers.

A documentation page can show `[[Example Link]]` inside a code fence without creating a missing-link warning. Moving the same text into normal prose changes its meaning.

```text
A code fence containing [[Example Link]] should remain sample text, not a broken vault link.
```

## For LLM maintainers

When documenting examples, use opaque regions so LLM-maintained pages do not create fake diagnostics.

When LLM agents generate examples, keep sample OFM inside fenced code. When the text should be a real vault relationship, keep it outside opaque syntax.

## Practical check

Put `[[Missing Example]]` inside a fenced code block and `[[Missing Real Note]]` in normal prose. The example should stay quiet while the prose link can produce a missing-target diagnostic. That difference is especially important for guide articles because they need to teach syntax without corrupting the vault graph with demonstration links.

The reader should understand that silence inside opaque regions is intentional. The server is protecting examples, generated snippets, comments, math, and templates from becoming false positives in user-facing editor features, especially on pages that teach OFM syntax by showing inert samples.
