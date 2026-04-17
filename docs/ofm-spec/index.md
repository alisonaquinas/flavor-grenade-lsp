---
title: OFM Spec — Overview
tags:
  - ofm-spec/index
  - ofm-spec
aliases:
  - OFM Overview
  - Obsidian Flavored Markdown Spec
---

# Obsidian Flavored Markdown — Spec Overview

Obsidian Flavored Markdown (OFM) is the Markdown dialect parsed by [Obsidian](https://obsidian.md). It extends CommonMark with vault-specific constructs: wiki-links, file embeds, block references, inline tags, YAML frontmatter, callouts, LaTeX math, comment blocks, and Templater passthrough syntax.

This directory is the ground-truth reference for `flavor-grenade-lsp`. Every LSP feature — diagnostics, completions, go-to-definition, semantic tokens — derives its behaviour from the rules documented here.

---

## Element Taxonomy

| Element | Syntax Example | Spec Page |
|---|---|---|
| Wiki-link | `[[doc]]`, `[[doc\|alias]]` | [[wiki-links]] |
| Embed | `![[file.md]]`, `![[image.png]]` | [[embeds]] |
| Block reference | `[[doc#^abc123]]`, `^abc123` anchor | [[block-references]] |
| Inline tag | `#project/active` | [[tags]] |
| YAML frontmatter | `---\ntitle: ...\n---` | [[frontmatter]] |
| Callout | `> [!NOTE] Title` | [[callouts]] |
| Math (block) | `$$...$$` | [[math]] |
| Math (inline) | `$...$` | [[math]] |
| Comment | `%% hidden %%` | [[comments]] |
| Templater command | `<% tp.file.title %>` | [[templater]] |

---

## Parse Precedence Rules

When two syntaxes could match the same character sequence, OFM resolves conflicts in this order:

1. **Fenced code blocks** — highest priority; content inside `` ``` ``` `` is always opaque.
2. **Math blocks** (`$$...$$`) — parsed before inline rules; content is opaque.
3. **Obsidian comments** (`%%...%%`) — parsed early; content is opaque.
4. **Templater commands** (`<%...%>`) — treated as opaque tokens; not OFM.
5. **Embeds** (`![[...]]`) — `!` prefix is checked before wiki-link parsing; `![[]]` wins over `![]()`.
6. **Wiki-links** (`[[...]]`) — double-bracket check before CommonMark link parsing.
7. **CommonMark rules** — apply to all remaining text.

> [!IMPORTANT]
> The parser must scan for opaque regions first and mark them before any other analysis runs. Tag detection, wiki-link scanning, and diagnostics must skip opaque regions entirely.

---

## Opaque Region Types

These element types are **excluded from all text analysis**. The LSP must treat their content as raw bytes.

| Type | Why Opaque |
|---|---|
| Fenced code block | Arbitrary source code — not OFM |
| Math block / inline math | LaTeX syntax — not OFM |
| Obsidian comment | Hidden content — intentionally invisible |
| Templater command | Template engine syntax — not evaluated by LSP |

---

## LSP Feature Applicability Matrix

| Feature | Wiki-link | Embed | Block Ref | Tag | Frontmatter | Callout | Math | Comment | Templater |
|---|---|---|---|---|---|---|---|---|---|
| Completion | Yes | Yes | Yes | Yes | Yes | Yes | No | No | No |
| Go-to-definition | Yes | Yes | Yes | No | No | No | No | No | No |
| Find references | Yes | Yes | Yes | Yes | No | No | No | No | No |
| Diagnostics | Yes | Yes | Yes | No | Yes | Opt | No | No | No |
| Rename | Yes | No | No | No | No | No | No | No | No |
| Hover | Yes | Yes | No | Yes | Yes | No | No | No | No |
| Semantic tokens | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Fold range | No | No | No | No | Yes | Yes | Yes | Yes | Yes |

---

## Official Obsidian Help Links

- [Obsidian Flavored Markdown](https://help.obsidian.md/obsidian-flavored-markdown)
- [Internal links (wiki-links)](https://help.obsidian.md/Linking+notes+and+files/Internal+links)
- [Embeds](https://help.obsidian.md/Linking+notes+and+files/Embed+files)
- [Tags](https://help.obsidian.md/Editing+and+formatting/Tags)
- [Properties / Frontmatter](https://help.obsidian.md/Editing+and+formatting/Properties)
- [Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts)
- [Math / MathJax](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Math)
- [Comments](https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax#Comments)
