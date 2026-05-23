---
title: "Work with OFM Opaque Regions | Flavor Grenade LSP"
description: "Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens."
h1: "Work with OFM Opaque Regions"
summary: "Keep examples and generated snippets from being mistaken for real vault links."
related: ["conceptOpaqueRegions","advancedParserBoundaries","howToFixBrokenLinks"]
---

# Work with OFM Opaque Regions

Keep examples and generated snippets from being mistaken for real vault links.

## When to use it

Use this page when code samples, comments, math, frontmatter, or templates contain text that looks like a wiki link but should not act like one.

Flavor Grenade deliberately ignores those regions so examples stay examples. That keeps teaching snippets from turning into false broken-link warnings.

## Steps

Work in a vault folder with one real link and one example link so the difference is visible.

Put the example inside a code fence and leave the real link in normal prose. Diagnostics and navigation should ignore the example and keep working for the prose link.

### Identify the region

Look for code fences, inline code, math, comments, frontmatter, or Templater blocks.

### Keep examples inside opaque syntax

Put sample links inside a code fence when they are documentation, not real vault references.

### Move real links outside

If a link should resolve, place it in normal Markdown text.

````text
```markdown
[[Example Link]] stays inert in this code fence.
```
````

## Expected result

Link-looking text inside examples stays quiet, while real prose links still participate in vault features.

That lets docs show realistic syntax without filling the vault with fake missing targets.

## Common failure mode

If a real link is accidentally placed inside a code fence, Flavor Grenade treats it as example text.

Move it back into ordinary prose when you want completion, diagnostics, navigation, references, or rename to see it.
