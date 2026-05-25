# Tests

This directory contains the portable skill smoke tests. The tests exercise the
wrapper modules without requiring a real packaged LSP runtime, so they can run
on every development machine and CI job.

## Coverage

- runtime target mapping
- executable digest verification
- digest mismatch rejection
- success and error JSON envelopes
- diagnostic wait behavior in the minimal LSP client

## Commands

Run from the repository root:

```bash
bun run skill:test
```

## See Also

- [Test agent guidance](./AGENTS.md)
- [Wrapper README](../wrappers/README.md)
- [Security](../docs/security.md)
