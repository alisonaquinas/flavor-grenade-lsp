---
id: "TASK-252"
title: "Concept Article: Wiki-link Resolution"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, concepts, article]
aliases: ["TASK-252"]
---

# Concept Article: Wiki-link Resolution

> [!INFO] `TASK-252` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain how a wiki-link target is classified as a document, heading, block,
  alias, embed, or attachment reference.
- Cover resolution boundaries for vault-local targets versus external URLs,
  unsupported URI schemes, and paths outside the vault.
- Show practical examples for `[[Project Plan]]`,
  `[[Project Plan#Open questions]]`, and `![[diagram.png]]`.

## Asset Scope

- Include a resolution examples table with input syntax, target kind, and
  expected editor behavior.
- Include a small Markdown snippet with resolved and unresolved links.

## Draft Article Copy

### How does a wiki-link find its target?

A wiki-link is resolved by first understanding what kind of target it names, then checking only vault-local data. `[[Project Plan]]` can name a document. `[[Project Plan#Open Questions]]` names a document plus heading. `[[Project Plan#^decision-1]]` names a document plus block anchor. `![[diagram.png]]` may name a local attachment instead of a Markdown note.

Compact definition: wiki-link resolution is the vault-aware process that turns Obsidian link syntax into a document, heading, block anchor, alias target, embed target, or attachment target while leaving external and unsupported targets outside vault edits.

Flavor Grenade's Oracle resolves wiki-link document names with a predictable order: exact DocId path, frontmatter alias, unique filename stem, then unique H1 title. If the target is missing, diagnostics can report a broken link. If more than one candidate matches, diagnostics can report ambiguity instead of guessing.

Examples:

| Input syntax | Target kind | Expected editor behavior |
| --- | --- | --- |
| `[[Project Plan]]` | Document | Complete note names, go to the note, find backlinks, rename supported references |
| `[[notes/Project Plan]]` | Exact DocId path | Prefer exact vault-relative document match |
| `[[Launch Notes]]` | Frontmatter alias | Resolve when a note declares `aliases: [Launch Notes]` |
| `[[Project Plan#Open Questions]]` | Heading in document | Navigate to heading; diagnose missing or ambiguous heading |
| `[[#Open Questions]]` | Same-document heading | Navigate within current note |
| `[[Project Plan#^decision-1]]` | Block anchor | Navigate to `^decision-1`; diagnose missing block anchor |
| `![[Project Plan]]` | Markdown embed | Resolve to note content for navigation and diagnostics |
| `![[diagram.png]]` | Attachment embed | Resolve against indexed local attachments |
| `[site](https://example.com)` | External URL | Ignore for vault diagnostics and rename |
| `[unsafe](app://thing)` | Unsupported scheme | Do not treat as editable vault target |
| `[escape](../outside.md)` | Path outside vault | Do not resolve as a vault edit target |

Concrete snippet:

```markdown
# Daily

Resolved note: [[Project Plan]]
Resolved heading: [[Project Plan#Open Questions]]
Resolved embed: ![[assets/architecture.png]]

Broken note: [[Does Not Exist]]
Broken heading: [[Project Plan#No Such Heading]]
External link: [Obsidian](https://obsidian.md)
Unsupported local-looking URI: [open](vscode://file/example)
```

For maintainers: classify before resolving. Markdown links, images, embeds, wiki-links, same-document anchors, unsupported schemes, and path traversal attempts do not share the same safety rules. A resolver should return broken, ambiguous, malformed, resolved, or non-vault instead of falling through to string replacement.

Related-link intent: link this page from broken-link diagnostics, safe rename, completions, and navigation docs. Outgoing links should point to DocId and Vault-Relative Paths, Vault Index, Diagnostics, Rename Safety, and Opaque Regions.

## Definition of Done

- [ ] Article route exists and is linked from Concepts hub and dropdown.
- [ ] Article describes target classification and local-only boundaries.
- [ ] Examples table is present.
- [ ] Route metadata, sitemap, and tests include the article.
