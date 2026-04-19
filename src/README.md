# src/

All TypeScript source for the flavor-grenade-lsp server.

The entry point is `main.ts`, which bootstraps the NestJS application context
using `LspModule` as the root module. From there, NestJS resolves all module
dependencies and calls each module's `onModuleInit` hook to register handlers
and start the stdio reader.

## Subdirectories

| Directory       | Role                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `transport/`    | JSON-RPC 2.0 framing over stdio — `StdioReader`, `StdioWriter`, `JsonRpcDispatcher`                                       |
| `lsp/`          | LSP lifecycle state machine, document store, and textDocument notification handlers                                       |
| `parser/`       | OFM document parser — produces `OFMDoc` with a populated `OFMIndex`                                                       |
| `vault/`        | Vault detection, file watcher, document indexing (`VaultIndex`), vault scanner                                            |
| `resolution/`   | Wiki-link resolution (`Oracle`), link/embed resolvers, diagnostic service, ref graph                                      |
| `completion/`   | Completion router and per-trigger providers (wiki-links, tags, callouts, embeds, headings, block refs)                    |
| `handlers/`     | LSP request handlers consumed by `LspModule` (definition, references, hover, code lens, rename, symbols, semantic tokens) |
| `navigation/`   | NestJS module grouping code lens and document highlight                                                                   |
| `rename/`       | NestJS module grouping prepareRename and rename handlers                                                                  |
| `code-actions/` | Code action handler and all quick-fix action implementations                                                              |
| `tags/`         | `TagRegistry` — vault-wide tag occurrence index                                                                           |
| `test/`         | BDD step definitions, world, lsp-types, integration tests, and fixtures                                                   |

## Entry Point

`main.ts` — calls `NestFactory.createApplicationContext(LspModule)`. The server
communicates exclusively over stdin/stdout; it writes nothing to stdout except
JSON-RPC responses.
