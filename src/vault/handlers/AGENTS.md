# AGENTS.md — src/vault/handlers/

Custom JSON-RPC request handlers that are coupled to vault indexing readiness
live here.

## Layout

```text
src/vault/handlers/
├── await-index-ready.handler.ts # Test and harness request for initial scan readiness
└── AGENTS.md                    # This file
```

## Workflows

### Adding a vault custom request

1. Keep the handler small and focused on vault lifecycle state.
2. Register it through the vault or LSP module that owns the dependency.
3. Return a `Promise<unknown>` from any dispatcher-facing handler.
4. Add unit or integration coverage for pending, ready, and repeated-call cases.

## Invariants

- Do not duplicate parsed document storage here; `VaultIndex` remains the single
  source of truth.
- Do not expose absolute vault paths in custom results unless a protocol spec
  explicitly requires them.
- Keep custom request names under the `flavorGrenade/` namespace.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [README.md](./README.md)
