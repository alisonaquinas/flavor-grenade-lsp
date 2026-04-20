---
title: Feature — Document and Workspace Symbols
tags: [features/, symbols, document-symbols, workspace-symbols]
aliases: [symbols, outline, workspace symbol search]
---

# Feature — Document and Workspace Symbols

Symbol support encompasses two LSP capabilities: **document symbols** (`textDocument/documentSymbol`) and **workspace symbols** (`workspace/symbol`). Document symbols power the editor's outline/breadcrumb view; workspace symbols enable fuzzy search across all documents in the vault.

## Document Symbols

The server handles `textDocument/documentSymbol` requests by returning the heading hierarchy of the document as a tree of `DocumentSymbol` objects.

### Heading Hierarchy as Symbol Tree

The OFM parser produces `HeadingNode` objects for every heading in the document. The document symbol provider converts these into a nested `DocumentSymbol` tree respecting heading levels:

- An `h1` (`# Heading`) produces a top-level `DocumentSymbol` with `kind: String` (representing a section).
- An `h2` under an `h1` is nested as a child of that `h1` symbol.
- An `h3` under an `h2` is nested accordingly.
- If a lower-level heading appears without a parent (e.g., an `h3` with no preceding `h2`), it is promoted to the top level of its nearest ancestor. No error is raised; OFM documents frequently have irregular heading hierarchies.

Each `DocumentSymbol` includes:

- `name`: the heading text (without `#` prefix)
- `kind`: `SymbolKind.String` (6)
- `range`: the full line range of the heading
- `selectionRange`: the text-only portion of the heading (after `#`)

### Optional Block Anchor Symbols

When `symbols.block_anchors = true` is set in `.flavor-grenade.toml`, `^blockid` anchors are also included as symbols in the document symbol tree. They appear as leaves (no children) under the heading they belong to, with `kind: SymbolKind.Key` (14) and the name `^blockid`.

This option is off by default because most users do not want to see block anchors cluttering the outline.

### Frontmatter as a Symbol

When `symbols.frontmatter = true` is set, the frontmatter block is included as a top-level symbol with `name: "Frontmatter"`, `kind: SymbolKind.Module` (2), and `range` covering the `---` delimiters.

## Workspace Symbols

The server handles `workspace/symbol` (LSP 3.17) and `workspace/symbolInformation` requests. Workspace symbol search is a vault-wide fuzzy search across all headings.

### What is indexed

The workspace symbol index contains:

- Every heading from every document in the vault (all heading levels)
- Optionally, `^blockid` anchors when `symbols.block_anchors = true`

Each indexed entry carries:

- `name`: the heading text
- `containerName`: the document's file stem (e.g., `my-note`) to provide context
- `kind`: `SymbolKind.String`
- `location`: the heading's position in its document

### Subsequence Matching

Workspace symbol queries use **subsequence matching**, not substring matching. A query `df` matches `Data Flow` because `d` and `f` appear in that order in `Data Flow` as a subsequence. This matches the behaviour of most fuzzy finders (fzf, telescope.nvim, VSCode's quick-open).

Scoring: matches are ranked by:

1. Exact prefix match (query is a prefix of the name) — highest score
2. Word-boundary match (query characters match the start of words) — second
3. Pure subsequence match — lowest score among matches

Up to `completion.candidates` (default 50) results are returned. When the index is larger, `isIncomplete: true` is set on the response if the LSP version supports it.

### Vault Scope

Workspace symbols search the entire vault, including documents in subdirectories. If the editor sends a non-empty query, results are filtered to those with a non-zero match score. An empty query returns the first `completion.candidates` symbols in index order (alphabetical by file stem, then by heading order within the file).

> [!TIP]
> Workspace symbols are the recommended way to navigate to any heading in a large vault without knowing the exact document it lives in. Trigger it with `Ctrl+T` in VS Code or `:Telescope lsp_dynamic_workspace_symbols` in Neovim.

## Performance

The workspace symbol index is built alongside `OFMIndex` during Phase 4. It is updated incrementally: when a document changes, only that document's symbols are re-extracted and merged into the index. A full rebuild is never required for a change to a single document.

For vaults up to 50,000 headings, subsequence matching should complete in under 50 ms. For larger vaults, the index may be partitioned by first character of the heading for faster prefix filtering.

## Configuration Keys

| Key | Type | Default | Description |
|---|---|---|---|
| `symbols.block_anchors` | boolean | `false` | Include `^blockid` anchors in document and workspace symbols |
| `symbols.frontmatter` | boolean | `false` | Include frontmatter block as a symbol in document symbols |
| `completion.candidates` | integer | `50` | Maximum workspace symbol results per query |

## Related

- [[features/navigation]]
- [[features/completions]]
- [[features/code-lens]]
- [[concepts/symbol-model]]
- [[ADR006-block-ref-indexing]]
- [[requirements/wiki-link-resolution]]
