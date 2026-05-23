---
id: "TASK-247"
title: "Article: Use Tags and Tag Completion"
type: task
status: done
priority: medium
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-247"]
---

# Article: Use Tags And Tag Completion

> [!INFO] `TASK-247` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `done`

## Text Scope

- Explain tag indexing, nested tag completion, and tag references.
- Include steps for completing and finding a tag.
- Use examples: `#project/flavor-grenade`, `#people/research`, and
  frontmatter tags if supported.

## Asset Scope

- Reuse `tag-completion-references.png` if available.
- Include tag query examples.

## Draft Article Copy

# Use Tags and Tag Completion

Tags let you group notes across folders without changing their paths. Flavor
Grenade indexes vault tags so completion and references can work across the
opened vault.

Common examples:

```markdown
#project/flavor-grenade
#people/research
#status/waiting
```

## Complete a Nested Tag

In a note, type:

```markdown
#project/
```

Trigger completion. Existing vault tags may appear:

```text
#project/flavor-grenade
#project/website
#project/archive
```

Choose the tag you want.

Expected result:

```markdown
#project/flavor-grenade
```

Completion candidates come from tags already indexed in the vault.

## Find Tag References

Place the cursor on a tag:

```markdown
#people/research
```

Run find references.

Expected result: VS Code lists notes that use the same tag.

Example results:

```text
notes/People/Ada Lovelace.md
notes/Research/Reading List.md
```

## Inline Tags

Inline tags are written in the note body:

```markdown
# Project Notes

Discuss extension docs. #project/flavor-grenade #status/waiting
```

Expected result: both tags are indexed when they appear in normal Markdown body
text.

## Frontmatter Tags

Supported YAML frontmatter tags also participate in the vault tag registry:

```yaml
---
tags:
  - project/flavor-grenade
  - people/research
---
```

Expected result: the tags behave like `#project/flavor-grenade` and
`#people/research` for tag lookup and references.

If your installed version reports malformed frontmatter, fix the YAML before
expecting frontmatter tags to appear.

## Avoid False Tags

Tags inside opaque regions are ignored:

````markdown
```text
#project/example-only
```
````

Expected result: `#project/example-only` is not added to the tag registry.

## Tag Query Examples

Use references to answer practical questions:

- Which notes are tagged `#project/flavor-grenade`?
- Which research notes use `#people/research`?
- Which waiting items use `#status/waiting`?

## Troubleshooting

If a tag does not complete, confirm it already exists somewhere in the vault and
is saved.

If references miss a note, check whether the tag is in code, math, comments, or
malformed frontmatter.

If two tag styles are mixed, standardize on one spelling. `#project/flavor` and
`#projects/flavor` are different tags.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose distinguishes inline tags and supported frontmatter behavior.
- [ ] Tag evidence is present.
- [ ] Route metadata, sitemap, and tests include the article.
