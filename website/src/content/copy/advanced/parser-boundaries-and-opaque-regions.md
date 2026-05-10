---
title: "Parser Boundaries and Opaque Regions | Flavor Grenade LSP"
description: "Review parser ordering, opaque-region marking, token parsing, and conservative edge cases."
h1: "Parser Boundaries and Opaque Regions"
summary: "Learn why Flavor Grenade reads examples differently from real vault text."
related: ["conceptOpaqueRegions","howToOpaqueRegions","conceptDiagnostics"]
---

# Parser Boundaries and Opaque Regions

Learn why Flavor Grenade reads examples differently from real vault text.

## Opaque first

Flavor Grenade marks code, math, comments, and templates before looking for vault tokens inside the document.

That order matters. Once a region is marked as an example-like area, later parsing can ignore it and avoid turning snippets into diagnostics, references, tags, or rename targets.

````text
```markdown
[[Example Link]]
```
````

## Token parsing

After example-like regions are marked, normal prose can be parsed for wiki links, Markdown links, tags, embeds, headings, and blocks.

That gives the parser a clean split between examples and real content. It also keeps future parser changes easier to reason about because each token type shares the same skip rules.

## Conservative edge cases

Ambiguous or unsupported syntax should stay quiet rather than produce false warnings.

That quiet behavior builds trust. A false warning in generated or example text is worse than skipping something the tool cannot classify safely.

## Practical check

Parser-boundary examples should pair one real token with one lookalike token in code, math, comment, frontmatter, or template text. The real token demonstrates normal vault behavior; the lookalike demonstrates why examples are marked first.

That pattern matters because guide pages contain many examples that look like real vault content. Fenced snippets are teaching material, not indexed relationships, unless the example is intentionally moved into normal prose.

When a parser bug is suspected, reduce the case to one real link and one lookalike example. If the real link works and the example stays quiet, the boundary is doing its job. If both are treated the same, the problem is easier to explain and test.
