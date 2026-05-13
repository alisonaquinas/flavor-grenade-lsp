---
title: Feature — Markdown Flavor Selection
tags: [features/, markdown-flavor, vscode, extension]
aliases:
  - Markdown flavor selection
  - OFMarkdown language mode
  - VS Code Markdown flavor selector
---

# Feature — Markdown Flavor Selection

Markdown flavor selection is a VS Code extension feature that keeps `.md`
documents in VS Code's built-in `markdown` language mode while adding a separate
Flavor Grenade selector for how the document should be interpreted.

This supersedes the earlier dynamic `ofmarkdown` language-mode design. Flavor is
not a VS Code language id. It is document/workspace analysis state owned by
Flavor Grenade and surfaced through a separate selector.

## User-Visible Behavior

When a user opens a Markdown document in VS Code:

| Document context | VS Code language mode | Default flavor behavior |
|---|---|---|
| Inside a directory with `.obsidian/` | `markdown` | `Auto Detect` resolves to `Obsidian` |
| Inside a Flavor Grenade workspace with explicit flavor config | `markdown` | `Auto Detect` resolves from project config |
| Generic Markdown outside any vault/config | `markdown` | `Auto Detect` resolves to `CommonMark` |
| User manually selected another language id | user-selected mode | Flavor selector is inactive for that document |

The normal VS Code language picker continues to display **Markdown**. A separate
Flavor Grenade selector displays the effective Markdown flavor as close to the
language mode control as VS Code status item placement allows.

Initial selector choices:

| Selector label | Flavor id | Meaning |
|---|---|---|
| Auto Detect | `auto` | Infer the effective flavor from vault/config/context signals. |
| Original Markdown | `original` | Interpret source using the historical Gruber Markdown baseline where supported. |
| CommonMark | `commonmark` | Interpret source using CommonMark semantics where supported. |
| Obsidian | `obsidian` | Interpret source using Obsidian Flavored Markdown semantics. |

Future releases may add GFM, GLFM, MDX, Pandoc Markdown, MultiMarkdown, R
Markdown, kramdown, Markdown Extra, Reddit, or Stack Overflow flavors. They are
out of scope for the first selector implementation.

## Selector UI

The extension contributes a status bar item or equivalent command surface:

```text
Markdown Flavor: Auto (Obsidian)
Markdown Flavor: CommonMark
Markdown Flavor: Original
Markdown Flavor: Obsidian
```

Clicking the selector opens a quick-pick menu:

1. Auto Detect
2. Original Markdown
3. CommonMark
4. Obsidian

Selecting an item changes Flavor Grenade's effective flavor state. It must not
call `vscode.languages.setTextDocumentLanguage` and must not use the VS Code
language picker.

## Configuration Model

The selector writes a single setting:

```json
{
  "flavorGrenade.markdownFlavor": "auto"
}
```

Allowed values for v1:

```typescript
type MarkdownFlavor = 'auto' | 'original' | 'commonmark' | 'obsidian';
```

Persistence rules:

| Context | Override target |
|---|---|
| A workspace folder is open and owns the active Markdown file | Workspace-folder or workspace setting |
| Multiple workspace folders are open | The active file's owning workspace folder |
| Only a standalone Markdown file is open | User setting |
| Active document is not `markdown` | No flavor override is written for that document |

Choosing `Auto Detect` clears or resets the override at the same scope where an
explicit override would be stored.

## Detection Signals

Flavor detection uses positive signals:

1. `.obsidian/` ancestor: effective flavor `obsidian`.
2. Project config: effective flavor from `.flavor-grenade.toml` or VS Code workspace setting when present.
3. Server membership: server can confirm a document belongs to a Flavor Grenade vault/index.
4. No vault/config signal: effective flavor `commonmark`.

The extension may still ask the server for membership, but membership no longer
causes a VS Code language id change.

## Server Propagation

The effective flavor must be visible to server-side analysis. The exact protocol
may be initialization options, `workspace/didChangeConfiguration`, a custom
document metadata request, or another documented mechanism. The required
behavior is:

- open documents are analyzed with the current effective flavor;
- changing the selector refreshes diagnostics and feature behavior;
- folder overrides apply to every Markdown document in that folder scope;
- user overrides apply only when no workspace folder owns the document.

## LanguageClient Selector

The LanguageClient should target the built-in Markdown language:

```typescript
const documentSelector = [
  { scheme: 'file', language: 'markdown' },
];
```

`ofmarkdown` is no longer required for v1 flavor selection. If legacy support
remains in code during migration, it must be treated as compatibility debt and
not as the primary requirements target.

## Manual Language Safety

Flavor Grenade must not apply Markdown flavor behavior to a document whose
current VS Code language id is not `markdown`. This preserves explicit user
choices such as `plaintext`, `mdx`, or another extension-provided language.

## Acceptance Summary

- `.md` files stay in VS Code's built-in `markdown` language mode.
- A separate Markdown flavor selector is visible for Markdown documents.
- Initial selector choices are Auto Detect, Original Markdown, CommonMark, and Obsidian.
- Auto detection still resolves Obsidian vault files as Obsidian.
- Explicit overrides persist to project settings when a folder is open.
- Explicit overrides persist to user settings for standalone-file context.
- Flavor changes propagate to server analysis.
- Manual non-Markdown language selections are preserved.

## Related

- [[adr/ADR020-markdown-flavor-selection]]
- [[adr/ADR016-ofmarkdown-language-mode]]
- [[requirements/ofmarkdown-language-mode]]
- `docs/bdd/features/ofmarkdown-language-mode.feature`
- [[ddd/editor-client/domain-model]]
- [[features/semantic-tokens]]
