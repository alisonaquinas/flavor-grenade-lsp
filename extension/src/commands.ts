import { type Disposable, commands } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

/**
 * Registers the three extension commands exposed in the Command Palette.
 *
 * - `flavorGrenade.restartServer` — restarts the LanguageClient (and server).
 * - `flavorGrenade.rebuildIndex` — sends a custom `flavorGrenade/rebuildIndex`
 *   request to the server, triggering a full vault re-scan and RefGraph rebuild.
 *   Uses a custom method name (not `workspace/executeCommand`) because
 *   `vscode-languageclient` intercepts standard LSP methods before they reach
 *   custom JSON-RPC dispatchers.
 * - `flavorGrenade.showOutput` — reveals the LSP output channel.
 */
export function registerCommands(client: LanguageClient): Disposable[] {
    return [
        commands.registerCommand('flavorGrenade.restartServer', async () => {
            await client.restart();
        }),

        commands.registerCommand('flavorGrenade.rebuildIndex', async () => {
            await client.sendRequest('flavorGrenade/rebuildIndex');
        }),

        commands.registerCommand('flavorGrenade.showOutput', () => {
            client.outputChannel.show();
        }),
    ];
}
