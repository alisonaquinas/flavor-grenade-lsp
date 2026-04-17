---
title: OFM Spec — Wiki-Links
tags:
  - ofm-spec/wiki-links
  - ofm-spec
aliases:
  - Wiki-Link Spec
  - OFM Wiki-Links
---

# Wiki-Links

Wiki-links are the primary internal navigation primitive in OFM. They are unique to Obsidian and do not exist in CommonMark or GFM.

Official reference: [Internal links](https://help.obsidian.md/Linking+notes+and+files/Internal+links)

---

## Syntax Variants

| Syntax | Meaning |
|---|---|
| `[[doc]]` | Link to note by file stem |
| `[[doc\|alias]]` | Link with custom display text |
| `[[doc#heading]]` | Link to a heading within `doc` |
| `[[doc#heading\|alias]]` | Heading link with display text |
| `[[#heading]]` | Intra-document heading link |
| `[[#^blockid]]` | Intra-document block reference |
| `[[doc#^blockid]]` | Cross-document block reference |

---

## Canonical Regex

```regexp
(!?)\[{2}([^\][\n|]+?)(\|([^\][\n|]+?))?\]{2}
```

| Group | Captures | Notes |
|---|---|---|
| `(!?)` | Optional `!` prefix | Present → embed; absent → navigation link |
| `\[{2}` | Literal `[[` | Opening delimiter |
| `([^\][\n|]+?)` | Link target | File stem, optional `#heading` or `#^id`; no newlines, no `[`, `]`, or `\|` |
| `(\|([^\][\n|]+?))?` | Optional alias clause | Outer group: whole `\|alias`; inner group: alias text only |
| `\]{2}` | Literal `]]` | Closing delimiter |

> [!NOTE]
> The same regex is shared by [[embeds]] — group 1 (`!?`) distinguishes the two. See [[embeds]] for embed-specific behaviour.

---

## Parse Rules

- **No newlines** are permitted inside `[[...]]`. A newline terminates the match attempt and the text is treated as literal.
- **Pipes are delimiters**, not content. An escaped pipe (`\|`) inside the target is treated as a literal character in some contexts but is not standard OFM — treat as invalid.
- **Case-insensitive resolution**: `[[MyNote]]` and `[[mynote]]` resolve to the same file on case-insensitive file systems. The LSP should normalize to the actual on-disk casing when presenting results.

---

## Resolution Modes

OFM resolves wiki-links using Obsidian's shortest-path rule:

1. **File-stem match** (default) — `[[doc]]` resolves to any file named `doc.md` anywhere in the vault.
2. **Title-slug match** — if a file has an `aliases:` property containing the link target, it resolves to that file.
3. **Explicit path** — `[[folder/doc]]` pins to a specific subdirectory.

When multiple files share the same stem, Obsidian prefers the file closest in the directory tree to the note containing the link (shortest relative path).

---

## Edge Cases

| Input | Status | Behaviour |
|---|---|---|
| `[[]]` | Invalid | Empty target — must emit a diagnostic |
| `[[doc\|]]` | Valid | Empty alias — rendered as if no alias; LSP should warn |
| `[[doc#]]` | Ambiguous | Heading fragment with no heading name — warn on no match |
| `[[doc#^]]` | Invalid | Block ID prefix with no ID — must emit a diagnostic |
| `[[ doc ]]` | Invalid | Leading/trailing space in target — Obsidian does not resolve |

> [!WARNING]
> Do not attempt to resolve wiki-links inside [[math]], [[comments]], or [[templater]] regions. Those areas are opaque and must be skipped.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Completion | Trigger character: `[`. After `[[`, offer all vault note stems and aliases. After `[[doc#`, offer headings from `doc`. After `[[doc#^`, offer known block IDs from `doc`. |
| Go-to-definition | Resolve link target to the file (and offset for `#heading` / `#^id` variants). |
| Find references | Return all wiki-links and embeds targeting the same file, heading, or block. |
| Diagnostics | Broken link (target file not found), ambiguous link (multiple files match stem), empty target `[[]]`, malformed block ID `[[doc#^]]`. |
| Rename | When a file is renamed, update all `[[oldname]]` occurrences to `[[newname]]`. |
| Hover | Show note title, first paragraph preview, and alias list. |
