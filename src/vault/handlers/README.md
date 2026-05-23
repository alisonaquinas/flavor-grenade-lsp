# Vault Handlers

This directory contains custom JSON-RPC handlers that belong to vault indexing
rather than general LSP lifecycle handling.

## Files

| File                           | Responsibility                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `await-index-ready.handler.ts` | Resolves `flavorGrenade/awaitIndexReady` once the initial vault scan is ready. |

## Invariants

- Handlers here are custom Flavor Grenade protocol hooks, not standard LSP
  methods.
- `awaitIndexReady` returns `null` as its JSON-RPC result when ready.
- Waiting callers must all be resolved when the scanner marks the index ready.

## See Also

- [Parent README](../README.md)
- [AGENTS.md](./AGENTS.md)
- [Vault module](../vault.module.ts)
