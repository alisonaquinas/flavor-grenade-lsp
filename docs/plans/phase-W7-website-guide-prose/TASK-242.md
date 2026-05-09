---
id: "TASK-242"
title: "Article: Fix Broken Links"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-242"]
---

# Article: Fix Broken Links

> [!INFO] `TASK-242` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain broken wiki-link, heading anchor, Markdown image attachment, and embed
  diagnostics.
- Include steps for inspecting the diagnostic, creating or correcting the
  target, and confirming the diagnostic clears.
- Use examples: `[[Missing Note]]`, `[[Project Plan#Risks]]`,
  `![diagram](assets/missing.png)`, and `![[diagram.png]]`.

## Asset Scope

- Reuse existing diagnostic or hover screenshot if available.
- Include a before and after Markdown snippet.

## Draft Article Copy

# Fix Broken Links

Broken-link diagnostics point to local references that do not resolve inside the
current vault. They help you catch missing notes, misspelled headings, stale
anchors, Markdown image attachment paths, and embed targets before they spread
through the graph.

Common examples:

```markdown
[[Missing Note]]
[[Project Plan#Risks]]
![diagram](assets/missing.png)
![[diagram.png]]
```

## Read the Diagnostic

Start with the underlined link. The diagnostic tells you what kind of target did
not resolve:

- A wiki-link note target, such as `[[Missing Note]]`.
- A heading anchor, such as `[[Project Plan#Risks]]`.
- A Markdown image attachment path, such as
  `![diagram](assets/missing.png)`.
- An embed target, such as `![[diagram.png]]`.

## Fix a Missing Note

Before:

```markdown
Follow up in [[Missing Note]].
```

Fix it by creating the target note in the vault:

```text
notes/Missing Note.md
```

After:

```markdown
Follow up in [[Missing Note]].
```

Expected result: the diagnostic clears after the file exists and the index
refreshes. When a create-missing-note code action is available, you can use it
instead of creating the file manually.

## Fix a Heading Anchor

Before:

```markdown
Review [[Project Plan#Risks]].
```

Target note:

```markdown
# Project Plan

## Risk Log
```

Either change the link:

```markdown
Review [[Project Plan#Risk Log]].
```

Or rename the heading:

```markdown
# Project Plan

## Risks
```

Expected result: the link resolves to the heading in `Project Plan.md`.

## Fix a Markdown Image Attachment Path

Before:

```markdown
![diagram](assets/missing.png)
```

Confirm the file exists:

```text
MyVault/
  notes/
    Project Plan.md
  assets/
    architecture.png
```

After:

```markdown
![diagram](../assets/architecture.png)
```

Expected result: the path resolves from the note location to an attachment
inside the vault.

## Troubleshooting

If a note exists but the link is still broken, check spelling, spaces,
capitalization, and whether the file is inside the opened vault root.

If a heading exists but the diagnostic remains, check the exact heading text.
Punctuation and repeated headings can make anchors ambiguous.

If a Markdown link uses `https://`, `mailto:`, or another external scheme, it is
not a vault note. Use local paths only for files you want Flavor Grenade to
resolve inside the vault.

Plain Markdown asset links such as `[diagram](assets/architecture.png)` are not
currently reported as missing attachment diagnostics. Use Markdown images or
Obsidian embeds when the target should be validated as an attachment.

If a target was just created, save the file and wait for the vault index to
refresh.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes expected result and common failure mode.
- [ ] Diagnostic asset or equivalent code example is present.
- [ ] Route metadata, sitemap, and tests include the article.
