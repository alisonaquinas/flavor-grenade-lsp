---
id: "TASK-244"
title: "Article: Complete Wiki-links and Headings"
type: task
status: done
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-244"]
---

# Article: Complete Wiki-links And Headings

> [!INFO] `TASK-244` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `done`

## Text Scope

- Explain completion triggers for `[[`, `#`, heading anchors, and aliases.
- Include steps for completing a note link, completing a heading, and choosing
  the right candidate.
- Use examples: `[[Pro`, `[[Project Plan#`, and `#project/`.

## Asset Scope

- Reuse `wiki-link-completion.png`.
- Include a completion candidate list snippet.

## Draft Article Copy

# Complete Wiki-links and Headings

Completion helps you write Obsidian-style links without memorizing exact file
names, headings, block anchors, attachments, callout types, or tags. Candidates
come from the current vault index, so they reflect notes and structures Flavor
Grenade can see inside the opened vault.

## Complete a Note Link

In a note, type:

```markdown
[[Pro
```

Trigger completion. You may see candidates like:

```text
Project Plan
Projects/Flavor Grenade
People/Ada Lovelace
```

Choose `Project Plan`.

Expected result:

```markdown
[[Project Plan]]
```

If `Project Plan.md` has aliases in frontmatter, those aliases can participate
in wiki-link resolution after the link is written. Note-name completion itself
is based on indexed documents and the configured link style.

## Complete a Heading Link

To link directly to a heading, type the note name and `#`:

```markdown
[[Project Plan#
```

Expected candidates:

```text
Overview
Risks
Open questions
```

Choose `Risks`.

Expected result:

```markdown
[[Project Plan#Risks]]
```

This resolves to:

```markdown
# Project Plan

## Risks
```

## Complete Tags

Type a tag prefix:

```markdown
#project/
```

Expected candidates can include tags already used in the vault:

```text
#project/flavor-grenade
#project/research
#project/archive
```

Choose the tag that matches the current note.

Expected result:

```markdown
#project/flavor-grenade
```

## Choose the Right Candidate

Prefer the candidate that matches the target location you expect. If two notes
share the same basename, choose the path that disambiguates the note:

```text
Project Plan
archive/Project Plan
```

For headings, check the note name first and the heading second:

```markdown
[[Project Plan#Risks]]
[[Archive/Project Plan#Risks]]
```

## Troubleshooting

If completion is empty, confirm the target file is inside the opened vault and
saved to disk.

If a new heading does not appear, save the note that contains it and wait for
the index to refresh.

If tag completion misses a tag, check whether the tag appears outside opaque
regions such as code fences, math blocks, or comments. Tags inside those regions
are ignored so examples do not pollute the vault index.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose explains where candidates come from in the vault index.
- [ ] Completion screenshot or snippet is present.
- [ ] Route metadata, sitemap, and tests include the article.
