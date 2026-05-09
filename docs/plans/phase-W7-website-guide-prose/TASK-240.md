---
id: "TASK-240"
title: "Article: Use the VS Code Extension"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, how-to, article]
aliases: ["TASK-240"]
---

# Article: Use The VS Code Extension

> [!INFO] `TASK-240` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain the Marketplace install path and why it is the recommended setup.
- Include sections for prerequisites, install, activation, first status check,
  first completion check, and troubleshooting.
- Use concrete vault examples: `.obsidian/`, `.flavor-grenade.toml`,
  `notes/Daily Note.md`, and `[[People/Ada Lovelace]]`.

## Asset Scope

- Link to the Visual Studio Marketplace.
- Reuse existing extension marketplace screenshots for OFMarkdown mode, status,
  and wiki-link completion where available.
- Include a copyable or selectable sample note snippet.

## Draft Article Copy

# Use the VS Code Extension

The VS Code extension is the recommended way to use Flavor Grenade LSP. It
packages the language server, starts it for Obsidian-style Markdown workspaces,
and connects VS Code features such as completion, diagnostics, rename,
references, and go-to definition.

Use this path when you want VS Code to manage the server for you. Direct LSP
setup is for advanced editor integrations.

## Prerequisites

- VS Code is installed.
- You have an Obsidian Vault or a Markdown folder that follows Obsidian
  conventions.
- The vault root contains `.obsidian/` or `.flavor-grenade.toml`.
- You can open and edit a note such as `notes/Daily Note.md`.

Example vault:

```text
MyVault/
  .obsidian/
  .flavor-grenade.toml
  notes/
    Daily Note.md
    People/
      Ada Lovelace.md
```

## Install

Open the Visual Studio Marketplace listing for Flavor Grenade LSP and install
the extension. Reload VS Code if prompted.

After installation, open the vault folder itself:

```text
File > Open Folder... > MyVault
```

Choose the folder that contains `.obsidian/` or `.flavor-grenade.toml`, not only
the `notes/` subfolder and not a parent folder that contains multiple unrelated
projects.

## Activate the Extension

Open a Markdown note inside the vault, for example:

```text
notes/Daily Note.md
```

The note should be handled as Obsidian Flavored Markdown when the extension
recognizes the workspace. The server indexes vault-local notes, headings, tags,
links, embeds, and attachments from that vault.

## First Status Check

Use a small note that exercises the vault index:

```markdown
# Daily Note

Today I am reading [[People/Ada Lovelace]].

Follow up on [[Missing Note]].
```

Expected result:

- `[[People/Ada Lovelace]]` resolves if `notes/People/Ada Lovelace.md` exists.
- `[[Missing Note]]` reports a broken-link diagnostic until the target exists or
  the link is corrected.
- The extension status shows the server is ready when available in the UI.

## First Completion Check

In `notes/Daily Note.md`, type:

```markdown
[[People/A
```

Trigger completion. Choose `People/Ada Lovelace` from the list.

Expected result:

```markdown
[[People/Ada Lovelace]]
```

Completion candidates come from the current vault index. If the target note was
created recently, save it and give the index a moment to refresh.

## Troubleshooting

If the extension does not activate, confirm that VS Code opened the vault root
and that the workspace is trusted.

If completions are empty, check that the target note is inside the vault and has
a supported Markdown file extension.

If diagnostics look wrong, confirm the link is local. External URLs and
unsupported URI schemes are not treated as vault notes.

If the server still appears inactive, reload the VS Code window and reopen a
vault note. If the problem persists, capture the vault structure, the note
snippet, and the expected target before filing an issue.

## Definition of Done

- [ ] Article route exists and is linked from How-To hub and dropdown.
- [ ] Prose includes when to use it, steps, expected result, and failure mode.
- [ ] Asset or screenshot evidence is present.
- [ ] Route metadata, sitemap, and tests include the article.
