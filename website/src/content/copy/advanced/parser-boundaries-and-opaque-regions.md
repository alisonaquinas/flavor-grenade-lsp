---
title: "Parser Boundaries and Opaque Regions | Flavor Grenade LSP"
description: "Review parser ordering, opaque-region marking, token parsing, and conservative edge cases."
h1: "Parser Boundaries and Opaque Regions"
summary: "Review parser ordering, opaque-region marking, token parsing, and conservative edge cases."
related: ["conceptOpaqueRegions","howToOpaqueRegions","conceptDiagnostics"]
---

# Parser Boundaries and Opaque Regions

Review parser ordering, opaque-region marking, token parsing, and conservative edge cases.

## Opaque first

The opaque-region pass runs before token parsing so code, math, comments, and templates can be skipped safely.

Ordering is the key design point. Once a region is marked opaque, later token parsers can ignore its text and avoid turning examples into diagnostics, references, tags, or rename targets.

```text
```markdown
[[Example Link]]
```
```

## Token parsing

After opaque regions are marked, wiki links, Markdown links, tags, embeds, headings, and blocks can be parsed as real OFM tokens.

That gives the parser a clean split between examples and content. It also makes future parser changes easier to reason about because each token type shares the same skip rules.

## Conservative edge cases

Ambiguous or unsupported syntax should stay quiet rather than produce false diagnostics.

Quiet behavior is not a lack of ambition here; it is what keeps users from distrusting the tool. A false positive in generated or example text is more damaging than an omitted warning.

## Practical check

Parser-boundary examples should pair one real token with one lookalike token in code, math, comment, frontmatter, or template text. The real token demonstrates normal OFM behavior; the lookalike demonstrates why opaque marking happens before token parsing.

That pattern is important for LLM-maintained docs because guide pages contain many examples that look like real vault content. The article should make it clear that fenced snippets are teaching material, not indexed relationships, unless the example is intentionally moved into normal prose for verification in a real vault.
