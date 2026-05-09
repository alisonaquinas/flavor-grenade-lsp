---
id: "TASK-245"
title: "Article: Navigate Notes, Headings, Blocks, Embeds, and Attachments"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-245"]
---

# Article: Navigate Notes, Headings, Blocks, Embeds, And Attachments

> [!INFO] `TASK-245` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain go-to definition and follow-link behavior for notes, headings, block
  references, embeds, and attachments.
- Include steps for navigating each target kind.
- Use examples: `[[Daily Note]]`, `[[Project Plan#Risks]]`,
  `[[Project Plan#^block-id]]`, and `![[diagram.png]]`.

## Asset Scope

- Reuse reference or code-lens screenshots where available.
- Include a target-kind table.

## Draft Article Copy

# Navigate Notes, Headings, Blocks, Embeds, and Attachments

Use go-to definition or follow link to move from a reference to its vault-local
target. Flavor Grenade resolves Obsidian-style notes, heading anchors, block
anchors, embeds, and attachments when they point inside the current vault.

## Target Kinds

| Link | Target kind | Expected result |
| --- | --- | --- |
| `[[Daily Note]]` | Note | Opens `Daily Note.md`. |
| `[[Project Plan#Risks]]` | Heading | Opens `Project Plan.md` at `## Risks`. |
| `[[Project Plan#^block-id]]` | Block anchor | Opens the matching `^block-id`. |
| `![[diagram.png]]` | Embed attachment | Opens `diagram.png` when local. |
| `[diagram](../assets/diagram.png)` | Markdown attachment | Opens the relative file path. |

## Navigate to a Note

Reference:

```markdown
Today continues in [[Daily Note]].
```

Target:

```text
notes/Daily Note.md
```

Place the cursor on the link and run go-to definition.

Expected result: VS Code opens `notes/Daily Note.md`.

## Navigate to a Heading

Reference:

```markdown
Review [[Project Plan#Risks]] before the meeting.
```

Target:

```markdown
# Project Plan

## Risks

- Missing owner for launch notes.
```

Expected result: VS Code opens `Project Plan.md` at `## Risks`.

## Navigate to a Block

Reference:

```markdown
Quote the decision: [[Project Plan#^launch-decision]]
```

Target:

```markdown
Launch date remains tentative until QA signs off. ^launch-decision
```

Expected result: VS Code opens the note at the block anchor.

## Navigate to an Embed or Attachment

Embed:

```markdown
![[diagram.png]]
```

Markdown image:

```markdown
![Architecture](../assets/diagram.png)
```

Expected result: navigation opens the local attachment when the file exists
inside the vault boundary.

## Practical Checks

If navigation jumps to the wrong file, check whether multiple notes share the
same basename.

If heading navigation fails, check that the heading text matches and that the
target note is the one you intended.

If block navigation fails, confirm the block anchor is valid and unique enough
for the current target.

If an attachment does not open, confirm the path is local. External URLs and
unsupported URI schemes are not vault attachments.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose distinguishes note, heading, block, embed, and attachment targets.
- [ ] Navigation evidence is present.
- [ ] Route metadata, sitemap, and tests include the article.
