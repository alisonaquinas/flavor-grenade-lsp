---
id: "TASK-246"
title: "Article: Find References and Highlights"
type: task
status: open
priority: medium
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-246"]
---

# Article: Find References And Highlights

> [!INFO] `TASK-246` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain references, backlinks, outlinks, document highlights, and code lens.
- Include steps for finding inbound and outbound note references.
- Use examples: `[[Daily Note]]`, `[[People/Ada Lovelace]]`, and
  `#project/flavor-grenade`.

## Asset Scope

- Reuse `reference-code-lens.png` if available.
- Include a simple inbound/outbound reference diagram.

## Draft Article Copy

# Find References and Highlights

References show where a note, heading, tag, or other supported vault symbol is
used. Highlights show repeated uses in the current document. Together they help
you understand how one note fits into the vault graph before you rename, edit,
or delete it.

## Inbound and Outbound Links

```text
People/Ada Lovelace.md
  <- Daily Note.md
  <- Research/Computing History.md

Daily Note.md
  -> People/Ada Lovelace.md
  -> Project Plan.md
```

Inbound references answer: "Which notes point here?"

Outbound references answer: "Where does this note point?"

## Find References to a Note

Example link:

```markdown
Today I read [[People/Ada Lovelace]].
```

Place the cursor on `People/Ada Lovelace` and run find references.

Expected result: VS Code lists vault-local notes that link to
`People/Ada Lovelace.md`, such as:

```text
notes/Daily Note.md
research/Computing History.md
```

## Check Backlinks Before Editing

Before renaming or deleting a note, find references on the target:

```markdown
[[Daily Note]]
```

Expected result: inbound references show the notes that would be affected by
the change.

When reference code lens is available, it can provide a fast count above notes
or headings. Use find references for the detailed list.

## Review Outbound Links

Open a note and scan its local links:

```markdown
# Daily Note

- [[People/Ada Lovelace]]
- [[Project Plan#Risks]]
- #project/flavor-grenade
```

Expected result: navigation and diagnostics confirm whether each outbound target
resolves inside the vault.

## Use Document Highlights

When the cursor is on a supported reference, highlights can mark matching uses
in the same document.

Example:

```markdown
Discuss [[People/Ada Lovelace]] in the intro.
Return to [[People/Ada Lovelace]] in the bibliography.
```

Expected result: both local occurrences are highlighted when the client supports
document highlights for that symbol.

## Find Tag References

Example tag:

```markdown
#project/flavor-grenade
```

Run references on the tag.

Expected result: notes using that tag appear in the reference list. Inline tags
and supported frontmatter tags participate in the tag registry.

## Troubleshooting

If references are missing, confirm the link or tag is local, saved, and inside
the opened vault.

If highlights do not appear, check whether your client supports document
highlights for the current language mode.

If a reference inside a code fence or math block is not counted, that is
intentional. Opaque regions are ignored so examples do not behave like real
links.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes reference and highlight workflows.
- [ ] Reference asset or diagram is present.
- [ ] Route metadata, sitemap, and tests include the article.
