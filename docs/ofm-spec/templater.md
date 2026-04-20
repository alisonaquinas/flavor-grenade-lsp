---
title: OFM Spec — Templater
tags:
  - ofm-spec/templater
  - ofm-spec
aliases:
  - Templater Spec
  - Templater Passthrough Spec
  - OFM Templater
---

# Templater

Templater is an Obsidian community plugin that processes template commands at note creation time. Its syntax (`<% ... %>`) is not OFM — it is a template engine language that happens to live inside `.md` files. `flavor-grenade-lsp` does **not** implement Templater support; it only identifies Templater regions as opaque and ignores them.

Official plugin reference: [Templater documentation](https://silentvoid13.github.io/Templater/)

---

## Rule Codes

| Code | Rule |
|---|---|
| `OFM-TPL-001` | Templater syntax uses `<% ... %>` delimiters. |
| `OFM-TPL-002` | Templater regions are opaque to OFM analysis. |
| `OFM-TPL-003` | Templater scanning runs after comments and math but before OFM element detection. |

## Syntax Forms

| Form | Meaning |
|---|---|
| `<% tp.file.title %>` | Simple expression — evaluates to a string |
| `<% tp.date.now("YYYY-MM-DD") %>` | Expression with arguments |
| `<%* const x = 5; tR += x; *%>` | Execution block — arbitrary JS with `*` |
| `<%- tp.file.content %>` | Unescaped expression (HTML not escaped) |

All forms share the `<%` opening and `%>` closing delimiter. The `*` and `-` modifiers appear immediately after `<%`.

---

## Canonical Regex

```regexp
/<%[^]*?%>/g
```

| Part | Meaning |
|---|---|
| `<%` | Opening delimiter |
| `[^]*?` | Any content including newlines (non-greedy). Uses `[^]` rather than `[\s\S]` for clarity |
| `%>` | Closing delimiter |
| `g` | Find all occurrences |

> [!WARNING]
> Do not use `.` with the `s` (dotall) flag if the runtime does not support it. `[^]*?` is the portable cross-engine equivalent for matching across newlines.

---

## Opaque Region Treatment

Templater commands are excluded from **all** OFM analysis:

| Analysis type | Excluded from Templater regions? |
|---|---|
| Tag detection (`#tag`) | Yes |
| Wiki-link detection (`[[...]]`) | Yes |
| Block ID anchor detection (`^id`) | Yes |
| Diagnostics | Yes |
| Completion triggers | Yes |
| Rename edits | Yes |

A `[[wiki-link]]` inside a Templater command (e.g., `<% "[[note]]" %>`) must not be followed or diagnosed.

---

## Why Not Implement Templater?

Templater expressions are evaluated by the Obsidian plugin at note creation time. They can contain arbitrary JavaScript (in execution blocks). The LSP has no access to the Templater runtime, the vault's folder templates configuration, or the execution context. Implementing even basic Templater completion would require replicating Templater's full API surface — out of scope for `flavor-grenade-lsp`.

> [!NOTE]
> If Templater LSP support is desired in the future, it should be implemented as a separate LSP server or a dedicated `flavor-grenade-lsp` module, not inline with the OFM spec layer.

---

## Parse Precedence

Templater regions are scanned after [[comments]] and [[math]] but before any OFM element detection. A note may contain both Templater commands and valid OFM — the Templater scanner marks its regions opaque so that subsequent passes do not misinterpret template syntax as OFM.

See [[index]] for the full parse precedence order.

---

## LSP Relevance

| Feature | Detail |
|---|---|
| Semantic tokens | Mark Templater regions as a `templateCommand` token type for syntax dimming. |
| Fold range | Multi-line Templater execution blocks (`<%*...%>`) may optionally be fold ranges. |
| Completion | **None** — no completions inside Templater regions. |
| Diagnostics | **None** — Templater syntax is not validated by this LSP. |
