---
title: Feature — Stack Overflow Markdown Flavor
tags: [features, markdown-flavor, stack-overflow]
aliases:
  - Stack Overflow Markdown flavor
  - Stack Overflow flavor
---

# Feature — Stack Overflow Markdown Flavor

The `stack-overflow` flavor models Stack Overflow's CommonMark-based technical
writing behavior for questions, answers, and comments.

## Feature Set

| Surface | Required behavior |
|---|---|
| CommonMark base | Support CommonMark prose, headings, lists, blockquotes, links, images, and code. |
| Fenced and indented code | Prioritize technical code-block authoring, language hints, and folding. |
| Tables | Support table syntax where Stack Overflow enables it. |
| Spoilers | Recognize Stack Overflow spoiler blockquotes where supported. |
| Platform links | Classify question, answer, tag, and user references as host-specific references. |
| Comments profile | Represent comment-specific Markdown limitations separately from post body behavior. |

## Host-Specific Boundaries

Syntax highlighting, tag pages, user/question resolution, reputation-sensitive
features, and comment renderer differences require Stack Exchange context.
Flavor Grenade should classify these references but not resolve live platform
objects locally.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report malformed code fences, tables, spoilers, broken local links, and post/comment portability warnings. |
| Completion | Offer fenced-code languages, local links, table helpers, and Stack Overflow reference snippets. |
| Navigation | Resolve local Markdown links and headings; platform references remain non-local. |
| Document symbols | Expose headings, code blocks, tables, spoilers, local references, and post/comment profile sections. |
| Folding | Fold headings, lists, blockquotes, code blocks, spoilers, and tables. |
| Hover | Explain technical-writing syntax, language hints, and post/comment differences. |
| Semantic tokens | Mark code fences, table structure, spoilers, links, and host references. |
| Rename | Rename local Markdown headings and links only; reject Stack Exchange tags, questions, answers, users, and comment targets without platform context. |

## Acceptance

- `stack-overflow` optimizes for technical Q&A authoring.
- Comment-context limitations are not confused with full post-body behavior.
- Stack Exchange references do not become local vault diagnostics.

## Related

- [[docs/research/stack-overflow-markdown-analysis]]
- [[docs/plans/phase-34-stack-overflow-markdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
