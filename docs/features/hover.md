---
title: Feature — Hover
tags: [features/, hover, preview]
aliases: [hover, document preview, hover information]
---

# Feature — Hover

Hover information is provided via `textDocument/hover` responses. When the user hovers over an OFM construct, the server returns a `Hover` object containing a Markdown-formatted preview. Editors display this in a floating popup.

> [!NOTE]
> All hover responses use `MarkupContent` with `kind: "markdown"` so that editors render the content with syntax highlighting, bold, and links rather than plain text.

## Wiki-Link Hover

**Trigger:** Cursor is inside a `[[target]]`, `[[target#heading]]`, `[[target|alias]]`, or `[[target#^id]]` wiki-link.

**Content returned:**

```text
**target** · `vault/path/to/target.md`

<first paragraph of the target document>

---
N headings · M block anchors
```

Specifically:

1. **Title line:** The document's first `# H1` heading (if present) in bold, followed by the vault-relative path in a code span.
2. **Preview:** The first non-frontmatter, non-heading paragraph of the target document. Truncated at 500 characters with `…` if longer. This gives a quick preview of the document's content without opening it.
3. **Stats line:** A horizontal rule followed by heading count and block anchor count.

**When the target does not resolve** (FG001 would fire): the hover shows `"Document not found: '{{target}}'"` with a suggestion to use `fg.createMissingFile` if available.

**When the wiki-link includes a heading** (`[[doc#heading]]`): the hover shows the content of that specific section (the text between the named heading and the next heading of equal or higher level), truncated at 1000 characters.

**When the wiki-link includes a block ref** (`[[doc#^id]]`): the hover shows the block (paragraph, list item, or table row) containing the `^id` anchor.

## Embed Hover

**Trigger:** Cursor is inside `![[target]]`.

**Content returned varies by file type:**

| File type | Hover content |
|---|---|
| `.md` | First paragraph of the target document (same as wiki-link hover) |
| Image (`.png`, `.jpg`, `.gif`, `.svg`, `.webp`) | `"Image: {{filename}} ({{size}})"` — no inline preview (editors handle image rendering differently) |
| Audio (`.mp3`, `.m4a`, `.ogg`, `.flac`, `.wav`) | `"Audio: {{filename}} ({{size}})"` |
| Video (`.mp4`, `.webm`, `.ogv`, `.mov`) | `"Video: {{filename}} ({{size}})"` |
| PDF | `"PDF: {{filename}} ({{pages}} pages, {{size}})"` |
| Other | `"File: {{filename}} ({{size}})"` |

File size is shown in human-readable form (KB or MB). Size and page count are read from the vault index (cached during file indexing) — no synchronous disk read occurs during hover.

## Tag Hover

**Trigger:** Cursor is inside a `#tag` in the document body or a `tags:` frontmatter value.

**Content returned:**

```text
**#project/active**

Used in **12** documents · **47** total occurrences

Documents:
- [[note-a]]
- [[note-b]]
- [[note-c]]
  *(and 9 more)*
```

Specifically:

1. The full tag path in bold with `#` prefix.
2. Usage statistics: number of distinct documents and total occurrence count.
3. A list of up to 3 documents that use the tag (as wikilinks), followed by `*(and N more)*` if there are more than 3.

For hierarchical tags (`#project/active`): the hover includes a note `"Sub-tag of #project"` with a link to the parent tag's hover (editors do not follow hover links, but it provides context).

## Frontmatter Key Hover

**Trigger:** Cursor is on a key name in the YAML frontmatter block.

**Content returned:** A description of the key's semantics if it is a known Obsidian special key:

| Key | Hover description |
|---|---|
| `aliases` | `"Alternative names for this document. Wiki-links using any alias resolve to this file."` |
| `tags` | `"Tags for this document. Supports hierarchy (e.g., project/active). Equivalent to inline #tags."` |
| `cssclasses` | `"CSS class names applied to the document in Obsidian's reading view."` |
| `publish` | `"Controls whether Obsidian Publish includes this document in the published site."` |
| `date` | `"Date associated with this document. Displayed in certain Obsidian views and plugins."` |
| `created` | `"Creation timestamp. Used by some plugins for sorting and filtering."` |
| `modified` | `"Last modified timestamp. May be auto-updated by plugins."` |

For unknown keys, hover returns `null` (no popup shown). The server does not attempt to infer the semantics of user-defined frontmatter keys.

## No Hover Positions

The following positions return `null` (no hover popup):

| Position | Reason |
|---|---|
| Plain body text (not on a link or tag) | No structured information to display |
| Inside a fenced code block | Content is opaque; no OFM constructs inside |
| Inside a display math block (`$$`) | LaTeX content; not OFM-specific |
| Inside an Obsidian comment (`%% ... %%`) | Content is hidden; hovering it would be surprising |
| On a heading marker (`##`) but not on tag or link | Heading text is already visible |

## Hover Range

The `Hover` response includes a `range` field indicating the span of the hovered construct. This tells the editor how much to highlight when the hover popup is shown.

| Construct | Hover range |
|---|---|
| `[[target]]` | Full `[[target]]` span |
| `[[doc#heading]]` | Full span |
| `#tag` | From `#` to end of tag name |
| Frontmatter key | From key start to `:` |

## Configuration Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `hover.enabled` | boolean | `true` | Master switch for all hover responses |
| `hover.preview_chars` | integer | `500` | Maximum characters of preview text in wiki-link hover |
| `hover.tag_list_max` | integer | `3` | Maximum documents shown in tag hover list |

## Related

- [[features/diagnostics]]
- [[features/navigation]]
- [[features/completions]]
- [[ADR002-ofm-only-scope]]
- [[ofm-spec/index]]
