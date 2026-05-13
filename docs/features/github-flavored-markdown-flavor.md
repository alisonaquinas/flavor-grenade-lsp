---
title: Feature — GitHub Flavored Markdown Flavor
tags: [features, markdown-flavor, gfm]
aliases:
  - GFM flavor
  - GitHub Flavored Markdown flavor
---

# Feature — GitHub Flavored Markdown Flavor

The `gfm` flavor models GitHub Flavored Markdown as a CommonMark extension set
for developer documentation.

## Feature Set

| Surface | Required behavior |
|---|---|
| CommonMark base | Reuse CommonMark parsing for core Markdown behavior. |
| Tables | Parse pipe tables, expose table-aware diagnostics, folding, and semantic tokens. |
| Task lists | Parse `[ ]` and `[x]` task markers as task-list items. |
| Strikethrough | Tokenize `~~text~~` as GFM strikethrough. |
| Autolinks | Recognize GFM-style automatic URL and email links. |
| GitHub alerts | Treat GitHub-style alert blockquotes as a GFM platform extension when enabled by profile version. |

## Host-Specific Boundaries

Issue references, commit references, user mentions, emoji rendering, syntax
highlighting, and GitHub security sanitization are GitHub-host behaviors. Local
support may tokenize or classify them, but must not pretend to resolve GitHub
objects without repository context.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed tables and broken local Markdown links; do not emit Obsidian wiki-link diagnostics. |
| Completion | Offer table snippets, task-list markers, local link targets, headings, and fenced-code language hints. |
| Navigation | Resolve local Markdown links and headings; GitHub object references remain host-specific. |
| Document symbols | Expose headings, table regions, task-list sections, code fences, and local reference definitions. |
| Folding | Fold headings, lists, blockquotes, fenced code, and GFM table blocks. |
| Hover | Explain GFM tables, task markers, strikethrough, autolinks, and host-specific references. |
| Semantic tokens | Mark tables, task markers, strikethrough, and autolinks distinctly. |
| Rename | Rename only local headings, reference labels, and Markdown link targets; reject GitHub issues, commits, users, labels, and other host objects without integration context. |

## Acceptance

- GFM tables/task lists parse only when `gfm` or a compatible flavor is active.
- GitHub-host references are not resolved as local vault links.
- CommonMark behavior remains the base for all non-extension syntax.

## Related

- [[docs/research/github-flavored-markdown-analysis]]
- [[docs/plans/phase-25-gfm-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
