---
adr: "020"
title: Markdown flavor selector instead of alternate VS Code language mode
status: accepted
date: 2026-05-12
tags: [adr, ADR020, vscode, extension, markdown-flavor]
aliases:
  - ADR020
  - Markdown flavor selector
  - Markdown flavor selection decision
---

# ADR 020 — Markdown flavor selector instead of alternate VS Code language mode

## Context

ADR016 chose a separate VS Code language id, `ofmarkdown`, for recognized
Obsidian vault documents. That gave Flavor Grenade a language-specific handle,
but it also made flavor selection compete with VS Code's language picker.

The revised product requirement is different:

- keep `.md` documents in VS Code's built-in `markdown` language mode;
- add a second selector for Markdown flavor next to the language mode control;
- continue auto-detecting flavor where possible;
- allow users to override the detected flavor;
- persist folder-backed overrides as project settings;
- persist standalone-file overrides as user settings;
- support every Markdown flavor currently researched in `docs/research/`, plus
  Obsidian's normative OFM specification source and auto-detection.

## Decision

Flavor Grenade will not use an alternate VS Code language id as the primary
representation of Markdown flavor. The extension must preserve `markdown` as the
VS Code language id for supported Markdown documents.

The extension will expose Markdown flavor through a separate selector. The
required flavor enum is:

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

The selector labels are:

- Auto Detect
- Original Markdown
- CommonMark
- Obsidian
- GitHub Flavored Markdown
- GitLab Flavored Markdown
- Pandoc Markdown
- MultiMarkdown
- MDX
- kramdown
- Markdown Extra
- R Markdown
- Reddit Markdown
- Stack Overflow Markdown

The default setting is `auto`. In `auto`, the extension and server infer the
effective flavor from vault and workspace signals. `.obsidian/` resolves to
Obsidian. Generic standalone Markdown resolves conservatively to CommonMark.

Explicit overrides persist by context:

| Context | Persistence target |
|---|---|
| Active Markdown file belongs to an open workspace folder | Workspace-folder or workspace setting |
| Active Markdown file has no workspace folder | User setting |

The setting name is specified as:

```json
{
  "flavorGrenade.markdownFlavor": "auto"
}
```

The effective flavor must be propagated to the language server so parser,
diagnostic, completion, navigation, and semantic-token behavior can become
flavor-aware over time.

Each explicit flavor must also have a dialect profile traced to its research
note or normative OFM specification source. Platform-oriented flavors such as
MDX, R Markdown, Reddit, and Stack Overflow are flavor profiles for Markdown
documents; they do not authorize the extension to override a user-selected
non-`markdown` VS Code language id.

## Consequences

**Positive:**

- Users keep VS Code's built-in Markdown mode and extension ecosystem.
- Flavor selection becomes explicit without abusing language mode as product state.
- Auto-detection remains low-friction for Obsidian vaults.
- Override persistence follows user expectations: project when a folder exists, user when only a file exists.
- The model can grow to additional flavors without adding more VS Code language ids.
- The researched flavor corpus becomes testable product scope instead of
  background research.

**Negative:**

- The extension cannot rely on `"[ofmarkdown]"` language-specific settings for v1 flavor behavior.
- Some existing tests and docs that assert `ofmarkdown` promotion must be rewritten.
- Snippets or keybindings that were intended to be `ofmarkdown`-scoped need a new context key or command precondition.
- Status bar placement can only approximate "next to the language mode" because VS Code owns the built-in language status item.

## Rejected Options

### Continue dynamic `ofmarkdown` promotion

Rejected because flavor is not the same concept as VS Code language mode. It
also risks disrupting standard Markdown integrations.

### Add one language id per flavor

Rejected because the flavor set will expand. Language ids such as
`markdown-commonmark`, `markdown-obsidian`, and `markdown-gfm` would multiply
grammar/configuration maintenance and still not solve project/user override
scope cleanly.

### Require only config files, no selector

Rejected because users need to see and change the effective flavor from the
editor without hunting through settings.

## Cross-References

- [[docs/features/ofmarkdown-language-mode]]
- [[docs/requirements/functional/ofmarkdown-language-mode]]
- [[docs/requirements/user/vscode-language-mode]]
- [[docs/ddd/editor-client/domain-model]]
- [[docs/research/commonmark-and-original-markdown]]
- [[docs/research/github-flavored-markdown-analysis]]
- [[docs/research/gitlab-flavored-markdown-analysis]]
- [[docs/research/pandoc-markdown-deep-research-report]]
- [[docs/research/multimarkdown-analysis]]
- [[docs/research/mdx-analysis]]
- [[docs/research/kramdown-analysis]]
- [[docs/research/markdown-extra-analysis]]
- [[docs/research/r-markdown-analysis]]
- [[docs/research/reddit-markdown-analysis]]
- [[docs/research/stack-overflow-markdown-analysis]]
- [[docs/ofm-spec/index]]
