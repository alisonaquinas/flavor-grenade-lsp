---
title: OFM Spec — Comments
tags:
  - ofm-spec/comments
  - ofm-spec
aliases:
  - Comment Spec
  - OFM Comments
  - Obsidian Comment Spec
---

# Comments

Obsidian comments use `%%` as delimiters. Content inside comment regions is hidden from the rendered preview and from exports. Other Markdown renderers display comment text as raw characters — comments are an OFM-only construct.

Official reference: [Comments](https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax#Comments)

---

## Block Comment Syntax

A block comment spans one or more lines between `%%` delimiters, each on their own line:

```markdown
%%
This content is hidden from the reader.
It can contain anything — wiki-links, tags, personal notes.
%%
```

---

## Inline Comment Syntax

An inline comment appears on a single line with `%%` opening and closing on the same line:

```markdown
This is visible text. %%This part is hidden.%% This is also visible.
```

> [!NOTE]
> The distinction between "block" and "inline" is primarily a scanning concern. Obsidian treats both the same way at render time: the content is suppressed.

---

## Regex

Block comment scanner (apply before inline scanner):

```regexp
/^%%\n[\s\S]*?\n%%$/gm
```

Inline comment scanner:

```regexp
/%%[^%\n]+%%/g
```

| Pattern | Matches |
|---|---|
| `^%%\n` | Opening `%%` on its own line |
| `[\s\S]*?` | Any content (non-greedy) |
| `\n%%$` | Closing `%%` on its own line |
| `%%[^%\n]+%%` | Inline: no `%` or newline inside |

> [!WARNING]
> Scan for block comments before inline comments. A block comment whose opening `%%` is followed by content on the same line may be ambiguous — apply the block pattern first and fall through to inline.

---

## Opaque Region Treatment

Comment content is excluded from **all** OFM analysis:

| Analysis type | Excluded from comments? |
|---|---|
| Tag detection (`#tag`) | Yes |
| Wiki-link detection (`[[...]]`) | Yes |
| Block ID anchor detection (`^id`) | Yes |
| Diagnostics | Yes |
| Completion triggers | Yes |
| Rename edits | Yes |

A `[[wiki-link]]` inside a comment is intentionally inert — the LSP must not follow it, diagnose it, or offer completions for it. See [[index]] for the full opaque region priority order.

---

## Interaction with Other Renderers

| Renderer | Comment behaviour |
|---|---|
| Obsidian (reading view) | Hidden — not rendered |
| Obsidian (source mode) | Visible as raw text |
| GitHub Markdown | Displayed as raw `%%...%%` text |
| Pandoc | Passed through as raw text |
| VS Code Markdown | Displayed as raw text |

This asymmetry is why comments must be treated as opaque: a tag inside a comment is visible in source mode but must not pollute the vault tag index.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Semantic tokens | Mark comment regions as a `comment` token type. Both block and inline variants. |
| Fold range | Block comments (`%%\n...\n%%`) are fold ranges. |
| Completion | **None** — no completions inside comment regions. |
| Diagnostics | **None** — comment content is intentionally unanalyzed. |
