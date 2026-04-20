# AGENTS.md — src/handlers/

## Purpose

Implements all LSP request handlers that deliver OFM-specific editor
intelligence. Each handler reads from `VaultIndex` and delegates resolution to
`Oracle`, `RefGraph`, `TagRegistry`, etc.

## Layout

```
handlers/
├── cursor-entity.ts               # identify the OFM token at a cursor position
├── definition.handler.ts          # textDocument/definition
├── references.handler.ts          # textDocument/references
├── hover.handler.ts               # textDocument/hover
├── code-lens.handler.ts           # textDocument/codeLens
├── document-highlight.handler.ts  # textDocument/documentHighlight
├── prepare-rename.handler.ts      # textDocument/prepareRename
├── rename.handler.ts              # textDocument/rename
├── workspace-symbol.handler.ts    # workspace/symbol
├── document-symbol.handler.ts     # textDocument/documentSymbol
├── semantic-tokens.handler.ts     # textDocument/semanticTokens/full
├── workspace-edit-builder.ts      # WorkspaceEdit construction helper
└── __tests__/
```

## Invariants

- Handlers must be stateless between requests. Any state (e.g. cached document
  text for prepareRename) must be managed via an injected service, not as
  instance variables on the handler.
- `PrepareRenameHandler` caches document text in its own map (set by
  `LspModule` on `didOpen`/`didChange`) because it needs the text at request
  time, which may lag behind the vault index.
- `RenameHandler` delegates `WorkspaceEdit` construction to
  `WorkspaceEditBuilder` (instantiated per-request, not a NestJS provider).
- `cursor-entity.ts` is a pure function module — it has no NestJS decorators
  and should never be converted into an `@Injectable()`.

## Workflows

- **Adding a handler for a new LSP method**: create the handler class here,
  register it as a provider in `lsp/lsp.module.ts` (or in the relevant
  feature module if it groups naturally), and wire it in `onModuleInit`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [`src/resolution/`](../resolution/README.md) — Oracle and ref graph used by most handlers
