---
id: "TASK-255"
title: "Concept Article: Diagnostics"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-255"]
---

# Concept Article: Diagnostics

> [!INFO] `TASK-255` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain diagnostics as vault-aware feedback for missing wiki-links, unresolved
  headings, missing attachments, and unsupported local targets.
- Describe how diagnostics should be practical: they should point to a fixable
  vault problem and avoid noisy false positives.
- Include LLM maintainer guidance for adding diagnostics only when resolution
  rules can support them.

## Asset Scope

- Include a diagnostic examples table with syntax, problem, and expected
  message category.
- Reuse an existing diagnostics screenshot if available; otherwise use a
  highlighted Markdown snippet.

## Draft Article Copy

### What should a diagnostic mean in an Obsidian Vault?

A diagnostic should mean "this local vault reference is probably broken, ambiguous, malformed, or unsafe enough to fix." It should not mean "the server saw punctuation that looks interesting." Flavor Grenade reports diagnostics only when vault-aware parsing and resolution have enough context to point at a fixable problem.

Compact definition: diagnostics are LSP messages for OFM problems such as missing notes, unresolved headings, ambiguous targets, malformed wiki-links, missing embeds or attachments, missing block anchors, non-breaking spaces, and malformed YAML frontmatter.

Concrete diagnostic snippet:

```markdown
# Daily

Good note: [[Project Plan]]
Missing note: [[Missing Note]]
Missing heading: [[Project Plan#No Such Heading]]
Missing block: [[Project Plan#^missing-block]]
Missing embed: ![[assets/missing.png]]
External URL, not a vault diagnostic: [site](https://example.com)
Code sample, skipped: `[[Missing Note]]`
```

Diagnostic examples:

| Syntax | Problem | Message category |
| --- | --- | --- |
| `[[Missing Note]]` | No matching note, alias, unique stem, or H1 title | `FG001` broken wiki-link |
| `[[Project Plan#No Such Heading]]` | Document resolves, heading does not | `FG001` broken heading target |
| `[[Project Plan#^missing-block]]` | Document resolves, block anchor does not | `FG005` missing block anchor |
| `[[Duplicate]]` | More than one candidate matches | `FG002` ambiguous target |
| `[[   ]]` | Blank target | `FG003` malformed wiki-link |
| `![[missing.png]]` | Missing attachment or embed target | `FG004` broken embed or attachment |
| `![alt](missing.png)` | Missing local image attachment | `FG004` broken attachment |
| malformed `---` YAML block | Frontmatter could not parse | `FG007` malformed frontmatter |
| body text with `U+00A0` | Non-breaking space in document body | `FG006` whitespace fix |
| `[site](https://example.com)` | External URL | No vault diagnostic |
| `` `[[Missing Note]]` `` | Opaque code sample | No vault diagnostic |

Diagnostics are intentionally bounded. Single-file mode suppresses vault-wide diagnostics because the server cannot see the whole graph. External URLs and known non-vault schemes are not treated as vault targets. Opaque regions are skipped before token parsing, so examples in code, math, comments, and Templater blocks do not become noise.

For maintainers: add a diagnostic only when resolution rules can support it. A good diagnostic has a stable code, a precise range, a message tied to a user action, and tests for the quiet cases as well as the noisy cases. If the server cannot distinguish "outside this vault" from "missing inside this vault", prefer no diagnostic.

Related-link intent: link this page from broken-link how-to docs, Wiki-link Resolution, Opaque Regions, Vault Index, and code-action docs. It should prepare readers to trust diagnostics as targeted vault feedback, not generic Markdown lint.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains diagnostic meaning and noise boundaries.
- [ ] Diagnostic example table or screenshot is present.
- [ ] Route metadata, sitemap, and tests include the article.
