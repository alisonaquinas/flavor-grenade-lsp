# AGENTS.md — extension/

The VS Code extension package lives here. It owns activation, status UI,
Markdown flavor selection, command bridges, Marketplace packaging, and the
packaged JavaScript server module.

## Layout

```text
extension/
├── src/                 # Extension client source and unit tests
├── scripts/             # Build and host-test helpers
├── test/                # Marketplace, contribution, and package-target tests
├── docs/                # Extension-specific requirements and design docs
├── test-fixtures/       # VS Code host-workspace fixtures
├── package.json         # VS Code extension manifest and npm scripts
├── .vscodeignore        # VSIX package allow/deny rules
└── README.md            # Marketplace-facing extension README
```

## Workflows

### Changing extension behavior

1. Update `src/` and add focused tests beside the changed behavior.
2. Update `docs/` when behavior changes user-visible activation, settings,
   status, command, or packaging semantics.
3. Run `npm run compile` and `npm test`.
4. Run `npm run test:host` for activation, settings, status, or command bridge
   changes.

### Changing package contents

1. Update `.vscodeignore`, package metadata, or build scripts.
2. Run `npm run verify:marketplace-assets`.
3. Run `npm run verify:package-targets`.
4. Confirm the package still contains one `server/main.js` and no native server
   executable payload.

## Invariants

- Workspace values for `flavorGrenade.server.path` are ignored for safety.
- Marketplace packages use the bundled JavaScript server module at
  `server/main.js`.
- Restricted and virtual workspaces must not start the server.
- `.md` documents stay in VS Code's built-in `markdown` language mode; Markdown
  flavor is selected separately.

## See Also

- [Root AGENTS.md](../AGENTS.md)
- [README.md](./README.md)
- [Extension docs](./docs/index.md)
