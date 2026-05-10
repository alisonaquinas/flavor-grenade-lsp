---
title: "Work with OFM Opaque Regions | Flavor Grenade LSP"
description: "Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens."
h1: "Work with OFM Opaque Regions"
summary: "Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens."
related: ["conceptOpaqueRegions","advancedParserBoundaries","howToFixBrokenLinks"]
---

# Work with OFM Opaque Regions

Understand why code, math, comments, frontmatter, and templates avoid false OFM tokens.

## When to use it

Use this page when examples or generated regions contain link-looking text that should not affect diagnostics.

Opaque regions protect documentation, generated snippets, math, comments, and template code from being interpreted as real vault content. This is especially important when LLMs maintain pages full of examples.

## Steps

Work through the task in a vault folder so completion, diagnostics, navigation, and rename all use the same indexed context.

Move one example link into a code fence and leave one real link in prose. Diagnostics and navigation should ignore the example while continuing to process the prose link.

### Identify the region

Look for code fences, inline code, math, comments, frontmatter, or Templater blocks.

### Keep examples inside opaque syntax

Put sample links inside a code fence when they are documentation, not vault references.

### Move real links outside

If a link should resolve, place it in normal Markdown text.

```text
```markdown
[[Example Link]] stays inert in this code fence.
```
```

## Expected result

False diagnostics stay quiet for link-looking text inside opaque regions, while real prose links still participate in vault features.

The server should stay quiet about OFM-looking text inside opaque regions and remain active for normal Markdown around it. That keeps examples useful without polluting the vault graph.

## Common failure mode

If a real link is accidentally placed inside a code fence, the server treats it as example text.

If a real link is inside a code fence or template block, the server will treat it as example text. Move it back into ordinary prose when you want it to resolve.
