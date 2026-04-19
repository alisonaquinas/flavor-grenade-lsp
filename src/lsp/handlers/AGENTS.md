# AGENTS.md — src/lsp/handlers/

## Purpose

Implements the mandatory LSP lifecycle (initialize → initialized → active →
shutdown → exit) and the three textDocument synchronization notifications
(didOpen, didChange, didClose).

## Layout

```
handlers/
├── initialize.handler.ts
├── initialized.handler.ts
├── shutdown.handler.ts
├── exit.handler.ts
├── did-open.handler.ts
├── did-change.handler.ts
├── did-close.handler.ts
└── __tests__/
```

## Invariants

- The `initialize` handler must be the first request handled; all other
  request handlers may safely assume the server is initialized.
- `exit` must call `process.exit(0)` only when preceded by `shutdown`. If
  `exit` arrives without a prior `shutdown` it must call `process.exit(1)`.
- `didOpen` and `didChange` must update `VaultIndex` synchronously (or near
  synchronously) so that a subsequent request in the same message batch can
  find the updated document.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
