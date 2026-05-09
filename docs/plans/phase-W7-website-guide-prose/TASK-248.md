---
id: "TASK-248"
title: "Article: Work with OFM Opaque Regions"
type: task
status: in-review
priority: medium
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-248"]
---

# Article: Work With OFM Opaque Regions

> [!INFO] `TASK-248` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain why code fences, math, comments, frontmatter, callouts, and Templater
  regions should not create false link diagnostics.
- Include steps for checking whether an apparent link is ignored intentionally.
- Use examples containing `[[Sample Link]]` inside code, math, and comments.

## Asset Scope

- Include a before and after parser-region snippet.
- Add a small table of opaque region types and expected behavior.

## Draft Article Copy

# Work with OFM Opaque Regions

Opaque regions are parts of a note where Markdown-looking text should not behave
like real Obsidian links or tags. Flavor Grenade detects those regions before it
parses wiki-links, tags, embeds, and other vault tokens.

This prevents examples, formulas, comments, and templates from creating false
diagnostics.

## Region Behavior

| Region type | Example | Expected behavior |
| --- | --- | --- |
| Code fence | `` `[[Sample Link]]` `` inside fenced code | Ignored as example text. |
| Inline code | `` `[[Sample Link]]` `` | Ignored as code. |
| Math | `$[[Sample Link]]$` | Ignored as math content. |
| HTML comment | `<!-- [[Sample Link]] -->` | Ignored as comment text. |
| Obsidian comment | `%% [[Sample Link]] %%` | Ignored as comment text. |
| Templater block | `<% tp.file.title %>` | Kept inside template boundary. |
| Frontmatter | YAML at top of file | Parsed as metadata, not body links. |
| Callout body | `> [!NOTE]` content | Parsed as Markdown body except opaque parts inside it. |

## Code Fence Example

This note contains a link example, not a real link:

````markdown
# Parser Notes

```markdown
See [[Sample Link]] for the real target.
```
````

Expected result: `[[Sample Link]]` inside the code fence does not create a
broken-link diagnostic and does not appear as a vault link.

## Math Example

```markdown
Inline math $[[Sample Link]] + x$ should stay math.

$$
[[Sample Link]]
$$
```

Expected result: the wiki-link-looking text inside math is ignored.

## Comment Example

```markdown
<!-- [[Sample Link]] is a reminder, not a real link. -->

%% [[Sample Link]] is hidden Obsidian comment text. %%
```

Expected result: both comments are ignored by link diagnostics.

## Frontmatter Example

```markdown
---
aliases:
  - Sample Link
tags:
  - project/flavor-grenade
---

# Real body starts here
```

Expected result: frontmatter is parsed as metadata. Aliases and supported
frontmatter tags can participate in vault behavior, but wiki-link syntax inside
frontmatter is not treated like a normal body link.

## Before and After

Before moving an example into a code fence:

```markdown
This example mentions [[Missing Example Target]].
```

Expected result: the link may be treated as a real unresolved vault link.

After:

````markdown
```markdown
This example mentions [[Missing Example Target]].
```
````

Expected result: the example is ignored and the false diagnostic disappears.

## Troubleshooting

If an apparent link has no diagnostic, check whether it is inside code, math,
comments, frontmatter, or a Templater region.

If a real link is ignored, move it out of the opaque region:

````markdown
Real link: [[Sample Link]]

```text
Example link: [[Sample Link]]
```
````

If a callout contains a normal body link, it can still be parsed:

```markdown
> [!NOTE]
> Follow [[Project Plan]] after standup.
```

Expected result: the callout is recognized and the body link can still resolve
unless the link is inside an opaque part of the callout.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes practical examples for opaque parsing behavior.
- [ ] Opaque-region table or snippet is present.
- [ ] Route metadata, sitemap, and tests include the article.
