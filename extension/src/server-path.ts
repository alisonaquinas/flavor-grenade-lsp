import { type ExtensionContext, ExtensionMode, window, workspace } from 'vscode';
import { type ServerCommand, resolveServerCommandFromOptions } from './server-command.js';

/**
 * Resolves how the flavor-grenade-lsp server should start.
 *
 * Resolution order:
 * 1. User or machine setting `flavorGrenade.server.path` — escape hatch
 *    for local dev builds. Workspace values are ignored for safety.
 * 2. Development mode — root `dist/main.js` via `node`, so server restarts
 *    pick up TypeScript watch output without rebuilding a binary.
 * 3. Bundled JS module at `server/main.js` — default for users.
 *
 * No PATH fallback, no env var, no download.
 */
export function resolveServerCommand(context: ExtensionContext): ServerCommand {
  const config = workspace.getConfiguration('flavorGrenade');
  const serverPath = config.inspect<string>('server.path');
  const workspacePath = firstNonEmpty(serverPath?.workspaceFolderValue, serverPath?.workspaceValue);
  if (workspacePath !== undefined) {
    void window.showWarningMessage(
      'Flavor Grenade: ignoring workspace-configured server.path. Set it in user settings to use a custom server command.',
    );
  }

  return resolveServerCommandFromOptions({
    customPath: firstNonEmpty(serverPath?.globalValue),
    extensionPath: context.extensionUri.fsPath,
    isDevelopment: context.extensionMode === ExtensionMode.Development,
    notifyInfo: (message) => {
      void window.showInformationMessage(message);
    },
    notifyWarning: (message) => {
      void window.showWarningMessage(message);
    },
  });
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim().length > 0);
}
