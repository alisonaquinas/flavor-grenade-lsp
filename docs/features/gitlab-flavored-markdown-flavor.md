---
title: Feature — GitLab Flavored Markdown Flavor
tags: [features, markdown-flavor, glfm]
aliases:
  - GLFM flavor
  - GitLab Flavored Markdown flavor
---

# Feature — GitLab Flavored Markdown Flavor

The `glfm` flavor models GitLab Flavored Markdown as a CommonMark/GFM-derived
profile with GitLab-specific extensions and platform boundaries.

## Feature Set

| Surface | Required behavior |
|---|---|
| GFM-compatible core | Support CommonMark plus tables, task lists, strikethrough, and autolinks. |
| Inapplicable tasks | Recognize GitLab's `[~]` task marker when enabled by profile. |
| Footnotes and description lists | Parse GLFM-supported footnotes and description lists. |
| Math and diagrams | Tokenize math, Mermaid, PlantUML, and Kroki fences without requiring renderer services. |
| Alerts | Recognize GitLab alert/callout blockquote syntax. |
| TOC tags and includes | Classify `[[_TOC_]]`, `[TOC]`, and `::include` as GitLab-specific constructs. |
| GitLab references | Tokenize issue, MR, epic, commit, user, and label references as host references. |

## Host-Specific Boundaries

GitLab object references require project/group context and permissions. Local
LSP support must classify them and may validate syntax, but must not claim that
the object exists without a GitLab integration.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed GLFM syntax and broken local Markdown links; classify host references as unresolved only when syntax is invalid. |
| Completion | Offer GLFM task markers, table helpers, diagram fence languages, TOC/include snippets, and local links. |
| Navigation | Resolve local Markdown links and headings; host references are non-local. |
| Document symbols | Expose headings, tables, task lists, footnotes, description lists, diagram fences, TOC/include markers, and local reference definitions. |
| Folding | Fold headings, lists, blockquotes, fenced code, tables, description lists, and diagram/math blocks. |
| Hover | Explain GLFM-only constructs and whether they need GitLab rendering context. |
| Semantic tokens | Mark GitLab references, TOC tags, includes, task markers, and diagram fences. |
| Rename | Rename local Markdown headings, labels, and references only; reject GitLab issues, merge requests, epics, commits, users, labels, and project references without integration context. |

## Acceptance

- GLFM-specific syntax is active only for `glfm`.
- GitLab references do not become vault file edits or broken wiki-link diagnostics.
- Renderer-dependent features are represented as syntax support, not local rendering promises.

## Related

- [[docs/research/gitlab-flavored-markdown-analysis]]
- [[docs/plans/phase-26-glfm-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
