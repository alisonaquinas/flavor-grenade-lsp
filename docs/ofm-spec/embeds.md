---
title: OFM Spec — Embeds
tags:
  - ofm-spec/embeds
  - ofm-spec
aliases:
  - Embed Spec
  - OFM Embeds
  - File Embeds
---

# Embeds

Embeds are wiki-links prefixed with `!`. Instead of navigating to the target, Obsidian renders the target's content inline at the embed location. This is called transclusion.

Official reference: [Embed files](https://help.obsidian.md/Linking+notes+and+files/Embed+files)

---

## Rule Codes

| Code | Rule |
|---|---|
| `OFM-EMBED-001` | An embed is a wiki-link prefixed with `!`. |
| `OFM-EMBED-002` | Embed resolution follows the same target rules as wiki-links. |
| `OFM-EMBED-003` | Image width/height hints live in the alias slot and use numeric syntax. |

## Syntax Variants

| Syntax | Meaning |
|---|---|
| `![[file.md]]` | Embed entire note |
| `![[image.png]]` | Embed an image |
| `![[file.pdf]]` | Embed a PDF viewer |
| `![[audio.mp3]]` | Embed an audio player |
| `![[file.md#heading]]` | Embed from a heading to the next heading |
| `![[file.md#^blockid]]` | Embed a single named block |
| `![[image.png\|300]]` | Embed image at 300 px width |
| `![[image.png\|300x200]]` | Embed image at explicit width × height |

---

## How Embeds Differ from Wiki-Links

| Property | Wiki-link `[[...]]` | Embed `![[...]]` |
|---|---|---|
| Rendered output | Clickable hyperlink | Inline transcluded content |
| Semantic | Navigation | Content inclusion |
| File types | `.md` only (meaningful) | `.md`, images, PDFs, audio, video |
| Alias field | Display text for link | Width/height for images; ignored for notes |
| LSP go-to-def | Navigates to target | Navigates to target (same behaviour) |

> [!NOTE]
> The `!` prefix is what distinguishes an embed from a wiki-link in the shared regex. See [[wiki-links]] for the canonical regex. The embed-specific behaviour is triggered only when group 1 (`!`) is captured.

---

## Regex

The embed shares the wiki-link regex with the `!` group required:

```regexp
!\[{2}([^\][\n|]+?)(\|([^\][\n|]+?))?\]{2}
```

For a unified scanner that handles both wiki-links and embeds, use the full form from [[wiki-links]] and branch on the `!` capture.

---

## Resolution

Embed path resolution follows the same rules as [[wiki-links]]:

1. Shortest-path file-stem match for `.md` files.
2. Explicit relative path when a `/` appears in the target.
3. For images, PDFs, and audio: file-stem match across all non-`.md` files in the vault.

> [!TIP]
> Images can live in any vault subfolder. Obsidian does not require an `attachments/` directory, though it is a common convention. The LSP should search all directories when resolving image embeds.

---

## Width/Height Syntax

When the alias field of an image embed contains a number or `WxH` pair, it is an image dimension hint, not display text:

```regexp
^(\d+)(x(\d+))?$
```

The LSP should parse the alias field against this pattern to distinguish image sizing from note display text.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Completion | Same trigger as [[wiki-links]] (`[`). After `![[`, offer vault files filtered by supported embed types (`.md`, `.png`, `.jpg`, `.gif`, `.svg`, `.pdf`, `.mp3`, `.mp4`, etc.). |
| Diagnostics | Broken embed target (file not found), broken heading reference in `![[file.md#heading]]`, broken block reference in `![[file.md#^id]]`. |
| Hover | For `.md` embeds: show note preview. For images: show dimensions if available. |
| Go-to-definition | Navigate to the target file (same as wiki-link). |
