---
id: "TASK-262"
title: "Advanced Article: Unsupported URI Schemes and Confinement"
type: task
status: open
priority: high
phase: W7
parent: "FEAT-040"
created: "2026-05-09"
updated: "2026-05-09"
dependencies: ["FEAT-040"]
tags: [tickets/task, "phase/W7", website, advanced, article]
aliases: ["TASK-262"]
---

# Advanced Article: Unsupported URI Schemes And Confinement

> [!INFO] `TASK-262` · Task · Phase W7 · Parent: [[FEAT-040]] · Status: `open`

## Text Scope

- Explain how unsupported URI schemes, external URLs, absolute paths, and paths
  outside the vault are classified before diagnostics or edits.
- Describe why confinement protects user work during diagnostics, navigation,
  and rename.
- Include examples for local vault links, external links, and unsupported
  schemes.

## Asset Scope

- Include a safe versus ignored target table.
- Include Markdown examples for `[external](https://example.com)`,
  `[outside](../outside.md)`, and `[[Local Note]]`.

## Draft Article Copy

# Unsupported URI Schemes and Confinement

Flavor Grenade treats vault content as local user data. It resolves and edits
only supported local targets inside the detected vault. External URLs,
unsupported URI schemes, and paths that escape the vault boundary are classified
before diagnostics, navigation, code actions, or rename logic can treat them as
vault targets.

This is most visible with Markdown links. A link may look like a path, but the
server first asks: is this a local vault document, a local attachment, a
same-document fragment, an external URL, an unsupported scheme, or a path
outside the vault?

## Target Classification

| Markdown target | Classification | Vault diagnostics? | Vault edits? |
|---|---|---|---|
| `[[Local Note]]` | Local wiki-link target | Yes, when vault mode has enough index data. | Yes, for supported rename/code-action flows. |
| `[Local](Local.md)` | Local document target | Yes. | Yes, when edits remain vault-confined. |
| `[Heading](#heading)` | Same-document fragment | Yes, for supported fragment behavior. | Only within supported local edit flows. |
| `![Image](assets/diagram.png)` | Local attachment target | Yes, when attachment is indexed. | No document rename edit unless supported by the feature. |
| `[external](https://example.com)` | External URL | No vault-target diagnostic. | No. |
| `[mail](mailto:hello@example.com)` | External URL | No vault-target diagnostic. | No. |
| `[app](obsidian://open?vault=Notes)` | Unsupported scheme | No vault-target diagnostic. | No. |
| `[outside](../outside.md)` from a vault-root document | Path outside vault | No vault-target diagnostic. | No. |
| `[windows](C:\Users\alex\note.md)` | Unsupported scheme-like target | No vault-target diagnostic. | No. |

External URLs currently include `http`, `https`, `mailto`, and `tel`. Other
URI schemes are not treated as local vault files.

## Safe Local Examples

Wiki-link target:

```markdown
See [[Local Note]].
```

In vault mode, Flavor Grenade can resolve this against indexed DocIds such as
`Local Note` or folder-qualified note IDs, depending on the vault graph.

Markdown document target:

```markdown
See [Local](Local.md).
```

The server normalizes the path as a vault-relative document target and strips
the `.md` extension internally.

Attachment target:

```markdown
![Diagram](assets/diagram.png)
```

The server treats this as an attachment target because it has a known
non-Markdown extension and the syntax is an image link.

Same-document fragment:

```markdown
[Jump to setup](#setup)
```

The empty path means the link points inside the current document.

## Ignored or Non-editable Examples

External URL:

```markdown
[external](https://example.com)
```

This is intentionally not a vault target. Flavor Grenade should not report it
as a missing note and should not rewrite it during vault rename.

Path outside the vault:

```markdown
[outside](../outside.md)
```

From a document at the vault root, `..` would leave the vault. The target is
classified as outside the vault and is ignored by vault-target features.

Unsupported scheme:

```markdown
[open in app](obsidian://open?vault=Work&file=Home)
```

The server does not resolve custom schemes as local files. It leaves them to
the editor, browser, operating system, or target application.

## Why Confinement Matters

Vault features can produce powerful results:

- Diagnostics decide whether a local link is broken.
- Go to definition opens a target.
- Rename can return a workspace edit touching many files.
- Code actions can suggest file creation or link changes.

Those features must not cross from vault content into arbitrary host files.
Confinement keeps the unit of work clear: the detected vault root is the
boundary, and all vault-relative paths must stay inside it.

## How Local Paths Are Normalized

For standard Markdown links, the server normalizes local paths using the source
document location:

```text
Vault/
  Home.md
  Notes/
    Topic.md
  Assets/
    diagram.png
```

| Source document | Link | Normalized target |
|---|---|---|
| `Home.md` | `[Topic](Notes/Topic.md)` | `Notes/Topic` document |
| `Notes/Topic.md` | `[Home](../Home.md)` | `Home` document |
| `Home.md` | `![Diagram](Assets/diagram.png)` | `Assets/diagram.png` attachment |
| `Home.md` | `[Outside](../outside.md)` | outside vault |

Markdown-style absolute paths do not grant access to the host filesystem.
Direct filesystem paths and unsupported schemes are not used as editable vault
targets.

## VS Code Extension Versus Direct LSP

The VS Code extension adds client-side safety around server startup, workspace
trust, virtual workspaces, and the bundled server binary. It is the supported
route for most users.

Direct LSP clients still receive server-side classification and confinement,
but they are responsible for safe client behavior too. A direct client must
apply workspace edits exactly as returned, respect `file://` roots, and avoid
inventing its own path expansion around Flavor Grenade responses.

## Definition of Done

- [ ] Article route exists and is linked from Advanced Usage hub and dropdown.
- [ ] Article explains confinement with concrete examples.
- [ ] Target classification table is present.
- [ ] Route metadata, sitemap, and tests include the article.
