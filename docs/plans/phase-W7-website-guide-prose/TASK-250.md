---
id: "TASK-250"
title: "Concept Article: Obsidian Flavored Markdown"
type: task
status: done
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-250"]
---

# Concept Article: Obsidian Flavored Markdown

> [!INFO] `TASK-250` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `done`

## Text Scope

- Define Obsidian Flavored Markdown as Markdown plus vault-aware wiki-links,
  embeds, tags, headings, callouts, frontmatter, comments, math, and Templater
  behavior.
- Explain the difference between generic Markdown syntax and vault-local editor
  behavior.
- Show how OFM features affect diagnostics, completions, navigation, and rename.

## Asset Scope

- Include a compact Markdown sample that contains a wiki-link, embed, tag,
  heading link, callout, and frontmatter.
- Include a feature table mapping OFM syntax to language-server behavior.

## Draft Article Copy

### What makes Markdown become Obsidian Flavored Markdown?

Markdown becomes Obsidian Flavored Markdown when plain text syntax is interpreted inside an Obsidian Vault. The difference is not only punctuation. It is local graph meaning: `[[Project Plan]]` names a vault note, `![[diagram.png]]` embeds a local attachment, `#project/flavor-grenade` joins a tag index, and `[[Project Plan#Risks]]` points at a heading inside another file.

Compact definition: Obsidian Flavored Markdown, or OFM, is Markdown plus Obsidian-style vault semantics for wiki-links, embeds, block anchors, tags, callouts, frontmatter, comments, math, Templater regions, Markdown links, images, and local attachments.

Concrete OFM note:

```markdown
---
aliases:
  - Launch Notes
tags:
  - project/flavor-grenade
---

# Project Plan

See [[People/Ada Lovelace#Notes|Ada's notes]] and [[#Open Questions]].

![[assets/architecture.png]]

> [!NOTE]
> Keep the glossary linked to [[Vault Index]].

## Open Questions

Inline tag: #project/flavor-grenade
```

Generic Markdown can render headings, links, code, and blockquotes. OFM asks a vault-aware question on top: does this local reference resolve inside the vault, and what editor feature should it power? That is why Flavor Grenade can complete note names after `[[`, navigate to `[[Project Plan#Open Questions]]`, diagnose a missing attachment in `![[missing.png]]`, and keep rename edits confined to local vault references.

Feature map:

| OFM syntax | Meaning in the vault | Language-server behavior |
| --- | --- | --- |
| `[[Project Plan]]` | Note reference | Completion, definition, references, diagnostics, rename |
| `[[Project Plan#Risks]]` | Heading reference | Heading completion, definition, diagnostics, heading rename |
| `[[Project Plan#^risk-block]]` | Block reference | Block completion, definition, references, missing-block diagnostics |
| `![[diagram.png]]` | Attachment embed | Attachment completion, definition, hover, broken-embed diagnostics |
| `#project/flavor-grenade` | Inline tag | Tag completion, tag references, workspace symbols |
| `> [!WARNING]` | Obsidian callout | Callout completion, folding ranges, semantic tokens |
| `aliases:` in frontmatter | Alternate note names | Wiki-link resolution through frontmatter aliases |
| `tags:` in frontmatter | Metadata tags | Vault-wide tag registry entries |

For maintainers: do not treat OFM as a bag of regexes. The same text can be sample code, generated Templater output, YAML metadata, or a real vault reference depending on where it appears. Parser ordering and opaque-region handling decide whether a token participates in the graph.

Related-link intent: link this page to Wiki-link Resolution for target lookup, Opaque Regions for skipped syntax, Vault Index for shared storage, Diagnostics for feedback, Completions for triggers, and Rename Safety for edits.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Prose distinguishes Markdown syntax from Obsidian Vault semantics.
- [ ] Sample OFM note is present.
- [ ] Route metadata, sitemap, and tests include the article.
