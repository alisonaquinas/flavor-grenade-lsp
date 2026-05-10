---
id: "TASK-261"
title: "Advanced Article: Indexing and Performance"
type: task
status: done
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, advanced, article]
aliases: ["TASK-261"]
---

# Advanced Article: Indexing And Performance

> [!INFO] `TASK-261` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `done`

## Text Scope

- Explain initial scan, document parsing, watcher updates, and how index state
  feeds editor features.
- Give practical guidance for large vaults, generated output, ignored folders,
  and asset-heavy workspaces.
- Avoid unsupported performance guarantees; describe observable behavior and
  tuning levers only.

## Asset Scope

- Reuse an existing status or indexing screenshot if available.
- Include a performance checklist for vault organization and generated files.

## Draft Article Copy

# Indexing and Performance

Flavor Grenade gets its vault intelligence from an in-memory vault index. The
index stores parsed Markdown documents, headings, tags, links, embeds, block
anchors, reference-style labels, and attachment metadata known to the server.

The index is the source of truth for completions, diagnostics, navigation,
references, rename, CodeLens, document highlights, workspace symbols, and
attachment lookup. If something is not in the index, vault-wide features should
not be expected to find it.

## Indexing Lifecycle

Indexing starts after the LSP handshake:

1. The client sends `initialize` with a `file://` root.
2. The client sends `initialized`.
3. The server detects vault mode by looking for `.obsidian/` or
   `.flavor-grenade.toml`.
4. In vault mode, the server loads ignore rules and scans the vault root.
5. Markdown documents are parsed into OFM documents and stored by DocId.
6. Non-document files are recorded as attachments.
7. Folder lookup, tag registry, reference graph, and resolver caches are
   rebuilt.
8. The server reports ready status.
9. A file watcher keeps known vault state updated after changes.

In single-file mode, the recursive scan and watcher startup are skipped.

## What Gets Indexed

By default, documents with the `.md` extension are parsed as documents. A
vault-local `.flavor-grenade.toml` may add document extensions for the initial
scan:

```toml
[vault]
extensions = [".md", ".markdown"]
```

Everything else inside the vault root is treated as a possible attachment.
Attachment entries are keyed by vault-relative path with extension, such as
`assets/diagram.png`.

DocIds for Markdown files are vault-relative and extension-free:

| File | DocId |
|---|---|
| `Home.md` | `Home` |
| `Notes/Project.md` | `Notes/Project` |
| `daily/2026-05-09.md` | `daily/2026-05-09` |

## Ignored Paths

The scanner reads ignore patterns from:

- `.gitignore`
- `.ignore`

Patterns are applied to vault-relative paths. The `.obsidian/` folder is always
excluded from scanning.

Use ignore files for generated output, caches, exports, and large build
artifacts:

```gitignore
dist/
.cache/
site/
generated/
tmp/
*.bak.md
```

Ignored documents do not contribute completions, diagnostics, references,
rename edits, tags, headings, or backlink results.

## Practical Limits

Flavor Grenade is conservative about resource use. Current behavior includes
these observable limits:

| Limit | Current behavior | User impact |
|---|---|---|
| Scan file budget | The vault scan stops after a large file-count limit is reached. | Very large vaults may index only the first scanned portion and show a warning. |
| Large document parse limit | Documents above the parser size limit are kept without a token index. | Huge notes may not produce links, headings, tags, or diagnostics. |
| Unreadable files | Unreadable documents or attachments are skipped. | Fix filesystem permissions, then rebuild the index. |
| Ignored paths | `.gitignore`, `.ignore`, and `.obsidian/` exclusions are honored. | Ignored content is invisible to vault-wide features. |
| Single-file mode | Recursive scan is skipped without a vault marker. | Vault-wide features are unavailable or intentionally narrow. |

These are implementation limits, not performance guarantees. The project does
not promise a fixed startup time for a given vault size. Disk speed, filesystem
watch behavior, attachment count, generated output, and editor client behavior
all affect indexing cost.

## Large Vault Checklist

For better indexing behavior:

- Open the vault root, not a parent folder that contains unrelated projects.
- Keep `.obsidian/` or `.flavor-grenade.toml` at the intended vault root.
- Add generated folders to `.gitignore` or `.ignore`.
- Keep exported websites, build output, and package caches outside the vault
  when possible.
- Avoid storing very large machine-generated Markdown files in indexed folders.
- Keep binary-heavy directories organized so attachment paths are predictable.
- Rebuild the index after changing vault markers, ignore rules, or configured
  document extensions.
- Check the Flavor Grenade status bar before trusting vault-wide completion or
  rename results.

## Generated Documentation Workflows

Generated Markdown can work well when it behaves like normal vault content.
Problems start when a generator writes thousands of temporary files, repeatedly
rewrites the same tree, or emits Markdown that contains example links not meant
to resolve.

Recommended pattern:

```text
Vault/
  .obsidian/
  Notes/
  Published/
  generated/       # ignored
```

```gitignore
generated/
```

Keep source notes indexed. Ignore intermediate output. If you want generated
Markdown to be indexed, write it to a stable folder and avoid emitting link-like
examples outside code fences unless they are real vault links.

## Status and Rebuilds

The VS Code extension shows server state in the status bar. During startup, the
server moves through initializing/indexing behavior and reaches ready when the
vault index is available.

Use **Flavor Grenade: Rebuild Index** after:

- Moving the vault root marker.
- Changing `.gitignore` or `.ignore`.
- Changing `.flavor-grenade.toml`.
- Generating or deleting many files outside normal editor saves.
- Seeing stale completion, reference, or diagnostic results.

Direct LSP clients must implement their own equivalent UI or command surface if
they want users to observe index state or request a rebuild.

## Definition of Done

- [ ] Article route exists and is linked from Advanced Usage hub and dropdown.
- [ ] Article explains indexing lifecycle and practical limits.
- [ ] Checklist or screenshot evidence is present.
- [ ] Route metadata, sitemap, and tests include the article.
