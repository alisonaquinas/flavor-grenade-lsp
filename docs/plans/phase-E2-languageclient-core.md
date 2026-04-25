---
title: "Phase E2: LanguageClient Core"
phase: E2
status: planned
tags: [extension, languageclient, activation, binary-resolution, stdio]
updated: 2026-04-21
---

# Phase E2: LanguageClient Core

| Field      | Value |
|------------|-------|
| Phase      | E2 |
| Title      | LanguageClient Core |
| Status     | ⏳ planned |
| Gate       | Extension activates and spawns the server in VS Code Extension Development Host; LSP initialization handshake succeeds |
| Depends on | Phase E1 (Extension Scaffold) |

---

## Objective

Implement 2-tier binary resolution (user setting → bundled binary at `server/flavor-grenade-lsp[.exe]`). Configure `LanguageClient` v9.x with Executable ServerOptions over stdio. Wire `activate()` and `deactivate()` lifecycle. Gate: extension activates and spawns the server in VS Code Extension Development Host; LSP initialization handshake succeeds.

---

## Task List

- [ ] **1. Implement binary resolution**

  Create `extension/src/server-path.ts`:

  ```typescript
  import { type ExtensionContext, Uri, workspace } from 'vscode';

  /**
   * Resolves the path to the flavor-grenade-lsp server binary.
   *
   * Resolution order (2-tier):
   * 1. User setting `flavorGrenade.server.path` — escape hatch for local dev builds.
   * 2. Bundled binary at `server/flavor-grenade-lsp[.exe]` — default for all users.
   *
   * No PATH fallback, no env var, no download. Platform-specific VSIXs guarantee
   * the binary is present at tier 2.
   */
  export function resolveServerPath(context: ExtensionContext): string {
      const config = workspace.getConfiguration('flavorGrenade');
      const custom = config.get<string>('server.path');

      if (custom && custom.trim().length > 0) {
          return custom;
      }

      const binaryName = process.platform === 'win32'
          ? 'flavor-grenade-lsp.exe'
          : 'flavor-grenade-lsp';

      return Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath;
  }
  ```

  - Typecheck: `cd extension && npx tsc --noEmit`
  - Commit

- [ ] **2. Implement LanguageClient activation**

  Replace stub `extension/src/extension.ts`:

  ```typescript
  import {
      type ExtensionContext,
      workspace,
  } from 'vscode';
  import {
      LanguageClient,
      type LanguageClientOptions,
      type ServerOptions,
  } from 'vscode-languageclient/node';
  import { resolveServerPath } from './server-path.js';

  let client: LanguageClient | undefined;

  export async function activate(context: ExtensionContext): Promise<void> {
      const serverPath = resolveServerPath(context);
      const config = workspace.getConfiguration('flavorGrenade');

      // Executable form — stdio is the default transport for `command`.
      const serverOptions: ServerOptions = {
          run:   { command: serverPath },
          debug: { command: serverPath },
      };

      const clientOptions: LanguageClientOptions = {
          documentSelector: [{ scheme: 'file', language: 'markdown' }],
          synchronize: {
              fileEvents: workspace.createFileSystemWatcher('**/*.md'),
          },
          initializationOptions: {
              linkStyle: config.get('linkStyle'),
              completionCandidates: config.get('completion.candidates'),
              diagnosticsSuppress: config.get('diagnostics.suppress'),
          },
      };

      client = new LanguageClient(
          'flavorGrenade',
          'Flavor Grenade',
          serverOptions,
          clientOptions,
      );

      await client.start();

      // LanguageClient implements Disposable — pushing to subscriptions handles
      // stop() on deactivation. No explicit stop() in deactivate() needed.
      context.subscriptions.push(client);
  }

  export function deactivate(): void {
      // Client cleanup is handled by context.subscriptions disposal.
  }
  ```

  - Typecheck, build, commit

- [ ] **3. Create launch.json and smoke test**

  Create `extension/.vscode/launch.json`:

  ```json
  {
      "version": "0.2.0",
      "configurations": [
          {
              "name": "Run Extension",
              "type": "extensionHost",
              "request": "launch",
              "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
              "outFiles": ["${workspaceFolder}/dist/**/*.js"]
          }
      ]
  }
  ```

  - Build server binary for host platform: `bun build --compile --minify src/main.ts --outfile extension/server/flavor-grenade-lsp` (on Windows: `.exe`)
  - Note: local builds omit `--bytecode` (CI-only optimization) and `--target` (compiles for host)
  - Open `extension/` in VS Code, press F5, open a `.md` file
  - Verify: extension activates, server spawns, output channel shows LSP initialization
  - Commit launch.json

---

## File Map

| Path | Action | Responsibility |
|------|--------|----------------|
| `extension/src/server-path.ts` | Create | 2-tier binary resolution logic |
| `extension/src/extension.ts` | Modify | Full activate/deactivate with LanguageClient |
| `extension/.vscode/launch.json` | Create | Extension Development Host debug config |
