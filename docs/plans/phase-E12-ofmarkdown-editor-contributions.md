---
title: "Phase E12: OFMarkdown Editor Contributions"
phase: E12
status: complete
tags: [plans, vscode, extension, ofmarkdown, snippets]
aliases: [Phase E12, OFMarkdown Contributions]
updated: 2026-05-07
---

# Phase E12: OFMarkdown Editor Contributions

| Field | Value |
|---|---|
| Phase | E12 |
| Title | OFMarkdown Editor Contributions |
| Status | complete |
| Gate | OFMarkdown snippets, keybindings, and language configuration are scoped correctly |
| Depends on | Phase E11 |

## Objective

Use the `ofmarkdown` language id for editor affordances that should not affect
generic Markdown. This is where Flavor Grenade goes beyond Marksman VSCode's
plain `markdown` selector.

## Requirement Trace

| Requirement | Phase responsibility |
|---|---|
| [[docs/requirements/functional/vscode-extension-parity#Extension.Contributions.OFMarkdownScoped]] | Scope snippets, keybindings, language configuration, and optional theme examples |

## Scope

### In Scope

- Add snippets for callouts, embeds, wiki-links, aliases frontmatter, tags
  frontmatter, and block anchors.
- Tune language configuration for comments, brackets, surrounding pairs,
  folding markers, and word patterns.
- Add OFMarkdown-scoped keybindings for common commands when useful.
- Document semantic token color customization examples if needed.
- Test that generic Markdown is not affected by OFMarkdown-only contributions.

### Out of Scope

- New server completions.
- Theme extension publishing.
- User-customizable snippet generation.

## Acceptance

- OFMarkdown snippets appear only for `ofmarkdown`.
- Scoped keybindings are guarded by `editorLangId == ofmarkdown`.
- Generic Markdown behavior is unchanged unless intentionally shared.

## Gate Verification

```bash
cd extension
npm run check-types
npm test
npm run build:extension
```

CI evidence: PR #44 passed TypeScript typecheck, ESLint, Prettier format check,
unit tests, Markdown lint, and build on 2026-05-07.

## Related

- [[docs/features/ofmarkdown-language-mode]]
- [[docs/features/vscode-extension-parity]]
- [[ADR016-ofmarkdown-language-mode]]
