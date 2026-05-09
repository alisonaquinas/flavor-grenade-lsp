---
id: "TASK-241"
title: "Article: Configure Obsidian Vaults"
type: task
status: in-review
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-241"]
---

# Article: Configure Obsidian Vaults

> [!INFO] `TASK-241` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `in-review`

## Text Scope

- Explain vault root detection, `.obsidian/`, `.flavor-grenade.toml`, and
  single-folder versus parent-workspace behavior.
- Include steps for opening the vault root, checking indexed files, and
  avoiding generated-output noise.
- Cover expected result and common failure modes for wrong folder roots.

## Asset Scope

- Include an ASCII or Mermaid folder tree showing vault root, notes, assets,
  and config markers.
- Include sample ignore/config snippet if supported by current implementation.

## Draft Article Copy

# Configure Obsidian Vaults

Flavor Grenade works best when VS Code opens the Obsidian Vault root. The vault
root is the folder that contains Obsidian metadata, project configuration, and
the notes you want indexed.

The usual vault markers are:

- `.obsidian/`
- `.flavor-grenade.toml`

## Recommended Folder Shape

Open this folder:

```text
MyVault/
  .obsidian/
  .flavor-grenade.toml
  notes/
    Daily Note.md
    Project Plan.md
    People/
      Ada Lovelace.md
  assets/
    diagram.png
  generated/
    exported-report.md
```

Do not open only this subfolder when you expect full vault behavior:

```text
MyVault/notes/
```

Do not open a broad parent folder unless you mean to work with that whole
workspace:

```text
obsidian-stack/
  MyVault/
  OtherVault/
  generated-output/
```

## Open the Vault Root

In VS Code, use `File > Open Folder...` and choose `MyVault`.

Expected result:

- Notes such as `notes/Daily Note.md` are indexed as vault documents.
- Links such as `[[Project Plan]]` resolve inside the same vault.
- Attachments such as `![[diagram.png]]` resolve when they are inside the vault.

## Check Indexed Files

Create two small notes:

```markdown
<!-- notes/Daily Note.md -->
Today links to [[Project Plan]].
```

```markdown
<!-- notes/Project Plan.md -->
# Project Plan

## Risks
```

In `Daily Note.md`, try go-to definition or completion for `[[Project Plan]]`.

Expected result: the target opens at `notes/Project Plan.md`.

## Keep Generated Output Quiet

Generated Markdown can add noisy links, tags, or headings. Keep exports,
build artifacts, and copied documentation outside the vault when possible.

If your project supports ignore configuration, use it for generated folders such
as:

```toml
# .flavor-grenade.toml
# Example only. Use the supported keys for your installed version.
ignore = ["generated/**", "dist/**"]
```

When ignore options are not available, the safest setup is physical separation:
keep generated files outside the opened vault root.

## Single Folder vs Parent Workspace

Opening `MyVault/` gives the server one clear vault boundary. Vault-relative
paths are predictable:

```text
notes/Daily Note.md -> notes/Daily Note
```

Opening a parent workspace can make the boundary ambiguous if it contains
multiple vaults. In that case, completions or diagnostics may come from the
wrong root or miss files you expected.

## Troubleshooting

If `[[Project Plan]]` does not resolve, check that `Project Plan.md` is inside
the opened vault and not in a sibling folder.

If attachments do not resolve, check the attachment path and confirm the file is
inside the vault boundary.

If every Markdown file in a large workspace appears to be indexed, reopen the
specific vault root instead of the parent folder.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose uses concrete vault paths.
- [ ] Asset evidence explains folder structure.
- [ ] Route metadata, sitemap, and tests include the article.
