# AGENTS.md — extension/src/

VS Code client source for activation, server startup, status UI, command
bridges, language mode handling, and Markdown flavor selection lives here.

## Layout

```text
extension/src/
├── extension.ts              # Activation and LanguageClient wiring
├── server-command.ts         # Pure server command resolver
├── server-path.ts            # VS Code configuration bridge for server command resolution
├── markdown-flavor*.ts       # Selector, status presentation, and server propagation
├── status-*.ts               # Status bar presentation and quick actions
├── command-bridges.ts        # Validated bridge commands for server payloads
├── workspace-environment.ts  # Restricted, virtual, local, and remote mode checks
└── test/suite/               # Extension host tests compiled to JavaScript
```

## Workflows

### Changing activation or startup

1. Update startup-gate, workspace-environment, or server-command tests first.
2. Keep unsupported workspaces no-spawn.
3. Run `npm run compile`, `npm test`, and `npm run test:host`.

### Changing Markdown flavor selection

1. Keep package schema, constants, quick-pick labels, and tests in lockstep.
2. Verify standalone files and workspace-folder files persist to the correct
   configuration target.
3. Confirm server propagation uses resource-specific configuration payloads.

## Invariants

- Do not put generic `.md` files into a custom VS Code language mode.
- Do not execute workspace-supplied server paths.
- Do not parse untrusted command payloads without validation.
- Do not couple extension tests to root server internals beyond the public LSP
  or command bridge contracts.

## See Also

- [Parent AGENTS.md](../AGENTS.md)
- [Root AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
