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

Use this page when code samples, comments, math, frontmatter, or templates contain text that looks like a wiki link, Markdown link, Markdown image, tag, heading anchor, block reference, or embed but should not act like one.

Flavor Grenade deliberately ignores those regions so examples stay examples. That keeps teaching snippets from turning into false broken-link warnings, false references, unsafe rename edits, or misleading completion targets.

Opaque regions matter because Flavor Grenade is flavor-aware. It recognizes real Obsidian-flavored Markdown and local Markdown relationships in normal prose, but it must not treat every matching string in a code block as a vault relationship.

## Steps

Work in a vault folder with one real link and one example link so the difference is visible.

Put the example inside a code fence and leave the real link in normal prose. Diagnostics and navigation should ignore the example and keep working for the prose link.

### Identify the region

Look for code fences, inline code, math, comments, frontmatter, or Templater blocks.

### Keep examples inside opaque syntax

Put sample links inside a code fence when they are documentation, not real vault references.

### Move real links outside

If a link should resolve, place it in normal Markdown text.

### Check related editor features

Try go to definition, hover, document links, references, highlights, and code actions on both the real link and the example. The real link should participate in vault features. The example should not.

````text
```markdown
[[Example Link]] stays inert in this code fence.
[Example](Missing.md) stays inert too.
![diagram](missing.png) does not become an attachment warning here.
#example/tag is not a vault tag here.
```
````

## Expected result

Link-looking text inside examples stays quiet, while real prose links still participate in vault features.

That lets docs show realistic syntax without filling the vault with fake missing targets. It also keeps semantic tokens, document symbols, folding, selection ranges, hovers, references, diagnostics, code lens, code actions, and rename planning focused on real Markdown content.

For public docs and technical notes, this is usually what you want: examples can be accurate and copyable without polluting the vault index.

## Common failure mode

If a real link is accidentally placed inside a code fence, Flavor Grenade treats it as example text.

Move it back into ordinary prose when you want completion, diagnostics, navigation, references, hovers, document links, code actions, code lens, or rename to see it.

The reverse mistake also happens. If an example is written in ordinary prose, Flavor Grenade may correctly report it as a broken local target because it has no way to know you intended it as documentation. Put examples in code fences, inline code, comments, or another appropriate opaque region when they are not real vault references.
