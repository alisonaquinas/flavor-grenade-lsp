# lsp/handlers/

LSP lifecycle notification and request handlers.

These handlers implement the mandatory LSP handshake and document
synchronization protocol. They are owned by `LspModule` rather than a feature
module because they operate on cross-cutting concerns (lifecycle state,
document store) rather than on OFM content.

## Files

| File | LSP Method | Notes |
| --- | --- | --- |
| `initialize.handler.ts` | `initialize` (request) | Validates client capabilities, sets `LifecycleState` to `initialized`, returns server capabilities |
| `initialized.handler.ts` | `initialized` (notification) | Transitions state to `active`; triggers vault scan |
| `shutdown.handler.ts` | `shutdown` (request) | Sets state to `shutdown`, returns null |
| `exit.handler.ts` | `exit` (notification) | Calls `process.exit(0)` after shutdown, or `process.exit(1)` if shutdown was skipped |
| `did-open.handler.ts` | `textDocument/didOpen` | Parses document, stores in `VaultIndex` and `DocumentStore` |
| `did-change.handler.ts` | `textDocument/didChange` | Applies incremental text changes, re-parses, updates index |
| `did-close.handler.ts` | `textDocument/didClose` | Removes document from `DocumentStore` |
