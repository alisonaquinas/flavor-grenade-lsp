# AGENTS.md - Flavor Grenade LSP Skill

This directory is the canonical installable skill source for the
`flavorgrenade-lsp` plugin. Release packaging copies this tree into
the installable skill path and injects the selected signed runtime executable
under the runtime target directory.

## Layout

```text
flavorgrenade-lsp/
├── SKILL.md
├── README.md
├── CONCEPTS.md
├── manifest.json
├── package.json
├── wrappers/
├── docs/
├── examples/
└── tests/
```

## Workflows

Run these from the repository root unless a command explicitly says otherwise:

```bash
bun run skill:test
bun run skill:package -- --dry-run
node ../../../../scripts/skill-verify.mjs --skill-root . --allow-missing-runtime
```

To test a packaged runtime, fetch a signed server release first:

```bash
bun run skill:fetch-runtime -- --target <target> --server-release <vX.Y.Z>
bun run skill:package -- --dry-run --require-signed-runtime --target <target>
```

## Invariants

- The wrapper must launch only the embedded `manifest.json` runtime.
- Runtime digest verification is mandatory before LSP launch.
- Runtime signature verification is optional by default but must fail closed
  when callers pass `--require-signature`.
- Wrappers must not download binaries, fetch remote Markdown references, or
  execute Markdown code.
- User paths must be resolved inside the selected workspace before use.
- JSON output must redact private absolute paths and raw config values.
- The embedded LSP remains authoritative for Markdown flavor decisions.

## See Also

- [Skill README](./README.md)
- [Concepts](./CONCEPTS.md)
- [Wrapper guidance](./wrappers/AGENTS.md)
- [Test guidance](./tests/AGENTS.md)
- [Repository AGENTS.md](../../../../AGENTS.md)
