import { type Disposable, Location, Position, Range, Uri, commands, env, window } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';
import { createCommandBridgeHandlers } from './command-bridges.js';

type LanguageClientProvider = (commandId: string) => Promise<LanguageClient>;

/**
 * Registers lifecycle commands and native VS Code command bridges.
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
  const bridgeHandlers = createCommandBridgeHandlers({
    createLocation: (uri, range) => new Location(uri as Uri, range as Range),
    createPosition: (line, character) => new Position(line, character),
    createRange: (start, end) => new Range(start as Position, end as Position),
    executeCommand: (command, ...args) => commands.executeCommand(command, ...args),
    parseUri: (value) => Uri.parse(value),
    showErrorMessage: (message) => window.showErrorMessage(message),
    showTextDocument: (uri, options) =>
      window.showTextDocument(uri as Uri, { selection: options?.selection as Range | undefined }),
    writeClipboard: (text) => env.clipboard.writeText(text),
  });

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

    commands.registerCommand('flavorGrenade.showReferences', bridgeHandlers.showReferences),
    commands.registerCommand('flavorGrenade.followLink', bridgeHandlers.followLink),
    commands.registerCommand('flavorGrenade.openEmbedTarget', bridgeHandlers.openEmbedTarget),
    commands.registerCommand('flavorGrenade.showBacklinks', bridgeHandlers.showBacklinks),
    commands.registerCommand('flavorGrenade.showOutlinks', bridgeHandlers.showOutlinks),
    commands.registerCommand('flavorGrenade.revealVaultRoot', bridgeHandlers.revealVaultRoot),
    commands.registerCommand('flavorGrenade.copyDiagnosticInfo', bridgeHandlers.copyDiagnosticInfo),
  ];
}
