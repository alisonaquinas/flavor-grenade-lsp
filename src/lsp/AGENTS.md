# AGENTS.md — src/lsp/

## Purpose

Contains the composition root (`LspModule`) and the supporting services and
lifecycle notification handlers that are owned exclusively by the LSP layer
(not by any feature module).

## Layout

```
lsp/
├── lsp.module.ts          # root NestJS module; wires all handlers and starts reader
├── lsp.module.test.ts
├── handlers/              # LSP lifecycle notification handlers
│   ├── initialize.handler.ts
│   ├── initialized.handler.ts
│   ├── shutdown.handler.ts
│   ├── exit.handler.ts
│   ├── did-open.handler.ts
│   ├── did-change.handler.ts
│   ├── did-close.handler.ts
│   └── __tests__/
└── services/              # Supporting services
    ├── capability-registry.ts
    ├── document-store.ts
    ├── document-store.test.ts
    ├── lifecycle-state.ts
    └── status-notifier.ts
```

## Workflows

- **Adding a new LSP request method**: create the handler class (in
  `src/handlers/` or a feature module), import and inject it in `LspModule`,
  add a `dispatcher.onRequest(...)` call in `onModuleInit`.
- **Advertising a new capability**: call `capabilityRegistry.merge({ ... })`
  inside `onModuleInit` before the `reader.start(...)` call.

## Invariants

- `lsp.module.ts` is the only place that calls `reader.start(process.stdin)`.
  Starting the reader elsewhere would cause duplicate message processing.
- `DidOpenHandler` sets document text on `CompletionRouter` and
  `PrepareRenameHandler` synchronously (before any `await`) so that a
  completion or prepareRename arriving in the same stdio buffer chunk
  finds the text already populated.
- `LifecycleState` must reach `'active'` before any feature handler processes
  requests. Handlers that rely on the vault index should guard against calls
  arriving before initialization completes.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
