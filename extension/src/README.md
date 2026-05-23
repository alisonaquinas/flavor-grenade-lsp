# Extension Source

This directory contains the VS Code client source. The client starts the server
over stdio, owns UI state in VS Code, and forwards Markdown flavor settings to
the language server.

## Entry Points

| File | Responsibility |
|---|---|
| `extension.ts` | Activates the extension, starts the LanguageClient, registers controllers and commands. |
| `server-path.ts` / `server-command.ts` | Resolve the user, development, or packaged server command. |
| `markdown-flavor.ts` | Presents and persists Markdown flavor selection. |
| `status-bar.ts` / `status-actions.ts` | Render server status and quick actions. |
| `command-bridges.ts` | Validate server-provided command payloads before calling VS Code APIs. |
| `workspace-environment.ts` | Blocks unsupported workspace modes before server startup. |

## Invariants

- Treat workspace configuration as untrusted for executable server paths.
- Keep status bar server lifecycle state separate from Markdown flavor selector
  state.
- Validate command payloads before calling VS Code navigation, reference, or
  file-opening APIs.
- Prefer host tests for behavior that depends on real VS Code activation.

## See Also

- [Parent README](../README.md)
- [AGENTS.md](./AGENTS.md)
- [Workspace environments](../docs/features/workspace-environments.md)
