---
title: Feature — Code Lens
tags: [features/, code-lens, references]
aliases: [code lens, N references, inline reference counts]
---

# Feature — Code Lens

Code lens items are inline annotations displayed above specific lines in the editor. flavor-grenade-lsp uses code lens exclusively to show **reference counts** — the number of times a heading or block anchor is referenced elsewhere in the vault.

> [!NOTE]
> Code lens is only meaningful in vault mode. In single-file mode, the server returns an empty `textDocument/codeLens` response. Displaying misleading counts (e.g., "0 references" for everything when no vault index is available) would cause confusion, so code lens is suppressed entirely in single-file mode.

## Heading Code Lens

**Shown above:** Every heading line in the document (`h1` through `h6`).

**Text:** `"N references"` where N is the count of `[[doc#heading]]` links across the entire vault that resolve to this heading (including same-document `[[#heading]]` links).

**Zero references:** A heading with zero inbound references shows `"0 references"`. This is intentional — it is one of the most useful signals in a note-taking workflow, indicating a "dangling" or orphaned section that is defined but never linked to. Writers can use this to identify sections that may be worth consolidating, deleting, or linking.

**Click behaviour:** Clicking the `"N references"` lens triggers a `textDocument/references` request at the heading line position with `includeDeclaration: false`. The editor then shows all reference locations in a find-references panel.

**Example:**

```markdown
## Introduction          ← "3 references"

Text here.

## Background           ← "0 references"

Text here.
```

## Block Anchor Code Lens

**Shown above:** Every line containing a `^blockid` anchor.

> [!NOTE]
> Block anchor code lens items appear above the **line containing the anchor**, not above the paragraph's first line. This is consistent with how Obsidian displays block ids in its own UI.

**Text:** `"N references"` where N is the count of `[[doc#^blockid]]` links across the vault that resolve to this anchor.

**Zero references:** Shown as `"0 references"`. Block anchors with zero references indicate that the anchor was created but never used, which may indicate that the link was deleted elsewhere. This is useful for vault hygiene.

**Click behaviour:** Same as heading code lens — triggers `textDocument/references` at the anchor position.

**Example:**

```markdown
Some paragraph text about an important concept. ^concept-anchor
```

Displayed as:

```text
"2 references"
Some paragraph text about an important concept. ^concept-anchor
```

## Lazy Resolution

Code lens supports a two-phase protocol in LSP:

1. `textDocument/codeLens` returns items with `command: null` (unresolved). Each item includes enough data in its `data` field to resolve the count later.
2. `codeLens/resolve` is called for each visible item when the editor needs to display it, returning the fully populated `command` field.

flavor-grenade-lsp implements full eager resolution: `textDocument/codeLens` returns fully resolved items with the reference count already populated. This simplifies the implementation because the `OFMIndex` and `RefGraph` already contain all the data needed to compute counts without additional disk I/O.

If performance profiling shows that eager resolution adds unacceptable latency for very large documents (many headings), lazy resolution can be introduced in a follow-up phase.

## Performance Considerations

The reference count for a heading or block anchor is computed by querying the reverse-ref index in `RefGraph`. This is an O(1) lookup per heading once the index is built. For a document with 100 headings, `textDocument/codeLens` should complete in under 5 ms.

The code lens is re-requested by the editor whenever the document is saved or — in some editors — on every change. The server must ensure that `textDocument/codeLens` responses are fast enough not to block the editor's render cycle.

## Configuration Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `codeLens.enabled` | boolean | `true` | Master switch for all code lens items |
| `codeLens.headings` | boolean | `true` | Show "N references" above headings |
| `codeLens.blockAnchors` | boolean | `true` | Show "N references" above block anchors |

Setting `codeLens.enabled = false` causes `textDocument/codeLens` to return an empty array. The capability is still advertised during `initialize` so that the editor knows code lens is supported — users can re-enable it via config without a server restart.

> [!TIP]
> If code lens annotations are visually distracting in a large document, set `codeLens.headings = false` and `codeLens.blockAnchors = false` rather than disabling the capability entirely. This preserves the click-to-find-references interaction without the inline annotations.

## Related

- [[features/navigation]]
- [[features/symbols]]
- [[ADR006-block-ref-indexing]]
- [[concepts/symbol-model]]
- [[requirements/wiki-link-resolution]]
