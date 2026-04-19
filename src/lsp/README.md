# lsp/

LSP lifecycle, document management, and the root NestJS module.

`lsp.module.ts` is the composition root for the entire server. It imports all
feature modules, registers every method handler with the `JsonRpcDispatcher`,
and starts the `StdioReader` on `onModuleInit`.

## Subdirectories

| Directory   | Role                                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| `handlers/` | Handlers for LSP lifecycle notifications: initialize, initialized, shutdown, exit, didOpen, didChange, didClose |
| `services/` | Supporting services: `CapabilityRegistry`, `DocumentStore`, `LifecycleState`, `StatusNotifier`                  |

## Key File

`lsp.module.ts` — the `@Module` decorator lists all imported feature modules
and all providers. The `onModuleInit` method wires every handler to the
dispatcher and then calls `reader.start(process.stdin)`.

## Capabilities Advertised

The server advertises these capabilities at initialize time:

- `definitionProvider`
- `referencesProvider`
- `completionProvider` (trigger characters: `[`, `!`, `#`, `^`, `>`)
- `codeActionProvider`
- `hoverProvider`
- `codeLensProvider`
- `documentHighlightProvider`
- `renameProvider` (with `prepareProvider`)
- `workspaceSymbolProvider`
- `documentSymbolProvider`
- `semanticTokensProvider` (full, no range)
