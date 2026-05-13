---
title: Feature — Obsidian Markdown Flavor
tags: [features, markdown-flavor, obsidian]
aliases:
  - Obsidian flavor
  - Obsidian Markdown flavor
  - OFM feature set
---

# Feature — Obsidian Markdown Flavor

The `obsidian` flavor is Flavor Grenade's vault-native profile. It preserves
the existing Obsidian Flavored Markdown intelligence while keeping files in VS
Code's built-in `markdown` language mode.

## Feature Set

| Surface | Required behavior |
|---|---|
| Wiki-links | Resolve `[[note]]`, aliases, heading links, and path-qualified links against the vault index. |
| Embeds | Resolve `![[note]]`, attachments, heading embeds, and block embeds. |
| Block anchors and refs | Index `^anchor` definitions and resolve `[[note#^anchor]]`. |
| Tags | Index inline tags and frontmatter tags, including nested tag hierarchy. |
| Callouts | Tokenize Obsidian callouts, foldable callouts, and callout type completion. |
| Frontmatter | Parse YAML title, aliases, and tags as first-class metadata. |
| Opaque regions | Suppress link/tag parsing inside code, math, comments, and Templater regions. |
| Local Markdown links | Preserve CommonMark-compatible local link intelligence in Obsidian vaults. |

## LSP Behavior

| LSP surface | Behavior |
|---|---|
| Diagnostics | Publish FG001-FG007 for broken wiki-links, embeds, block refs, ambiguous targets, NBSP, and malformed frontmatter. |
| Completion | Offer wiki-link, heading, block-ref, tag, attachment, callout, and Markdown-link completions. |
| Navigation | Support definitions and references for wiki-links, Markdown links, tags, headings, blocks, and attachments. |
| Hover | Show target metadata for notes, embeds, tags, and attachments. |
| Rename | Update note, heading, block, and local Markdown references safely across the vault. |

## Acceptance

- `.obsidian/` auto-detects to `obsidian`.
- Existing OFM behavior works without setting VS Code language id to `ofmarkdown`.
- Obsidian-only behavior is inactive for other explicit flavors.

## Related

- [[docs/ofm-spec/index]]
- [[docs/plans/phase-24-obsidian-flavor-language-support]]
- [[docs/requirements/functional/ofmarkdown-parity]]
