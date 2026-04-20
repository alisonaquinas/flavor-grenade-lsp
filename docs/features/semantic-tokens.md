---
title: Feature — Semantic Tokens
tags: [features/, semantic-tokens, syntax-highlighting]
aliases: [semantic tokens, syntax highlighting, semantic highlighting]
---

# Feature — Semantic Tokens

Semantic tokens provide editor-level syntax highlighting for OFM constructs that are not covered by TextMate grammars. The server responds to `textDocument/semanticTokens/full` and `textDocument/semanticTokens/range` requests with encoded token data.

> [!NOTE]
> Semantic tokens supplement — they do not replace — TextMate grammar-based highlighting. Editors apply semantic token highlighting on top of grammar highlighting. Token types defined here are meaningful only to editors that support LSP semantic tokens (VS Code, Neovim with nvim-lspconfig ≥ 0.1.7, Helix, Zed).

## Token Type Registration

During `initialize`, the server declares its semantic token types and modifiers in the `semanticTokensProvider` capability:

```json
{
  "semanticTokensProvider": {
    "legend": {
      "tokenTypes": [
        "wikiLink", "wikiLinkTarget", "wikiLinkHeading",
        "wikiLinkAlias", "embedLink", "tag", "calloutType",
        "blockAnchor", "mathBlock", "mathInline",
        "obsidianComment", "frontmatter", "frontmatterKey"
      ],
      "tokenModifiers": ["defaultLibrary"]
    },
    "full": true,
    "range": true
  }
}
```

## Token Type Table

| Token Type | Applied to | Modifier | Notes |
|---|---|---|---|
| `wikiLink` | `[[` and `]]` delimiter characters only | none | Does not include the target or alias text |
| `wikiLinkTarget` | Document target segment of a wiki-link (e.g., `my-note` in `[[my-note#h]]`) | none | Excludes `#heading`, `^anchor`, and `|alias` portions |
| `wikiLinkHeading` | Heading segment of a wiki-link (e.g., `Introduction` in `[[doc#Introduction]]`), including the `#` character | none | |
| `wikiLinkAlias` | Alias segment of a wiki-link (e.g., `Display Text` in `[[doc\|Display Text]]`), including the `\|` separator | none | |
| `embedLink` | Full `![[target]]` span including `!`, `[[`, target, and `]]` | none | Image, audio, video, PDF, and `.md` embeds all use this type |
| `tag` | `#tagname` in body (full span including `#`) | none | Not applied inside code blocks or math |
| `calloutType` | `TYPE` portion of `[!TYPE]` inside a callout blockquote | none | Excludes `[!` and `]` characters |
| `blockAnchor` | `^blockid` at end of a block line (full span including `^`) | none | Only valid line-end anchors per OFM-BLOCK-003 |
| `mathBlock` | Entire `$$...$$` span including delimiters | none | Multi-line; uses range token |
| `mathInline` | Entire `$...$` span including delimiters | none | Single-line |
| `obsidianComment` | Entire `%%...%%` span including delimiters | none | May be multi-line |
| `frontmatter` | Entire frontmatter block from first `---` to closing `---` | none | Applied as a single range |
| `frontmatterKey` | Key names in frontmatter for known Obsidian special keys (`aliases`, `tags`, `cssclasses`, `publish`, `date`) | `defaultLibrary` | The `defaultLibrary` modifier signals that these are well-known keys with defined semantics |

## Token Encoding

LSP semantic tokens are encoded as a flat array of integers using the delta-encoding scheme defined in LSP 3.17 §3.16.6. Each token is represented by 5 integers:

1. `deltaLine` — line delta from the previous token
2. `deltaStartChar` — character delta from the previous token's start (or 0 if on a different line)
3. `length` — number of characters in the token span
4. `tokenType` — index into the `tokenTypes` legend array
5. `tokenModifiers` — bitmask of modifier indices

The server produces tokens in document order (top-to-bottom, left-to-right) as required by the LSP specification.

## Range Tokens

Multi-line tokens (`mathBlock`, `obsidianComment`, `frontmatter`) are emitted as a single range token. Not all editors support range tokens — if the editor does not advertise `multilineTokenSupport: true` during `initialize`, the server falls back to emitting one token per line for multi-line spans.

## Full vs. Range Requests

The server supports both:

- **`textDocument/semanticTokens/full`**: Returns tokens for the entire document. Used by editors on document open and after significant changes.
- **`textDocument/semanticTokens/range`**: Returns tokens for a specific range. Used by editors to fetch tokens for the visible viewport without processing the entire document. This is important for performance on large documents.

> [!TIP]
> Editors that support `semanticTokens/range` (VS Code, Zed) will only request tokens for the visible range on initial render, dramatically reducing the work the server must do for large documents. Ensure that the OFM parser's token extraction supports partial-document ranges.

## Editor Theme Integration

To display OFM semantic tokens with custom colors, users must configure their editor's semantic token color customisation. Examples:

**VS Code (`settings.json`):**

```json
{
  "editor.semanticTokenColorCustomizations": {
    "rules": {
      "wikiLink": "#7c6f64",
      "wikiLinkTarget": "#458588",
      "tag": "#689d6a",
      "blockAnchor": "#d79921",
      "obsidianComment": "#504945"
    }
  }
}
```

**Neovim (Lua):**

```lua
vim.api.nvim_set_hl(0, "@lsp.type.wikiLink", { fg = "#7c6f64" })
vim.api.nvim_set_hl(0, "@lsp.type.wikiLinkTarget", { fg = "#458588" })
```

The server does not dictate colors. These are user-side theme configurations.

## Performance

Semantic tokens for the full document are computed in a single pass over the OFM AST after parsing. For a typical note (2,000 tokens), this takes under 1 ms. For documents with many wiki-links (e.g., index notes with 500+ links), the token array may be large but the computation is still linear in document size.

The server caches the full token array per document version. If the document has not changed since the last request, the cached array is returned without re-parsing.

## Related

- [[ADR002-ofm-only-scope]]
- [[ADR006-block-ref-indexing]]
- [[features/completions]]
- [[features/hover]]
- [[ofm-spec/index]]
