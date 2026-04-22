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
