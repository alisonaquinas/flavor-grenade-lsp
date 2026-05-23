# AGENTS.md — extension/src/test/suite/

VS Code extension-host tests live here.

## Layout

```text
extension/src/test/suite/
├── activation-language-mode.test.js # Activation and language mode host coverage
├── command-bridges.test.js          # Native command bridge host coverage
├── index.js                         # Host-test entry point
└── status-failure.test.js           # Status and failure-state host coverage
```

## Invariants

- Host tests must run against fixtures prepared by `scripts/run-host-tests.mjs`.
- Tests must not assume a real user profile or installed Marketplace extension.
- Keep host tests focused on VS Code API behavior that pure unit tests cannot
  prove.

## See Also

- [Extension source AGENTS.md](../../AGENTS.md)
- [Root AGENTS.md](../../../../AGENTS.md)
- [README.md](./README.md)
