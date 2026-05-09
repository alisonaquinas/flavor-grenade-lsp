---
id: "TASK-260"
title: "Advanced Article: Vault Mode and Single-file Mode"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, advanced, article]
aliases: ["TASK-260"]
---

# Advanced Article: Vault Mode And Single-file Mode

> [!INFO] `TASK-260` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain vault mode detection and the fallback behavior when no vault root is
  available.
- Compare capabilities in vault mode versus single-file mode.
- Cover expected limits for completions, diagnostics, references, and rename
  when the server cannot see the full vault graph.

## Asset Scope

- Include a mode comparison table.
- Include a simple folder example showing when each mode applies.

## Draft Article Copy

# Vault Mode and Single-file Mode

Flavor Grenade has two operating modes:

- Vault mode, where the server has a vault root and can build a vault-wide
  graph.
- Single-file mode, where no vault marker is available and the server keeps
  behavior narrow.

The VS Code extension is the supported path for normal use. Open the vault
folder in VS Code and let the extension start the bundled language server.
Direct LSP clients can use the same server, but they must provide a `file://`
root URI or workspace folder and handle mode expectations themselves.

## How Mode Detection Works

When the server initializes, it records the client root from `rootUri`, or from
the first `workspaceFolders` entry when `rootUri` is absent. The root must be a
`file://` URI.

From that filesystem location, Flavor Grenade walks upward looking for:

1. `.obsidian/`
2. `.flavor-grenade.toml`

If it finds `.obsidian/`, the server uses Obsidian Vault mode. If it finds
`.flavor-grenade.toml`, it uses Flavor Grenade vault mode. If neither marker is
found before the filesystem root, it uses single-file mode.

Detection is intentionally marker-based. Opening a random Markdown project does
not cause a full vault scan unless the folder looks like a vault.

## Folder Examples

Vault mode:

```text
MyVault/
  .obsidian/
  Notes/
    Home.md
    Project.md
```

Open `MyVault/`. The server detects `.obsidian/`, scans the vault, and can use
`Notes/Home` and `Notes/Project` as vault-relative document IDs.

Flavor Grenade vault mode:

```text
DocsProject/
  .flavor-grenade.toml
  docs/
    index.md
    api.md
```

Open `DocsProject/`. The server treats the folder as a configured Flavor
Grenade vault even though it is not an Obsidian Vault.

Single-file mode:

```text
LooseNotes/
  scratch.md
```

Open only `scratch.md`, or open a folder with no `.obsidian/` and no
`.flavor-grenade.toml`. The server avoids recursive vault work because there is
no stable vault boundary.

## Capability Comparison

| Feature area | Vault mode | Single-file mode |
|---|---|---|
| Initial scan | Recursively scans the detected vault root. | Skips recursive scanning. |
| File watching | Starts a vault watcher for updates inside the vault. | Watcher does not start. |
| Document IDs | Vault-relative, extension-free DocIds such as `Notes/Home`. | No vault-wide DocId graph is available. |
| Wiki-link completions | Can suggest indexed notes across the vault. | Limited to information available from open/current documents. |
| Heading and block completions | Can use indexed targets from known vault documents. | Limited when the target document is not indexed. |
| Tag completions and references | Uses the vault-wide tag registry. | Vault-wide tag results are not available. |
| Broken-link diagnostics | Can resolve local vault targets and report missing supported targets. | Suppresses diagnostics that require a full vault graph to avoid false positives. |
| References and backlinks | Uses the rebuilt reference graph. | Cross-vault references are unavailable. |
| Rename | Can produce vault-confined edits for supported local references. | Cross-file rename is limited or unavailable because the server cannot see the full graph. |
| Attachments | Indexes non-document files inside the vault root. | Vault-wide attachment lookup is unavailable. |

## What Single-file Mode Is For

Single-file mode is a safety fallback, not a replacement for an Obsidian Vault.
It exists so generic Markdown files and loose notes do not get incorrect
vault-wide diagnostics, rename edits, or file operations.

Use vault mode when you expect:

- `[[note]]` completion across many files.
- Broken-link diagnostics for local vault links.
- References, backlinks, and CodeLens across the vault.
- Rename of notes or headings across incoming references.
- Attachment and embed resolution.

Use single-file mode when you are editing an isolated Markdown file or checking
syntax in a folder that is not meant to be a vault.

## Limits To Expect

In single-file mode, Flavor Grenade cannot know every note, heading, tag,
block anchor, embed, or attachment that may exist elsewhere. The server avoids
pretending otherwise.

That means a missing link diagnostic in vault mode can become no diagnostic in
single-file mode. This is intentional. A loose file may later be moved into a
real vault, or it may use link syntax that only makes sense in another editor.

For predictable behavior, open the vault root, keep one vault marker at or
above the notes you want indexed, and avoid opening a parent directory that
contains several unrelated vaults unless that is the workflow your editor
client supports.

## Direct LSP Clients

Direct clients must provide a root carefully:

```json
{
  "rootUri": "file:///Users/alex/MyVault",
  "workspaceFolders": [
    { "uri": "file:///Users/alex/MyVault", "name": "MyVault" }
  ]
}
```

If `rootUri` is `null` and no usable workspace folder is sent, the initialized
handler has no vault root to scan. A direct client should not expect vault
features until it has sent a valid file root and the server has finished
indexing.

## Definition of Done

- [ ] Article route exists and is linked from Advanced Usage hub and dropdown.
- [ ] Article clearly states capability differences by mode.
- [ ] Mode comparison table is present.
- [ ] Route metadata, sitemap, and tests include the article.
