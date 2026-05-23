# Extension Scripts

This directory contains npm script helpers for building the bundled server
module, watching extension source, and running VS Code host tests.

## Files

| File | Responsibility |
|---|---|
| `build-server-module.mjs` | Builds root server TypeScript and bundles `server/main.js` for the VSIX. |
| `run-host-tests.mjs` | Starts VS Code extension-host fixtures and runs host smoke tests. |
| `watch-extension.mjs` | Watches and rebuilds extension client output during local development. |

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Extension source](../src/README.md)
