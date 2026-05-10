---
id: "TASK-254"
title: "Concept Article: Opaque Regions"
type: task
status: done
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-254"]
---

# Concept Article: Opaque Regions

> [!INFO] `TASK-254` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `done`

## Text Scope

- Explain opaque regions as places where OFM tokens should be ignored, such as
  code fences, inline code, math, comments, frontmatter, and Templater blocks.
- Describe why opaque marking happens before token parsing.
- Clarify which user problems this prevents, especially false diagnostics and
  unsafe edits inside generated or executable snippets.

## Asset Scope

- Include a Markdown snippet showing `[[Example]]` inside parsed and skipped
  regions.
- Include a region behavior table.

## Draft Article Copy

### Why does the parser skip some Markdown regions?

Some text in a note is about OFM syntax, but not active OFM syntax. A code fence may demonstrate `[[Example]]`. A math block may contain brackets. A Templater block may generate Markdown later. A comment may hide draft text. The parser marks these spans before token parsing so the language server does not turn examples or generated snippets into real vault references.

Compact definition: an opaque region is a range of document text where OFM token parsers must ignore wiki-links, embeds, tags, block anchors, and Markdown links. Flavor Grenade currently marks code spans, fenced code blocks, indented code blocks, math, Obsidian comments, HTML comments, and Templater blocks. Frontmatter is parsed first as YAML metadata; aliases and tags from frontmatter enter the graph through the frontmatter path rather than normal body token parsing.

Concrete example:

````markdown
Parsed link: [[Project Plan]]
Parsed tag: #project/flavor-grenade

`Skipped inline code: [[Example]]`

```markdown
Skipped fenced code: [[Example]]
```

$$
Skipped math-ish text: [[Example]]
$$

%% Skipped Obsidian comment: [[Example]] %%

<!-- Skipped HTML comment: [[Example]] -->

<%*
const target = "[[Example]]";
%>
````

Region behavior:

| Region | Example | Parser behavior |
| --- | --- | --- |
| Normal body text | `[[Project Plan]]` | Parsed as a wiki-link |
| Inline code | `` `[[Example]]` `` | Skipped |
| Fenced code | triple-backtick block | Skipped |
| Indented code | four-space code block | Skipped |
| Math | `$$ [[x]] $$` | Skipped |
| Obsidian comment | `%% [[Draft]] %%` | Skipped |
| HTML comment | `<!-- [[Draft]] -->` | Skipped |
| Templater block | `<%* "[[Generated]]" %>` | Skipped |
| Frontmatter | `aliases:` and `tags:` | Parsed as YAML metadata |

This ordering prevents false diagnostics like "Cannot resolve `[[Example]]`" when the text is only sample code. It also protects rename and code-action workflows from editing snippets that may be executable, generated, or intentionally hidden.

For maintainers: add new token parsers after opaque marking, and make each parser check opaque ranges before recording entries. If a future syntax region can contain inactive OFM-looking text, mark it opaque first. If a feature edits references, verify it uses parsed entries rather than scanning raw text.

Related-link intent: link this page from Obsidian Flavored Markdown, Diagnostics, Rename Safety, and any parser-facing advanced docs. It should explain why "I can see `[[Example]]` in the file" does not always mean the server should treat it as a link.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article explains parse ordering and false-positive prevention.
- [ ] Snippet and region table are present.
- [ ] Route metadata, sitemap, and tests include the article.
