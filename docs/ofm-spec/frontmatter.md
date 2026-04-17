---
title: OFM Spec — Frontmatter
tags:
  - ofm-spec/frontmatter
  - ofm-spec
aliases:
  - Frontmatter Spec
  - OFM Frontmatter
  - YAML Frontmatter Spec
---

# Frontmatter

YAML frontmatter is metadata attached to an OFM note. Obsidian parses it and exposes the values in the Properties panel. It is the authoritative source for note titles (via `aliases`), classification (via `tags`), and LSP-relevant configuration.

Official reference: [Properties](https://help.obsidian.md/Editing+and+formatting/Properties)

---

## Delimiter Rules

- The opening `---` must be on the **very first line** of the file — no blank lines, no BOM, nothing before it.
- The closing delimiter is `---` or `...` on its own line.
- Everything between the delimiters is parsed as YAML.
- A file with no opening `---` on line 1 has no frontmatter.

```yaml
---
title: My Note
tags:
  - reference
aliases:
  - My Note Alt
---
```

> [!WARNING]
> Obsidian strips YAML comments (`# comment`) from the frontmatter display but they are valid in the source. The LSP must not emit diagnostics for YAML comments inside frontmatter.

---

## YAML Subset Quirks

Obsidian does not use a full YAML 1.2 parser. Known quirks relevant to the LSP:

- Multi-line scalar values (`|` and `>` block scalars) are parsed but displayed as a single line in Properties.
- Duplicate keys: the last value wins (YAML spec says first wins — Obsidian deviates).
- Type coercion: `true`/`false` become booleans; bare integers become numbers; ISO 8601 dates become date objects.

---

## Special Keys

| Key | Type | Purpose |
|---|---|---|
| `aliases` | string or string array | Alternative names for wiki-link resolution |
| `tags` | string or string array | Equivalent to inline tags in the tag index |
| `tag` | string or string array | Accepted alias for `tags` |
| `cssclasses` | string or string array | CSS class names applied to the note body in reading view |
| `publish` | boolean | Controls visibility on Obsidian Publish |
| `disabled rules` | string array | Linting rule suppression (obsidian-linter convention) |

> [!NOTE]
> Both `tags` and `tag` are valid. The LSP should normalize to `tags` when performing code actions. When reading, treat both as equivalent.

---

## Array Format Variants

Obsidian accepts multiple YAML array formats for `tags` and `aliases`:

```yaml
# Block array (preferred)
tags:
  - one
  - two

# Inline array
tags: [one, two]

# Single string (treated as one-element array)
tags: one
```

The LSP should parse all three forms and present them uniformly as arrays.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Diagnostics | Malformed YAML (parse error), duplicate keys (warn), `tags` containing `#` prefix values (Obsidian strips `#` but it is redundant — warn). |
| Completion | After `---\n`, offer known property keys from the vault schema. After a known key, offer type-appropriate values (e.g., known tags for `tags:`, known CSS classes for `cssclasses:`). |
| Hover | Show property type, description, and value count across the vault for any key. |
| Code actions | Insert `created:` timestamp, sort keys alphabetically, convert inline `#tag` to `tags:` entry, add `aliases:` from note title. |
| Semantic tokens | Mark the entire frontmatter block as a distinct token type for syntax highlighting. |
| Fold range | The frontmatter block (`---` to `---`) is a fold range. |
