# handlers/

LSP request handlers for OFM feature capabilities.

These handlers implement the LSP methods that expose OFM-specific intelligence
to the editor. Unlike `lsp/handlers/` (lifecycle), these handlers operate on
the parsed document content from `VaultIndex`.

## Files

| File | LSP Method | Role |
| --- | --- | --- |
| `definition.handler.ts` | `textDocument/definition` | Resolves wiki-link at cursor to the target document location |
| `references.handler.ts` | `textDocument/references` | Finds all wiki-links across the vault pointing to the document at cursor |
| `hover.handler.ts` | `textDocument/hover` | Returns markdown hover content for a wiki-link at cursor |
| `code-lens.handler.ts` | `textDocument/codeLens` | Returns code lens items (e.g. back-link counts) for the current document |
| `document-highlight.handler.ts` | `textDocument/documentHighlight` | Highlights all occurrences of the symbol at cursor in the current document |
| `prepare-rename.handler.ts` | `textDocument/prepareRename` | Validates that the cursor is on a renameable symbol and returns the current name range |
| `rename.handler.ts` | `textDocument/rename` | Generates a `WorkspaceEdit` renaming a heading or file stem and updating all inbound links |
| `workspace-symbol.handler.ts` | `workspace/symbol` | Returns all document headings matching the query across the vault |
| `document-symbol.handler.ts` | `textDocument/documentSymbol` | Returns the heading hierarchy of the current document as a symbol tree |
| `semantic-tokens.handler.ts` | `textDocument/semanticTokens/full` | Returns semantic token data for OFM-specific tokens (wiki-links, tags, etc.) |
| `workspace-edit-builder.ts` | — | Helper class that constructs `WorkspaceEdit` objects for rename operations |
| `cursor-entity.ts` | — | Identifies the OFM entity (wiki-link, tag, heading, etc.) at a given cursor position |
