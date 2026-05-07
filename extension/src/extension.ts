import {
  type ExtensionContext,
  ExtensionMode,
  type StatusBarItem,
  languages,
  window,
  workspace,
} from 'vscode';
import {
  LanguageClient,
  State,
  type LanguageClientOptions,
  type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServerCommand } from './server-path.js';
import { applyFlavorGrenadeStatus, createStatusBar } from './status-bar.js';
import { registerCommands } from './commands.js';
import { LanguageModeController } from './language-mode.js';
import { decideStartupGate } from './activation-gate.js';
import type {
  FlavorGrenadeStatus,
  FlavorGrenadeStatusPresentation,
} from './status-presentation.js';

let client: LanguageClient | undefined;
let startClientPromise: Promise<LanguageClient> | undefined;
let statusBarItem: Pick<StatusBarItem, 'text' | 'tooltip'> | undefined;

export interface FlavorGrenadeExtensionApi {
  __testApplyStatus?(status: FlavorGrenadeStatus): FlavorGrenadeStatusPresentation | undefined;
  isClientStarted(): boolean;
}

export async function activate(context: ExtensionContext): Promise<FlavorGrenadeExtensionApi> {
  const startClient = async (commandId?: string): Promise<LanguageClient> => {
    if (client) {
      return client;
    }

    if (commandId) {
      await decideStartupGate({
        openDocuments: workspace.textDocuments,
        trigger: { kind: 'command', commandId },
        workspaceFolders: workspace.workspaceFolders,
      });
    }

    startClientPromise ??= startLanguageClient(context).catch((error: unknown) => {
      client = undefined;
      startClientPromise = undefined;
      throw error;
    });
    return startClientPromise;
  };

  const commandDisposables = registerCommands(startClient);
  context.subscriptions.push(...commandDisposables);

  // Restart on server path change
  context.subscriptions.push(
    workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('flavorGrenade.server.path') && client) {
        await client.restart();
      }
    }),
  );

  const maybeStartClient = async () => {
    if (client || startClientPromise) {
      return;
    }

    const decision = await decideStartupGate({
      openDocuments: workspace.textDocuments,
      workspaceFolders: workspace.workspaceFolders,
    });

    if (decision.startClient) {
      await startClient();
    }
  };

  context.subscriptions.push(
    workspace.onDidOpenTextDocument(() => {
      void maybeStartClient();
    }),
    workspace.onDidChangeWorkspaceFolders(() => {
      void maybeStartClient();
    }),
  );

  for (const markerWatcher of [
    workspace.createFileSystemWatcher('**/.obsidian'),
    workspace.createFileSystemWatcher('**/.flavor-grenade.toml'),
  ]) {
    context.subscriptions.push(
      markerWatcher,
      markerWatcher.onDidCreate(() => {
        void maybeStartClient();
      }),
      markerWatcher.onDidChange(() => {
        void maybeStartClient();
      }),
    );
  }

  await maybeStartClient();

  // LanguageClient implements Disposable — pushing to subscriptions handles
  // stop() on deactivation. No explicit stop() in deactivate() needed.
  return {
    ...(context.extensionMode !== ExtensionMode.Production
      ? {
          __testApplyStatus(status: FlavorGrenadeStatus) {
            if (!statusBarItem) {
              return undefined;
            }

            applyFlavorGrenadeStatus(statusBarItem, status);
            return {
              text: statusBarItem.text,
              tooltip: String(statusBarItem.tooltip ?? ''),
            };
          },
        }
      : {}),
    isClientStarted() {
      return client !== undefined || startClientPromise !== undefined;
    },
  };
}

export function deactivate(): void {
  // Client cleanup is handled by context.subscriptions disposal.
}

async function startLanguageClient(context: ExtensionContext): Promise<LanguageClient> {
  const serverCommand = resolveServerCommand(context);
  const config = workspace.getConfiguration('flavorGrenade');

  const serverOptions: ServerOptions = {
    run: serverCommand,
    debug: serverCommand,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'markdown' },
      { scheme: 'file', language: 'ofmarkdown' },
    ],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*.md'),
    },
    initializationOptions: {
      linkStyle: config.get('linkStyle'),
      completionCandidates: config.get('completion.candidates'),
      diagnosticsSuppress: config.get('diagnostics.suppress'),
    },
  };

  const nextClient = new LanguageClient(
    'flavorGrenade',
    'Flavor Grenade',
    serverOptions,
    clientOptions,
  );
  client = nextClient;

  // Register status listeners before start() so early initialize/initialized
  // notifications cannot be missed during the LSP handshake.
  const statusBar = createStatusBar(nextClient);
  statusBarItem = statusBar;
  context.subscriptions.push(statusBar);

  // Reset status bar text on restart cycles (e.g., after restartServer command)
  context.subscriptions.push(
    nextClient.onDidChangeState((event) => {
      if (event.newState === State.Starting) {
        statusBar.text = '$(loading~spin) FG: Starting...';
        statusBar.tooltip = 'Flavor Grenade: Starting server';
      }
    }),
  );

  context.subscriptions.push(nextClient);

  await nextClient.start();

  const languageModeController = new LanguageModeController(nextClient, {
    getOpenDocuments: () => workspace.textDocuments,
    getVisibleEditors: () => window.visibleTextEditors,
    setTextDocumentLanguage: (document, languageId) =>
      languages.setTextDocumentLanguage(document, languageId),
    onDidOpenTextDocument: (listener) => workspace.onDidOpenTextDocument(listener),
    onDidChangeVisibleTextEditors: (listener) => window.onDidChangeVisibleTextEditors(listener),
    onDidChangeWorkspaceFolders: (listener) => workspace.onDidChangeWorkspaceFolders(listener),
  });
  context.subscriptions.push(...languageModeController.start());
  await languageModeController.refreshAll();

  // If the server reached ready before the notification listener observed it,
  // awaitIndexReady gives us a deterministic post-start status check.
  nextClient
    .sendRequest<{ docIds?: unknown[] }>('flavorGrenade/queryIndex', {
      rootUri: workspace.workspaceFolders?.[0]?.uri.toString(),
    })
    .then(
      (result) => {
        const docCount = Array.isArray(result?.docIds) ? result.docIds.length : 0;
        statusBar.text = `$(check) FG: ${docCount} docs`;
        statusBar.tooltip = `Flavor Grenade: Ready - ${docCount} docs`;
      },
      () => {
        // Ignore best-effort status refresh failures; normal LSP features still report errors.
      },
    );

  return nextClient;
}
