# AGENTS.md — extension/scripts/

Build and host-test helpers for the VS Code extension package live here.

## Layout

```text
extension/scripts/
├── build-server-module.mjs # Build root server output and bundle server/main.js
├── run-host-tests.mjs      # Run VS Code host tests against fixtures
└── watch-extension.mjs     # Watch extension client source during development
```

## Invariants

- `build-server-module.mjs` must produce the packaged JavaScript server module,
  not a native executable.
- Host tests must run against isolated fixture workspaces and temporary VS Code
  extension directories.
- Scripts must not depend on sibling repositories.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
