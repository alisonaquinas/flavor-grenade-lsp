---
title: OFM Spec — Callouts
tags:
  - ofm-spec/callouts
  - ofm-spec
aliases:
  - Callout Spec
  - OFM Callouts
---

# Callouts

Callouts are typed, optionally collapsible highlighted blocks built on top of CommonMark blockquote syntax. They are an OFM extension: standard Markdown renderers display them as plain blockquotes.

Official reference: [Callouts](https://help.obsidian.md/Editing+and+formatting/Callouts)

---

## Syntax

```markdown
> [!TYPE] Optional Title
> Body content here.
> Multiple lines are fine.
```

- The first line of the blockquote must match `[!TYPE]` (case-insensitive).
- If no title text follows the type, Obsidian uses the type name as the title.
- Body lines continue with `> ` prefix (the space after `>` is optional).

---

## Foldable Variant

```markdown
> [!NOTE]- Collapsed by default
> Body only visible after the user expands.

> [!TIP]+ Explicitly expanded
> Body visible immediately; user can collapse.
```

| Modifier | Default state |
|---|---|
| `-` | Collapsed |
| `+` | Expanded |
| (none) | Expanded, not collapsible |

---

## Nested Callouts

```markdown
> [!INFO] Outer
> Outer body.
>> [!WARNING] Inner
>> Inner body.
```

Each additional `>` level creates one nesting depth. The LSP should track nesting depth for fold range calculation.

---

## Standard Callout Types

| Type | Common Aliases |
|---|---|
| `NOTE` | — |
| `INFO` | — |
| `TIP` | `HINT`, `IMPORTANT` |
| `WARNING` | `CAUTION`, `ATTENTION` |
| `DANGER` | `ERROR` |
| `SUCCESS` | `CHECK`, `DONE` |
| `QUESTION` | `HELP`, `FAQ` |
| `FAILURE` | `FAIL`, `MISSING` |
| `BUG` | — |
| `EXAMPLE` | — |
| `QUOTE` | `CITE` |
| `ABSTRACT` | `SUMMARY`, `TLDR` |
| `TODO` | — |

> [!NOTE]
> Type matching is case-insensitive. `[!note]`, `[!NOTE]`, and `[!Note]` are all valid and render identically. Completion should insert uppercase by convention.

---

## Custom Callout Types

Users may define custom callout types via their vault's CSS snippets. Obsidian renders unknown types with a default icon and color. The LSP should not treat unknown types as errors by default — emit a configurable warning diagnostic only.

---

## Detection Regex

To detect whether a blockquote line opens a callout:

```regexp
/^(> ?)+\[![^\]]*\]/m
```

To extract the callout type and optional fold modifier from the first line:

```regexp
/\[!([^\]]*)\]([+-]?)/
```

| Group | Captures |
|---|---|
| `([^\]]*)` | Type string (e.g., `NOTE`, `WARNING`) |
| `([+-]?)` | Fold modifier: `+`, `-`, or empty |

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Completion | Trigger: `[!` after `> `. Offer all 13 standard types (with aliases). Insert with title placeholder. |
| Semantic tokens | Mark callout type (`NOTE`, `WARNING`, etc.) as a distinct token type for syntax coloring. |
| Diagnostics | Optionally warn on unknown callout types. Do not warn by default — custom types are valid. |
| Fold range | Each callout block (from opening `> [!...]` to last `>` line) is a fold range. |
