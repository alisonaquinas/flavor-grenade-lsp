---
id: "TASK-243"
title: "Article: Rename Notes Safely"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-243"]
---

# Article: Rename Notes Safely

> [!INFO] `TASK-243` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain note rename, heading rename, alias preservation, and vault-confined
  workspace edits.
- Include steps for starting rename, reviewing edits, applying changes, and
  rechecking references.
- Use examples: `[[Project Plan#Open questions]]` and
  `[[Project Plan|planning note]]`.

## Asset Scope

- Include a before and after reference table or snippet.
- Use a small diagram showing inbound references rewritten inside the vault
  boundary.

## Draft Article Copy

# Rename Notes Safely

Use VS Code rename when you want to change a note or heading and update the
vault references that point to it. Flavor Grenade produces vault-confined edits
for supported local references and avoids external URLs or paths outside the
vault.

Rename is useful for:

- Note titles that changed during writing.
- Headings that became clearer after editing.
- Links that should keep their display alias.
- Backlinks that should continue pointing to the same target.

## Example Vault

```text
MyVault/
  notes/
    Project Plan.md
    Daily Note.md
    Meetings.md
```

`Project Plan.md`:

```markdown
# Project Plan

## Open questions
```

Inbound references:

```markdown
<!-- notes/Daily Note.md -->
Review [[Project Plan#Open questions]].

<!-- notes/Meetings.md -->
See [[Project Plan|planning note]].
```

## Rename a Note

Place the cursor on `Project Plan` in a resolved link and run VS Code rename.
Enter the new note name:

```text
Roadmap
```

Expected edits:

| Before | After |
| --- | --- |
| `[[Project Plan#Open questions]]` | `[[Roadmap#Open questions]]` |
| `[[Project Plan|planning note]]` | `[[Roadmap|planning note]]` |

The alias text after `|` stays the same. Readers still see `planning note`, but
the link target changes to `Roadmap`.

## Rename a Heading

Place the cursor on the heading text:

```markdown
## Open questions
```

Run rename and enter:

```text
Decisions Needed
```

Expected edits:

| Before | After |
| --- | --- |
| `## Open questions` | `## Decisions Needed` |
| `[[Project Plan#Open questions]]` | `[[Project Plan#Decisions Needed]]` |

Same-document anchors and file-plus-heading anchors update when the target is
resolved and supported.

## Review Before Applying

VS Code shows a workspace edit preview for rename. Check that the edits stay
inside your vault:

```text
MyVault/
  notes/Daily Note.md
  notes/Meetings.md
  notes/Project Plan.md
```

Do not apply an edit if it touches an unexpected folder. Flavor Grenade is
designed around vault-local edits, so unexpected paths usually mean the wrong
folder is open or the link was not local.

## Recheck References

After applying rename:

1. Run references on the renamed note or heading.
2. Open a known inbound link such as `[[Roadmap#Decisions Needed]]`.
3. Confirm broken-link diagnostics have cleared.

Expected result: inbound references still navigate to the intended note or
heading.

## Ambiguous References

Some links are intentionally skipped. For example:

```text
notes/Project Plan.md
archive/Project Plan.md
```

If `[[Project Plan]]` could mean more than one target, rename should not guess.
Disambiguate the link first, then rename again.

## Troubleshooting

If rename is unavailable, confirm the cursor is on a resolved local note or
heading reference.

If aliases changed unexpectedly, check whether the alias was part of the target
or display text. In `[[Project Plan|planning note]]`, only `Project Plan` is the
target.

If a link did not update, inspect whether it was ambiguous, external, inside an
opaque region, or outside the opened vault.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose explains skipped ambiguous references.
- [ ] Rename evidence is present.
- [ ] Route metadata, sitemap, and tests include the article.
