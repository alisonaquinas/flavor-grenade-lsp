import {
  type ExtensionContext,
  ExtensionMode,
  type StatusBarItem,
  env,
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
import type { ServerCommand } from './server-command.js';
import { resolveServerCommand } from './server-path.js';
import {
  applyFlavorGrenadeStatus,
  createFlavorGrenadeStatusBar,
  registerFlavorGrenadeStatusNotifications,
} from './status-bar.js';
import { registerCommands } from './commands.js';
import { LanguageModeController } from './language-mode.js';
import { decideStartupGate } from './activation-gate.js';
import { ServerStartupBlockedError } from './server-startup-error.js';
import { buildDiagnosticInfo, getStatusQuickActions } from './status-presentation.js';
import type {
  FlavorGrenadeStatus,
  FlavorGrenadeStatusPresentation,
} from './status-presentation.js';
import { describeWorkspaceEnvironment } from './workspace-environment.js';

let client: LanguageClient | undefined;
let startClientPromise: Promise<LanguageClient> | undefined;
let statusBarItem: Pick<StatusBarItem, 'text' | 'tooltip'> | undefined;
let currentStatus: FlavorGrenadeStatus = createBaseStatus('disabled');
let languageModeController: LanguageModeController | undefined;

export interface FlavorGrenadeExtensionApi {
  __testApplyStatus?(status: FlavorGrenadeStatus): FlavorGrenadeStatusPresentation | undefined;
  __testStatusActions?(status: FlavorGrenadeStatus): {
    actions: ReturnType<typeof getStatusQuickActions>;
    diagnostics: string;
  };
  isClientStarted(): boolean;
}

export async function activate(context: ExtensionContext): Promise<FlavorGrenadeExtensionApi> {
  currentStatus = createBaseStatus('disabled', context);
  applyDisabledEnvironmentStatus(context);

  const startClient = async (commandId?: string): Promise<LanguageClient> => {
    const disabledStatus = applyDisabledEnvironmentStatus(context);
    if (disabledStatus) {
      throw new ServerStartupBlockedError(
        disabledStatus.message ?? 'Flavor Grenade server is disabled in this workspace',
      );
    }

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
      languageModeController = undefined;
      startClientPromise = undefined;
      throw error;
    });
    return startClientPromise;
  };

  const commandDisposables = registerCommands(
    startClient,
    () => currentStatus,
    () => languageModeController?.refreshAll(),
  );
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
    if (applyDisabledEnvironmentStatus(context)) {
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

            const nextStatus = withContextStatus(status, context);
            currentStatus = nextStatus;
            applyFlavorGrenadeStatus(statusBarItem, nextStatus);
            return {
              text: statusBarItem.text,
              tooltip: String(statusBarItem.tooltip ?? ''),
            };
          },
          __testStatusActions(status: FlavorGrenadeStatus) {
            const nextStatus = withContextStatus(status, context);
            return {
              actions: getStatusQuickActions(nextStatus),
              diagnostics: buildDiagnosticInfo(nextStatus),
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
  const statusBar = ensureStatusBar(context);
  statusBarItem = statusBar;
  registerFlavorGrenadeStatusNotifications(nextClient, statusBar, {
    transform: (status) => withContextStatus({ ...currentStatus, ...status }, context),
    onStatus: (status) => {
      currentStatus = status;
      if (status.state === 'ready') {
        void languageModeController?.refreshAll();
      }
    },
  });
  currentStatus = withContextStatus(
    {
      state: 'initializing',
      vaultCount: 0,
      docCount: 0,
      serverPathSummary: summarizeServerCommand(serverCommand),
    },
    context,
  );
  applyFlavorGrenadeStatus(statusBar, currentStatus);

  // Reset status bar text on restart cycles (e.g., after restartServer command)
  context.subscriptions.push(
    nextClient.onDidChangeState((event) => {
      if (event.newState === State.Starting) {
        currentStatus = withContextStatus(
          {
            ...currentStatus,
            state: 'initializing',
            message: undefined,
          },
          context,
        );
        applyFlavorGrenadeStatus(statusBar, currentStatus);
      }
    }),
  );

  context.subscriptions.push(nextClient);

  await nextClient.start();

  languageModeController = new LanguageModeController(nextClient, {
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
        currentStatus = withContextStatus(
          {
            ...currentStatus,
            state: 'ready',
            docCount,
            vaultCount: workspace.workspaceFolders?.length ?? 0,
            vaultRoot: workspace.workspaceFolders?.[0]?.uri.toString(),
            message: undefined,
          },
          context,
        );
        applyFlavorGrenadeStatus(statusBar, currentStatus);
        void languageModeController?.refreshAll();
      },
      () => {
        // Ignore best-effort status refresh failures; normal LSP features still report errors.
      },
    );

  return nextClient;
}

function ensureStatusBar(context: ExtensionContext): StatusBarItem {
  if (statusBarItem) {
    return statusBarItem as StatusBarItem;
  }

  const statusBar = createFlavorGrenadeStatusBar();
  statusBarItem = statusBar;
  context.subscriptions.push(statusBar);
  return statusBar;
}

function createBaseStatus(
  state: FlavorGrenadeStatus['state'],
  context?: ExtensionContext,
): FlavorGrenadeStatus {
  return withContextStatus(
    {
      state,
      vaultCount: workspace.workspaceFolders?.length ?? 0,
      docCount: 0,
      vaultRoot: workspace.workspaceFolders?.[0]?.uri.toString(),
    },
    context,
  );
}

function withContextStatus(
  status: FlavorGrenadeStatus,
  context?: ExtensionContext,
): FlavorGrenadeStatus {
  const packageJson = context?.extension.packageJSON as { version?: unknown } | undefined;
  return {
    ...status,
    extensionVersion:
      typeof packageJson?.version === 'string' ? packageJson.version : status.extensionVersion,
    platform: status.platform ?? `${process.platform}-${process.arch}`,
  };
}

function getDisabledStatus(context: ExtensionContext): FlavorGrenadeStatus | undefined {
  const environment = describeWorkspaceEnvironment({
    arch: process.arch,
    isTrusted: workspace.isTrusted,
    platform: process.platform,
    remoteName: env.remoteName,
    workspaceFolderSchemes: workspace.workspaceFolders?.map((folder) => folder.uri.scheme),
  });

  if (!environment.canStartServer) {
    return withContextStatus(
      {
        state: 'disabled',
        vaultCount: workspace.workspaceFolders?.length ?? 0,
        docCount: 0,
        vaultRoot: workspace.workspaceFolders?.[0]?.uri.toString(),
        message: environment.statusMessage,
        platform: environment.platformSummary,
        serverPathSummary: environment.serverPathSummary,
      },
      context,
    );
  }

  return undefined;
}

function applyDisabledEnvironmentStatus(
  context: ExtensionContext,
): FlavorGrenadeStatus | undefined {
  const disabledStatus = getDisabledStatus(context);
  if (!disabledStatus) {
    return undefined;
  }

  const statusBar = ensureStatusBar(context);
  currentStatus = disabledStatus;
  applyFlavorGrenadeStatus(statusBar, currentStatus);
  return disabledStatus;
}

function summarizeServerCommand(command: ServerCommand): string {
  if (command.command === 'node') {
    return 'development server';
  }
  return command.args && command.args.length > 0 ? 'custom server command' : 'bundled server';
}
