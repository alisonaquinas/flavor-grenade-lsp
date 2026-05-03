---
title: "Phase E3: Status Bar & Commands"
phase: E3
status: planned
tags: [extension, status-bar, commands, notifications, configuration]
updated: 2026-04-21
---

# Phase E3: Status Bar & Commands

| Field      | Value |
|------------|-------|
| Phase      | E3 |
| Title      | Status Bar & Commands |
| Status     | ⏳ planned |
| Gate       | Commands appear in Command Palette; status bar reflects server state transitions |
| Depends on | Phase E2 (LanguageClient Core) |

---

## Objective

Add a status bar widget listening to the `flavorGrenade/status` custom notification (initializing → indexing → ready → error), register three palette commands (Restart Server, Rebuild Index, Show Output), and add a config change watcher to restart on `server.path` changes. Gate: commands appear in Command Palette; status bar reflects server state transitions.

---

## File Map

| Path | Action | Responsibility |
|---|---|---|
| `extension/src/status-bar.ts` | Create | Status bar widget — listens to flavorGrenade/status |
| `extension/src/commands.ts` | Create | Command registrations (restart, rebuild, show output) |
| `extension/src/extension.ts` | Modify | Wire status bar, commands, and config watcher into activate() |

---

## Task List

- [ ] **1. Implement status bar widget**

  Create `extension/src/status-bar.ts`:

  ```typescript
  import { type StatusBarItem, StatusBarAlignment, window } from 'vscode';
  import type { LanguageClient } from 'vscode-languageclient/node';

  interface FlavorGrenadeStatus {
      state: 'initializing' | 'indexing' | 'ready' | 'error';
      vaultCount: number;
      docCount: number;
      message?: string;
  }

  /**
   * Creates a status bar item that reflects the server's indexing state.
   *
   * Listens to the non-standard `flavorGrenade/status` notification
   * defined in the API layer (see docs/design/api-layer.md).
   * Clicking the status bar item opens the output channel.
   */
  export function createStatusBar(client: LanguageClient): StatusBarItem {
      const item = window.createStatusBarItem(
          'flavorGrenade.status',
          StatusBarAlignment.Left,
          -1,
      );

      item.name = 'Flavor Grenade';
      item.command = 'flavorGrenade.showOutput';
      item.text = '$(loading~spin) FG: Starting...';
      item.show();

      client.onNotification(
          'flavorGrenade/status',
          (params: FlavorGrenadeStatus) => {
              switch (params.state) {
                  case 'initializing':
                      item.text = '$(loading~spin) FG: Starting...';
                      item.tooltip = 'Flavor Grenade: Initializing server';
                      break;
                  case 'indexing':
                      item.text = '$(loading~spin) FG: Indexing...';
                      item.tooltip = `Flavor Grenade: Indexing ${params.docCount} docs across ${params.vaultCount} vaults`;
                      break;
                  case 'ready':
                      item.text = `$(check) FG: ${params.docCount} docs`;
                      item.tooltip = `Flavor Grenade: Ready — ${params.docCount} docs in ${params.vaultCount} vaults`;
                      break;
                  case 'error':
                      item.text = '$(error) FG: Error';
                      item.tooltip = `Flavor Grenade: ${params.message ?? 'Unknown error'}`;
                      break;
              }
          },
      );

      return item;
  }
  ```

  - The `FlavorGrenadeStatus` interface matches `docs/design/api-layer.md` "Custom Notification: flavorGrenade/status"

  - Typecheck: `cd extension && npx tsc --noEmit`

  - Commit

- [ ] **2. Implement command registrations**

  Create `extension/src/commands.ts`:

  ```typescript
  import { type Disposable, commands } from 'vscode';
  import type { LanguageClient } from 'vscode-languageclient/node';

  /**
   * Registers the three extension commands exposed in the Command Palette.
   *
   * - `flavorGrenade.restartServer` — restarts the LanguageClient (and server).
   * - `flavorGrenade.rebuildIndex` — sends `workspace/executeCommand` to the
   *   server, triggering a full RefGraph rebuild. The server must register this
   *   command via `executeCommandProvider` capabilities (already implemented —
   *   see docs/design/api-layer.md, "Workspace Commands").
   * - `flavorGrenade.showOutput` — reveals the LSP output channel.
   */
  export function registerCommands(client: LanguageClient): Disposable[] {
      return [
          commands.registerCommand('flavorGrenade.restartServer', async () => {
              await client.restart();
          }),

          commands.registerCommand('flavorGrenade.rebuildIndex', async () => {
              await client.sendRequest('workspace/executeCommand', {
                  command: 'flavorGrenade.rebuildIndex',
                  arguments: [],
              });
          }),

          commands.registerCommand('flavorGrenade.showOutput', () => {
              client.outputChannel.show();
          }),
      ];
  }
  ```

  - Typecheck: `cd extension && npx tsc --noEmit`

  - Commit

- [ ] **3. Wire status bar, commands, and config watcher into activate()**

  Update `extension/src/extension.ts` to full final form:

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
  import { createStatusBar } from './status-bar.js';
  import { registerCommands } from './commands.js';

  let client: LanguageClient | undefined;

  export async function activate(context: ExtensionContext): Promise<void> {
      const serverPath = resolveServerPath(context);
      const config = workspace.getConfiguration('flavorGrenade');

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

      // Status bar widget
      const statusBar = createStatusBar(client);
      context.subscriptions.push(statusBar);

      // Reset status bar text on restart cycles (e.g., after restartServer command)
      client.onDidChangeState(() => {
          statusBar.text = '$(loading~spin) FG: Starting...';
      });

      // Palette commands
      const commandDisposables = registerCommands(client);
      context.subscriptions.push(...commandDisposables);

      // Restart on server path change
      context.subscriptions.push(
          workspace.onDidChangeConfiguration(async (e) => {
              if (e.affectsConfiguration('flavorGrenade.server.path') && client) {
                  await client.restart();
              }
          }),
      );

      // LanguageClient implements Disposable — pushing to subscriptions handles
      // stop() on deactivation. No explicit stop() in deactivate() needed.
      context.subscriptions.push(client);
  }

  export function deactivate(): void {
      // Client cleanup is handled by context.subscriptions disposal.
  }
  ```

  - Typecheck: `cd extension && npx tsc --noEmit`

  - Build: `cd extension && npm run build:extension`

  - Commit

---

## Gate Verification

```bash
cd extension && npx tsc --noEmit
cd extension && npm run build:extension
```

Open Extension Development Host (F5), open a `.md` file, verify:

- Status bar shows "FG: Starting..." then transitions through server states

- Command Palette lists "Flavor Grenade: Restart Server", "Flavor Grenade: Rebuild Index", "Flavor Grenade: Show Output"

- Changing `flavorGrenade.server.path` in settings triggers a server restart

---

## References

- `[[docs/design/api-layer]]`

- `[[plans/phase-E2-languageclient-core]]`

- `[[plans/phase-E1-extension-scaffold]]`
