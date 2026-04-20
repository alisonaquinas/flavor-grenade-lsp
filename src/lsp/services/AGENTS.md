# AGENTS.md — src/lsp/services/

## Purpose

Holds NestJS singletons that maintain cross-cutting LSP state. These are not
feature-specific — they are used by multiple handlers inside `LspModule`.

## Layout

```
services/
├── capability-registry.ts
├── document-store.ts
├── document-store.test.ts
├── lifecycle-state.ts
└── status-notifier.ts
```

## Invariants

- `CapabilityRegistry` is written during `LspModule.onModuleInit` and then
  only read. Do not mutate it after initialization is complete.
- `DocumentStore` tracks only documents the LSP client has explicitly opened
  (`didOpen`). It is not a substitute for `VaultIndex`, which covers all vault
  documents regardless of whether the client opened them.
- `LifecycleState` transitions are one-way — the server never goes backward
  from `shutdown` to `active`.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
