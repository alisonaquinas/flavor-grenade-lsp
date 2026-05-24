---
title: "Opaque Regions | Flavor Grenade LSP"
description: "Learn why the parser skips OFM-looking text inside code, math, comments, and templates."
h1: "Opaque Regions"
summary: "Opaque regions are places where example-looking links should stay quiet."
related: ["conceptObsidianFlavoredMarkdown","conceptDiagnostics","advancedParserBoundaries"]
---

# Opaque Regions

Opaque regions are places where example-looking links should stay quiet.

## In plain English

Code blocks, inline code, math, comments, frontmatter, and Templater blocks often contain examples. Flavor Grenade skips those regions so sample links do not become fake vault facts.

That protects diagnostics, completion, references, and rename from treating documentation snippets as real notes.

## In a vault

A documentation page can show `[[Example Link]]` inside a code fence without creating a missing-link warning. Move the same text into normal prose and it becomes a real vault reference.

```text
A code fence containing [[Example Link]] should remain sample text, not a broken vault link.
```

## Why it matters

Keep sample OFM inside fenced code. When a link should really resolve, put it in normal prose.

## Try this

Put `[[Missing Example]]` inside a fenced code block and `[[Missing Real Note]]` in normal prose. The example should stay quiet while the prose link can produce a missing-target diagnostic. That difference is especially important for guide articles because they need to teach syntax without corrupting the vault graph with demonstration links.

Silence inside those regions is intentional. It means the tool is protecting examples from becoming noise.

This is especially useful on help pages. A guide may need to show a broken link, a fake tag, or a Templater snippet so the reader can learn the syntax. Those examples should not create real diagnostics in the docs vault. When the same text is moved into normal prose, Flavor Grenade can treat it as real content again.

That gives authors a clear choice: put examples in fenced or otherwise opaque syntax, and put real vault relationships in ordinary Markdown.
