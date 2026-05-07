import {
  type Disposable,
  Location,
  Position,
  Range,
  Uri,
  commands,
  env,
  window,
} from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';
import { createCommandBridgeHandlers } from './command-bridges.js';
import { buildDiagnosticInfo, type FlavorGrenadeStatus } from './status-presentation.js';
import { createStatusActionItems } from './status-actions.js';
import { TROUBLESHOOTING_URL } from './troubleshooting.js';

type LanguageClientProvider = (commandId: string) => Promise<LanguageClient>;
type StatusProvider = () => FlavorGrenadeStatus;
type AfterRebuildIndex = () => Promise<void> | Thenable<void> | void;

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
  statusProvider?: StatusProvider,
  afterRebuildIndex?: AfterRebuildIndex,
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
      await afterRebuildIndex?.();
    }),

    commands.registerCommand('flavorGrenade.showOutput', async () => {
      const client = await getClient('flavorGrenade.showOutput');
      client.outputChannel.show();
    }),

    commands.registerCommand('flavorGrenade.showStatusActions', async () => {
      const status = statusProvider?.();
      if (!status) {
        return;
      }

      const selected = await window.showQuickPick(createStatusActionItems(status), {
        matchOnDescription: true,
        placeHolder: 'Choose a Flavor Grenade action',
        title: 'Flavor Grenade Status',
      });
      if (!selected) {
        return;
      }

      if (selected.command === 'flavorGrenade.copyDiagnosticInfo') {
        await env.clipboard.writeText(buildDiagnosticInfo(status));
        return;
      }

      if (selected.command === 'flavorGrenade.revealVaultRoot' && status.vaultRoot) {
        await bridgeHandlers.revealVaultRoot({ uri: status.vaultRoot });
        return;
      }

      await commands.executeCommand(selected.command);
    }),

    commands.registerCommand('flavorGrenade.openTroubleshooting', async () => {
      await env.openExternal(Uri.parse(TROUBLESHOOTING_URL));
    }),

    commands.registerCommand('flavorGrenade.showReferences', bridgeHandlers.showReferences),
    commands.registerCommand('flavorGrenade.followLink', bridgeHandlers.followLink),
    commands.registerCommand('flavorGrenade.openEmbedTarget', bridgeHandlers.openEmbedTarget),
    commands.registerCommand('flavorGrenade.showBacklinks', bridgeHandlers.showBacklinks),
    commands.registerCommand('flavorGrenade.showOutlinks', bridgeHandlers.showOutlinks),
    commands.registerCommand('flavorGrenade.revealVaultRoot', bridgeHandlers.revealVaultRoot),
    commands.registerCommand('flavorGrenade.copyDiagnosticInfo', async (payload?: unknown) => {
      if (payload !== undefined) {
        return bridgeHandlers.copyDiagnosticInfo(payload);
      }

      const status = statusProvider?.();
      if (!status) {
        return bridgeHandlers.copyDiagnosticInfo(payload);
      }

      await env.clipboard.writeText(buildDiagnosticInfo(status));
      return true;
    }),
  ];
}
