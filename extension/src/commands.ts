import { type Disposable, commands } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

type LanguageClientProvider = (commandId: string) => Promise<LanguageClient>;

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
export function registerCommands(
  clientOrProvider: LanguageClient | LanguageClientProvider,
): Disposable[] {
  const getClient =
    typeof clientOrProvider === 'function' ? clientOrProvider : async () => clientOrProvider;

  return [
    commands.registerCommand('flavorGrenade.restartServer', async () => {
      const client = await getClient('flavorGrenade.restartServer');
      await client.restart();
    }),

    commands.registerCommand('flavorGrenade.rebuildIndex', async () => {
      const client = await getClient('flavorGrenade.rebuildIndex');
      await client.sendRequest('flavorGrenade/rebuildIndex');
    }),

    commands.registerCommand('flavorGrenade.showOutput', async () => {
      const client = await getClient('flavorGrenade.showOutput');
      client.outputChannel.show();
    }),
  ];
}
