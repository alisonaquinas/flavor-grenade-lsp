---
title: OFM Spec — Block References
tags:
  - ofm-spec/block-references
  - ofm-spec
aliases:
  - Block Reference Spec
  - OFM Block Refs
  - Block ID Spec
---

# Block References

A block reference is a two-part construct: an **anchor** (`^blockid`) appended to a paragraph or list item, and a **reference** (`[[doc#^blockid]]`) that links or embeds that specific block.

Official reference: [Internal links — Block links](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note)

---

## Anchor Syntax

A block ID anchor is placed at the **end of a line**, separated from content by a space:

```markdown
This is the paragraph that will be referenceable. ^my-block-id

- A list item that can be referenced. ^list-item-ref

| Cell A | Cell B |
|--------|--------|
| data   | here   | ^table-row-ref
```

> [!WARNING]
> The block ID anchor **must be the last thing on its line**. Any text after `^blockid` on the same line is treated as literal text, not an anchor. Trailing spaces after the ID are permitted by Obsidian but not recommended.

---

## Block ID Format

```regexp
\^[a-zA-Z0-9-]+$
```

- Characters: ASCII letters, digits, and hyphens only.
- No underscores, no Unicode, no spaces.
- Auto-generated IDs from Obsidian's "Copy block link" command look like `^abc123` (6 lowercase hex chars).
- User-defined IDs should be meaningful: `^conclusion`, `^key-insight`, `^step-3`.

---

## Reference Syntax

| Syntax | Meaning |
|---|---|
| `[[doc#^blockid]]` | Cross-document block reference (link) |
| `[[#^blockid]]` | Intra-document block reference (link) |
| `![[doc#^blockid]]` | Cross-document block embed (transclusion) |
| `![[#^blockid]]` | Intra-document block embed |

The `#^` sequence inside the wiki-link target signals a block reference. This is captured by the wiki-link regex documented in [[wiki-links]]:

```regexp
([^\][\n|]+?)   # full target field, e.g. "doc#^blockid"
```

The LSP must post-process the target field: split on `#`, then check whether the fragment starts with `^`.

---

## Anchor Detection Regex

To index all block ID anchors in a document:

```regexp
\^[a-zA-Z0-9-]+$
```

Apply with the multiline flag (`m`) so `$` matches end-of-line, not end-of-string. Scan the entire document after stripping opaque regions ([[math]], [[comments]], [[templater]], fenced code blocks).

---

## Constraint Summary

| Rule | Detail |
|---|---|
| Position | Must be last on its line |
| Characters | `[a-zA-Z0-9-]` only |
| Uniqueness | Must be unique within a single document |
| Line types | Valid after paragraphs, list items, table rows, and headings |
| Opaque regions | Anchors inside code blocks, math, or comments are not real anchors |

> [!NOTE]
> Headings have their own fragment syntax (`#heading-text`). Block IDs use `#^` to distinguish them from heading fragments. The LSP must not confuse `[[doc#Introduction]]` (heading link) with `[[doc#^abc123]]` (block link).

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Indexing | On document open/save, scan for all `^id` anchors and add to the document symbol table. |
| Completion | After `#^` inside a wiki-link, offer all known block IDs from the target document. |
| Go-to-definition | For `[[doc#^id]]`, resolve to the line in `doc` where `^id` is the anchor. |
| Find references | Return all `[[*#^id]]` references to a given anchor. |
| Diagnostics | Broken block ref: `^id` not found in target document. Malformed ID: `[[doc#^]]` with empty ID. |
