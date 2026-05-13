---
title: Feature — Reddit Markdown Flavor
tags: [features, markdown-flavor, reddit]
aliases:
  - Reddit Markdown flavor
  - Reddit flavor
---

# Feature — Reddit Markdown Flavor

The `reddit` flavor models Reddit's platform Markdown behavior for posts and
comments. It is a host-aware writing profile rather than a general document
production format.

## Feature Set

| Surface | Required behavior |
|---|---|
| Common prose Markdown | Support headings where allowed, paragraphs, emphasis, links, lists, blockquotes, and code. |
| Spoilers | Recognize Reddit spoiler syntax where profile-supported. |
| Superscript and escapes | Tokenize Reddit-specific superscript and escaping behavior. |
| Tables | Support Reddit table behavior where the profile enables it. |
| Platform links | Classify subreddit, user, and comment/post references as host-specific references. |

## Host-Specific Boundaries

Subreddit/user references, moderation behavior, previews, embeds, and old/new
Reddit renderer differences require platform context. Local support should
classify syntax and portability issues, not claim live Reddit resolution.

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Report portability issues, malformed tables/spoilers, and broken local Markdown links. |
| Completion | Offer Markdown link targets, spoiler snippets, table helpers, and common Reddit reference prefixes. |
| Navigation | Resolve only local Markdown links and headings; Reddit host references are non-local. |
| Hover | Explain Reddit-specific syntax and old/new renderer portability warnings. |
| Semantic tokens | Mark spoilers, host references, tables, links, and code spans. |

## Acceptance

- Reddit references are never treated as vault files.
- Platform-only behavior is documented as host-specific.
- Reddit flavor diagnostics prioritize portability and syntax safety.

## Related

- [[docs/research/reddit-markdown-analysis]]
- [[docs/plans/phase-33-reddit-markdown-language-support]]
- [[docs/test/markdown-flavor-unit-spec]]
