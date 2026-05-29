---
title: Markdown Flavor Product Review
tags:
  - test/evidence
  - markdown-flavor
aliases:
  - Markdown Flavor Product Evidence
updated: 2026-05-13
---

# Markdown Flavor Product Review

## Review Metadata

| Field | Value |
|---|---|
| Review date | 2026-05-13 |
| Reviewer / command | Codex Phase 21 evidence review |
| Commit reviewed | `5aad12ce` |
| Source inputs | `docs/bdd/features/ofmarkdown-language-mode.feature`, `docs/bdd/features/markdown-flavor-dialects.feature`, `docs/test/evidence/markdown-flavor-research-trace.md`, `docs/adr/ADR020-markdown-flavor-selection.md`, `docs/test/markdown-flavor-validation-spec.md` |
| Sanitization | Repository-relative paths only; no note bodies, `.fgignore`/`.fgattributes` contents, environment variables, tokens, local user paths, or raw server output included |

## Product Decisions

| Topic | Review result | Status |
|---|---|---|
| `auto` selector state | `auto` is a detection/reset state and is not treated as an explicit dialect profile. | Pass |
| Required explicit flavors | The selector examples and dialect feature examples cover `original`, `commonmark`, `obsidian`, `gfm`, `glfm`, `pandoc`, `multimarkdown`, `mdx`, `kramdown`, `markdown-extra`, `r-markdown`, `reddit`, and `stack-overflow`. | Pass |
| Source-backed profiles | Each explicit flavor maps to a research or `ofm-spec` source in `markdown-flavor-research-trace.md`. | Pass |
| MDX safety | `mdx` may be selected as a Markdown flavor only while `.md` documents remain in VS Code's built-in `markdown` language mode; explicit `mdx` language mode is preserved and not taken over. | Pass |
| Manual language safety | BDD coverage preserves user-selected non-Markdown language ids and records no flavor override write or server configuration notification for those documents. | Pass |
| Platform flavors | Reddit, Stack Overflow, GitHub, and GitLab references are product flavor surfaces, not permission to resolve host objects as local vault files. | Pass |

## Validation Rows

| Validation row | Evidence | Result |
|---|---|---|
| MF-VA-001 | Required flavor examples in `ofmarkdown-language-mode.feature` and source rows in `markdown-flavor-research-trace.md`. | Pass |
| MF-VA-002 | ADR020 enum is represented by the BDD selector and dialect examples. | Pass |
| MF-VA-003 | `markdown-flavor-dialects.feature` cites source slugs and signature behavior for every explicit flavor. | Pass |
| MF-VA-004 | This review confirms MDX flavor does not authorize VS Code language-mode promotion. | Pass |
| MF-VA-005 | Host-specific and conversion-specific references defer local-resolution claims to `markdown-flavor-host-boundary-review.md`. | Pass |

## Follow-Up Boundary

Phase 21 validates the root BDD and product-evidence contract. Real VS Code host
selector behavior, extension settings persistence, and package/Marketplace proof
remain owned by Phase E17 and extension test artifacts.
