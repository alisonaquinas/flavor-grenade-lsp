import {
  ConfigurationTarget,
  type ExtensionContext,
  ExtensionMode,
  type StatusBarItem,
  type TextDocument,
  commands,
  env,
  window,
  workspace,
} from 'vscode';
import {
  LanguageClient,
  State,
  type LanguageClientOptions,
  type ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';
import type { ServerCommand } from './server-command.js';
import { resolveServerCommand } from './server-path.js';
import {
  applyMarkdownFlavorStatus,
  applyFlavorGrenadeStatus,
  createFlavorGrenadeStatusBar,
  createMarkdownFlavorStatusBar,
  registerFlavorGrenadeStatusNotifications,
} from './status-bar.js';
import { registerCommands } from './commands.js';
import { LanguageModeController } from './language-mode.js';
import {
  MARKDOWN_FLAVOR_COMMAND,
  MARKDOWN_FLAVOR_SECTION,
  MARKDOWN_FLAVOR_SETTING_KEY,
  MARKDOWN_STRUCTURED_PROFILES_SETTING_KEY,
  MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR,
  PROJECT_CONFIG_MAX_BYTES_SETTING_KEY,
  createMarkdownFlavorQuickPickItems,
  isFlavorEligibleDocument,
  isMarkdownFlavorSelection,
  isStructuredProfileSelection,
  resolveMarkdownFlavor,
  resolveMarkdownFlavorUpdateTarget,
  selectionSettingValue,
} from './markdown-flavor.js';
import { findMarkdownFlavorEvidence } from './markdown-flavor-evidence.js';
import { decideStartupGate } from './activation-gate.js';
import { ServerStartupBlockedError } from './server-startup-error.js';
import { buildDiagnosticInfo, getStatusQuickActions } from './status-presentation.js';
import type {
  FlavorGrenadeStatus,
  FlavorGrenadeStatusPresentation,
} from './status-presentation.js';
import { describeWorkspaceEnvironment } from './workspace-environment.js';
import { FLAVOR_GRENADE_PROJECT_CONFIG_GLOBS } from './project-config-files.js';

let client: LanguageClient | undefined;
let startClientPromise: Promise<LanguageClient> | undefined;
let statusBarItem: Pick<StatusBarItem, 'text' | 'tooltip'> | undefined;
let markdownFlavorStatusBarItem: Pick<StatusBarItem, 'text' | 'tooltip'> | undefined;
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
  ensureMarkdownFlavorStatusBar(context);
  await refreshMarkdownFlavorStatus(context);

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
  context.subscriptions.push(
    commands.registerCommand(MARKDOWN_FLAVOR_COMMAND, async () => {
      if (applyDisabledEnvironmentStatus(context)) {
        return;
      }

      const editor = window.activeTextEditor;
      if (!editor || !isFlavorEligibleDocument(editor.document)) {
        await window.showWarningMessage(
          'Markdown flavor applies only to file-backed Markdown documents.',
        );
        return;
      }

      const selected = await window.showQuickPick(createMarkdownFlavorQuickPickItems(), {
        matchOnDescription: true,
        placeHolder: 'Choose a Markdown flavor',
        title: 'Flavor Grenade Markdown Flavor',
      });
      if (!selected) {
        return;
      }

      const config = workspace.getConfiguration(MARKDOWN_FLAVOR_SECTION, editor.document.uri);
      const inspect = config.inspect<unknown>(MARKDOWN_FLAVOR_SETTING_KEY);
      const target = resolveMarkdownFlavorUpdateTarget({
        hasFolderOverride: inspect?.workspaceFolderValue !== undefined,
        hasWorkspaceFolder: workspace.getWorkspaceFolder(editor.document.uri) !== undefined,
        workspaceFolderCount: workspace.workspaceFolders?.length ?? 0,
      });
      await config.update(
        MARKDOWN_FLAVOR_SETTING_KEY,
        selectionSettingValue(selected.id),
        target === 'workspace-folder'
          ? ConfigurationTarget.WorkspaceFolder
          : target === 'workspace'
            ? ConfigurationTarget.Workspace
            : ConfigurationTarget.Global,
      );

      await refreshMarkdownFlavorStatus(context);
      await startClient(MARKDOWN_FLAVOR_COMMAND);
      await languageModeController?.refreshAll();
      await refreshMarkdownFlavorStatus(context);
    }),
  );

  // Restart on server path change
  context.subscriptions.push(
    workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('flavorGrenade.server.path') && client) {
        await client.restart();
      }
      if (e.affectsConfiguration(`flavorGrenade.${PROJECT_CONFIG_MAX_BYTES_SETTING_KEY}`) && client) {
        await client.restart();
      }
      const activeDocument = window.activeTextEditor?.document;
      if (activeDocument && e.affectsConfiguration(MARKDOWN_FLAVOR_SECTION, activeDocument.uri)) {
        await refreshMarkdownFlavorStatus(context);
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
      void refreshMarkdownFlavorStatus(context);
    }),
    window.onDidChangeActiveTextEditor(() => {
      void refreshMarkdownFlavorStatus(context);
    }),
    workspace.onDidChangeWorkspaceFolders(() => {
      void maybeStartClient();
      void refreshMarkdownFlavorStatus(context);
    }),
  );

  for (const markerWatcher of [
    workspace.createFileSystemWatcher('**/.obsidian'),
    ...FLAVOR_GRENADE_PROJECT_CONFIG_GLOBS.map((glob) => workspace.createFileSystemWatcher(glob)),
  ]) {
    context.subscriptions.push(
      markerWatcher,
      markerWatcher.onDidCreate(() => {
        void maybeStartClient();
        void refreshMarkdownFlavorStatus(context);
      }),
      markerWatcher.onDidChange(() => {
        void maybeStartClient();
        void refreshMarkdownFlavorStatus(context);
      }),
      markerWatcher.onDidDelete(() => {
        void maybeStartClient();
        void refreshMarkdownFlavorStatus(context);
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

  const serverOptions = toServerOptions(serverCommand);

  const clientOptions: LanguageClientOptions = {
    documentSelector: [...MARKDOWN_LANGUAGE_DOCUMENT_SELECTOR],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*.md'),
    },
    initializationOptions: {
      linkStyle: config.get('linkStyle'),
      completionCandidates: config.get('completion.candidates'),
      diagnosticsSuppress: config.get('diagnostics.suppress'),
      projectConfigMaxBytes: config.get(PROJECT_CONFIG_MAX_BYTES_SETTING_KEY),
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
        void refreshMarkdownFlavorStatus(context);
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
    setTextDocumentLanguage: (document) => Promise.resolve(document),
    getMarkdownFlavorSelection: (document) => {
      const value = workspace
        .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
        .get(MARKDOWN_FLAVOR_SETTING_KEY);
      return isMarkdownFlavorSelection(value) ? value : 'auto';
    },
    getMarkdownStructuredProfileSelection: (document) => {
      const value = workspace
        .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
        .get(MARKDOWN_STRUCTURED_PROFILES_SETTING_KEY);
      return isStructuredProfileSelection(value) ? value : 'auto';
    },
    getProjectConfigMaxBytes: (document) =>
      workspace
        .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
        .get(PROJECT_CONFIG_MAX_BYTES_SETTING_KEY),
    getWorkspaceFolderPath: (document) => workspace.getWorkspaceFolder(document.uri)?.uri.fsPath,
    onDidOpenTextDocument: (listener) => workspace.onDidOpenTextDocument(listener),
    onDidChangeVisibleTextEditors: (listener) => window.onDidChangeVisibleTextEditors(listener),
    onDidChangeWorkspaceFolders: (listener) => workspace.onDidChangeWorkspaceFolders(listener),
  });
  context.subscriptions.push(...languageModeController.start());
  await languageModeController.refreshAll();
  await refreshMarkdownFlavorStatus(context);

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
        void refreshMarkdownFlavorStatus(context);
      },
      () => {
        // Ignore best-effort status refresh failures; normal LSP features still report errors.
      },
    );

  return nextClient;
}

function ensureMarkdownFlavorStatusBar(context: ExtensionContext): StatusBarItem {
  if (markdownFlavorStatusBarItem) {
    return markdownFlavorStatusBarItem as StatusBarItem;
  }

  const statusBar = createMarkdownFlavorStatusBar();
  markdownFlavorStatusBarItem = statusBar;
  context.subscriptions.push(statusBar);
  return statusBar;
}

async function refreshMarkdownFlavorStatus(context: ExtensionContext): Promise<void> {
  const statusBar = ensureMarkdownFlavorStatusBar(context);
  const document = window.activeTextEditor?.document;
  if (!document) {
    applyMarkdownFlavorStatus(statusBar);
    return;
  }

  if (languageModeController) {
    applyMarkdownFlavorStatus(
      statusBar,
      await languageModeController.resolveMarkdownFlavorForDocument(document),
    );
    return;
  }

  applyMarkdownFlavorStatus(statusBar, await resolveLocalMarkdownFlavor(document));
}

async function resolveLocalMarkdownFlavor(document: TextDocument) {
  const selected = markdownFlavorSelectionForDocument(document);
  if (!isFlavorEligibleDocument(document)) {
    return resolveMarkdownFlavor({ document, selected });
  }

  const evidence = document.uri.fsPath
    ? await findMarkdownFlavorEvidence(document.uri.fsPath, {
        searchBoundary: workspace.getWorkspaceFolder(document.uri)?.uri.fsPath,
        projectConfigMaxBytes: workspace
          .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
          .get(PROJECT_CONFIG_MAX_BYTES_SETTING_KEY),
      })
    : undefined;
  return resolveMarkdownFlavor({
    document,
    hasObsidianMarker: evidence?.hasObsidianMarker,
    projectFlavor: evidence?.projectFlavor,
    projectStructuredProfiles: evidence?.projectStructuredProfiles,
    selected,
    structuredProfileSelection: markdownStructuredProfileSelectionForDocument(document),
    syntaxText: document.getText(),
  });
}

function markdownFlavorSelectionForDocument(document: TextDocument) {
  const value = workspace
    .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
    .get(MARKDOWN_FLAVOR_SETTING_KEY);
  return isMarkdownFlavorSelection(value) ? value : 'auto';
}

function markdownStructuredProfileSelectionForDocument(document: TextDocument) {
  const value = workspace
    .getConfiguration(MARKDOWN_FLAVOR_SECTION, document.uri)
    .get(MARKDOWN_STRUCTURED_PROFILES_SETTING_KEY);
  return isStructuredProfileSelection(value) ? value : 'auto';
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
  if (command.kind === 'module') {
    return 'bundled server module';
  }
  if (command.command === 'node') {
    return 'development server';
  }
  return 'custom server command';
}

function toServerOptions(command: ServerCommand): ServerOptions {
  if (command.kind === 'module') {
    return {
      run: { module: command.module, transport: TransportKind.stdio },
      debug: {
        module: command.module,
        transport: TransportKind.stdio,
        options: { execArgv: ['--nolazy', '--inspect=6009'] },
      },
    };
  }

  return {
    run: { command: command.command, args: command.args },
    debug: { command: command.command, args: command.args },
  };
}
