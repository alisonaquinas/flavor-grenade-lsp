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

Required selector choices:

| Selector label | Flavor id | Meaning |
|---|---|---|
| Auto Detect | `auto` | Infer the effective flavor from vault/config/context signals. |
| Original Markdown | `original` | Interpret source using the historical Gruber Markdown baseline where supported. |
| CommonMark | `commonmark` | Interpret source using CommonMark semantics where supported. |
| Obsidian | `obsidian` | Interpret source using Obsidian Flavored Markdown semantics. |
| GitHub Flavored Markdown | `gfm` | Interpret source using GFM's CommonMark-based extensions, including tables, task lists, and strikethrough. |
| GitLab Flavored Markdown | `glfm` | Interpret source using GLFM's CommonMark-based GitLab extensions. |
| Pandoc Markdown | `pandoc` | Interpret source using Pandoc Markdown's extension-oriented academic and conversion features. |
| MultiMarkdown | `multimarkdown` | Interpret source using MultiMarkdown's document-production extensions. |
| MDX | `mdx` | Interpret Markdown-with-JSX content as an explicit flavor for Markdown documents without taking over VS Code's MDX language mode. |
| kramdown | `kramdown` | Interpret source using kramdown's attribute and block extension model. |
| Markdown Extra | `markdown-extra` | Interpret source using PHP Markdown Extra style extensions. |
| R Markdown | `r-markdown` | Interpret source using R Markdown's YAML, prose, and executable chunk conventions as a Markdown flavor profile. |
| Reddit Markdown | `reddit` | Interpret source using Reddit's platform Markdown behavior. |
| Stack Overflow Markdown | `stack-overflow` | Interpret source using Stack Overflow's CommonMark-based technical-writing behavior. |

## Dialect Profile Baselines

Each explicit flavor must carry a profile traced to research. The profile
records which constructs are core, which are flavor extensions, and which
platform behaviors should be treated as host-specific rather than portable
Markdown.

| Flavor id | Required profile baseline | Source |
|---|---|---|
| `original` | Gruber 2004 Markdown syntax and Markdown.pl-era ambiguities; no fenced code, tables, task lists, or wiki links as core syntax. | [[research/commonmark-and-original-markdown]] |
| `commonmark` | Versioned CommonMark core semantics with fenced code blocks and standardized edge-case behavior; no GFM tables or Obsidian wiki links as core syntax. | [[research/commonmark-and-original-markdown]] |
| `obsidian` | Obsidian-style wiki links, embeds, block anchors, tags, callouts, frontmatter, math, comments, and vault-local link semantics. | [[ofm-spec/index]] |
| `gfm` | CommonMark plus GitHub tables, task lists, strikethrough, autolinks, and GitHub platform rendering boundaries. | [[github-flavored-markdown-analysis]] |
| `glfm` | CommonMark/GFM base plus GitLab-specific references, media behavior, and heading/link conventions. | [[gitlab-flavored-markdown-analysis]] |
| `pandoc` | Extension-oriented Markdown with citations, math, metadata, attributes, labels, cross-references, and conversion-sensitive behavior. | [[pandoc-markdown-deep-research-report]] |
| `multimarkdown` | Document-production Markdown with metadata, tables, footnotes, citations, cross-references, and export-oriented behavior. | [[multimarkdown-analysis]] |
| `mdx` | Markdown with JSX expressions/components and ESM-oriented constraints; treat `.mdx` language-mode ownership as external to Markdown flavor selection. | [[mdx-analysis]] |
| `kramdown` | kramdown block/span attributes, definition lists, tables, math, footnotes, and parser option behavior. | [[kramdown-analysis]] |
| `markdown-extra` | PHP Markdown Extra tables, definition lists, footnotes, abbreviations, fenced code, and attribute blocks. | [[markdown-extra-analysis]] |
| `r-markdown` | YAML metadata, prose Markdown, and executable R code chunk conventions across knitr/rmarkdown-style pipelines. | [[r-markdown-analysis]] |
| `reddit` | Reddit's platform Markdown rules, including host-specific rendering, escaping, and portability limits. | [[reddit-markdown-analysis]] |
| `stack-overflow` | Stack Overflow's CommonMark-based technical-writing profile, code blocks, syntax highlighting conventions, and platform constraints. | [[stack-overflow-markdown-analysis]] |

## Selector UI

The extension contributes a status bar item or equivalent command surface:

```text
Markdown Flavor: Auto (Obsidian)
Markdown Flavor: CommonMark
Markdown Flavor: Original
Markdown Flavor: Obsidian
Markdown Flavor: GitHub Flavored Markdown
Markdown Flavor: GitLab Flavored Markdown
Markdown Flavor: Pandoc Markdown
Markdown Flavor: MultiMarkdown
Markdown Flavor: MDX
Markdown Flavor: kramdown
Markdown Flavor: Markdown Extra
Markdown Flavor: R Markdown
Markdown Flavor: Reddit Markdown
Markdown Flavor: Stack Overflow Markdown
```

Clicking the selector opens a quick-pick menu:

1. Auto Detect
2. Original Markdown
3. CommonMark
4. Obsidian
5. GitHub Flavored Markdown
6. GitLab Flavored Markdown
7. Pandoc Markdown
8. MultiMarkdown
9. MDX
10. kramdown
11. Markdown Extra
12. R Markdown
13. Reddit Markdown
14. Stack Overflow Markdown

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

Allowed values:

```typescript
type MarkdownFlavor =
  | 'auto'
  | 'original'
  | 'commonmark'
  | 'obsidian'
  | 'gfm'
  | 'glfm'
  | 'pandoc'
  | 'multimarkdown'
  | 'mdx'
  | 'kramdown'
  | 'markdown-extra'
  | 'r-markdown'
  | 'reddit'
  | 'stack-overflow';
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
- Selector choices cover every required researched flavor: Original Markdown, CommonMark, Obsidian, GFM, GLFM, Pandoc, MultiMarkdown, MDX, kramdown, Markdown Extra, R Markdown, Reddit, and Stack Overflow.
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
