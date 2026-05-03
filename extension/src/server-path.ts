import { type ExtensionContext, ExtensionMode, window, workspace } from 'vscode';
import {
    type ServerCommand,
    resolveServerCommandFromOptions,
} from './server-command.js';

/**
 * Resolves the path to the flavor-grenade-lsp server binary.
 *
 * Resolution order:
 * 1. User setting `flavorGrenade.server.path` — escape hatch for local dev builds.
 *    Resolved to an absolute path and validated for existence before use.
 * 2. Development mode — root `dist/main.js` via `node`, so server restarts
 *    pick up TypeScript watch output without rebuilding a binary.
 * 3. Bundled binary at `server/flavor-grenade-lsp[.exe]` — default for users.
 *
 * No PATH fallback, no env var, no download. Platform-specific VSIXs guarantee
 * the binary is present for packaged installs.
 */
export function resolveServerCommand(context: ExtensionContext): ServerCommand {
    const config = workspace.getConfiguration('flavorGrenade');
    return resolveServerCommandFromOptions({
        customPath: config.get<string>('server.path'),
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
