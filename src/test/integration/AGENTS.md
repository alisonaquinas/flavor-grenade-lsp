# AGENTS.md — src/test/integration/

Spawned LSP integration tests live here.

## Invariants

- Tests should communicate through LSP JSON-RPC instead of importing server
  internals.
- Temporary vaults must stay isolated and cleaned up by the test harness.
- Use integration tests when handler behavior depends on process startup,
  initialization, or cross-module wiring.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../../AGENTS.md)
- [README.md](./README.md)
