# lsp/services/

Supporting services for the LSP layer.

These are NestJS `@Injectable()` singletons that hold cross-cutting state
needed by multiple handlers in `LspModule`.

## Files

| File                     | Role                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `capability-registry.ts` | Accumulates server capabilities advertised to the client; merged during `onModuleInit` and returned in the `initialize` response     |
| `document-store.ts`      | In-memory store of open `TextDocument` instances (vscode-languageserver-textdocument); tracks content and version for open documents |
| `lifecycle-state.ts`     | State machine tracking `uninitialized → initialized → active → shutdown`; guards handlers against out-of-order requests              |
| `status-notifier.ts`     | Sends `window/showMessage` and `window/logMessage` notifications to the client                                                       |
