---
title: OFM Spec — Tags
tags:
  - ofm-spec/tags
  - ofm-spec
aliases:
  - Tag Spec
  - OFM Tags
  - Inline Tag Spec
---

# Tags

OFM tags are a classification primitive for notes. They appear either inline in the note body or under the `tags:` key in [[frontmatter]]. Both forms are equivalent in Obsidian's tag index.

Official reference: [Tags](https://help.obsidian.md/Editing+and+formatting/Tags)

---

## Rule Codes

| Code | Rule |
|---|---|
| `OFM-TAG-001` | Inline tags start with `#` and may contain Unicode letters, numbers, emoji, hyphens, underscores, and `/`. |
| `OFM-TAG-002` | YAML frontmatter tags are equivalent to inline tags and omit the leading `#`. |
| `OFM-TAG-003` | Tags inside opaque regions or all-numeric tags are ignored. |

## Inline Tag Syntax

An inline tag is `#` followed by one or more Unicode word characters, digits, emoji, hyphens, underscores, or `/` separators. The `#` must **not** be immediately preceded by an alphanumeric character (to avoid matching URL fragments like `https://example.com#section`).

```markdown
This note covers #machine-learning and #project/active topics.
```

---

## Canonical Regex

```regexp
/(^|\s)(#[\p{L}\p{N}\-_\/\p{Emoji_Presentation}]+)/gu
```

| Part | Meaning |
|---|---|
| `(^|\s)` | Tag must start at line start or after whitespace |
| `#` | Literal hash — the tag sigil |
| `[\p{L}\p{N}...]` | One or more: Unicode letters (`\p{L}`), Unicode numbers (`\p{N}`), hyphens, underscores, slashes, emoji |
| `g` flag | Find all matches in the document |
| `u` flag | Enable Unicode property escapes |

> [!WARNING]
> Tags must contain at least one non-numeric character. `#123` is not a valid tag — it would be interpreted as a Markdown heading or number. The LSP should check: if the tag body matches `/^\p{N}+$/u`, reject it.

---

## Tag Hierarchy

The `/` character creates a parent-child relationship:

| Tag | Is child of |
|---|---|
| `#project/active` | `#project` |
| `#project/archived` | `#project` |
| `#lang/python/async` | `#lang/python` and `#lang` |

Searching `#project` in Obsidian matches all child tags. The LSP should model this as a tree structure indexed from the vault tag scan.

---

## YAML Frontmatter Tags

Tags in frontmatter are listed under the `tags:` key (also accepted: `tag:`). Values do **not** include the `#` prefix in YAML.

```yaml
---
tags:
  - project/active
  - machine-learning
  - reference
---
```

Obsidian also accepts inline YAML arrays and a mix of quoted/unquoted values:

```yaml
tags: [project/active, machine-learning]
```

> [!NOTE]
> YAML frontmatter tags and inline body tags are treated identically by Obsidian's tag index. The LSP should merge both sources when answering "find all uses of tag X".

---

## Exclusion Rules

| Pattern | Reason for Exclusion |
|---|---|
| `#123` | All-numeric body — not a tag |
| `#` alone | No body — not a tag |
| Tags inside [[math]] regions | Opaque region — skip |
| Tags inside [[comments]] | Opaque region — skip |
| Tags inside [[templater]] commands | Opaque region — skip |
| Tags inside fenced code blocks | Opaque region — skip |

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Indexing | On open/save, scan body and frontmatter for all tags; add to vault tag index. |
| Completion | Trigger character: `#`. Offer all known tags from the vault index, ranked by frequency. |
| Find references | Return all inline and frontmatter occurrences of a given tag (including child tags). |
| Code action | Convert inline `#tag` to a `tags:` frontmatter entry (or vice versa). |
| Hover | Show usage count for the tag across the vault. |
