# navigation/

NestJS module grouping document navigation features.

Provides code lens and document highlight handlers. These capabilities let
editors display back-link counts inline and highlight all occurrences of the
current symbol.

## Files

| File | Role |
| --- | --- |
| `navigation.module.ts` | NestJS module — imports `ParserModule`, `VaultModule`, `ResolutionModule`; provides and exports `CodeLensHandler` and `DocumentHighlightHandler` |

The handler implementations live in `src/handlers/`:
- `code-lens.handler.ts` — `textDocument/codeLens`
- `document-highlight.handler.ts` — `textDocument/documentHighlight`
