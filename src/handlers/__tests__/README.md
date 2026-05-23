# src/handlers/**tests**/

Unit tests for editor-facing LSP request handlers.

## Responsibilities

- Verify definitions, references, rename, hover, symbols, semantic tokens,
  document links, folding ranges, selection ranges, highlights, and CodeLens.
- Keep handler behavior tied to `VaultIndex` as the single source of parsed
  documents.
- Assert LSP positions, ranges, and workspace edits in protocol-compatible
  shapes.

Tests should exercise public handler APIs and realistic parsed document state.
