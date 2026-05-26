# AGENTS.md - Skill Wrappers

The wrapper files are the executable interface between an LLM agent and the
embedded LSP runtime. Changes here affect every Claude, Codex, and package
installation path.

## Layout

```text
wrappers/
├── flavorgrenade.mjs
├── lsp-client.mjs
├── runtime.mjs
└── schema.mjs
```

## Workflows

Run wrapper-focused tests from the repository root:

```bash
bun run skill:test
```

When changing release-runtime behavior, also run:

```bash
bun test ./scripts/skill-fetch-runtime.test.js ./scripts/skill-package.test.js
```

## Invariants

- `flavorgrenade.mjs` is the only user-facing command entrypoint.
- `runtime.mjs` is the only wrapper module that reads `manifest.json`.
- `lsp-client.mjs` must preserve LSP framing and never shell out.
- `schema.mjs` owns the external success and error envelope shape.
- New commands must return JSON-safe values and must not expose raw document
  contents in error output.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Wrapper README](./README.md)
- [Skill smoke tests](../tests/README.md)
