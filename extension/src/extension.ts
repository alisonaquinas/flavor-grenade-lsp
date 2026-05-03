import {
    type ExtensionContext,
    workspace,
} from 'vscode';
import {
    LanguageClient,
    State,
    type LanguageClientOptions,
    type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServerCommand } from './server-path.js';
import { createStatusBar } from './status-bar.js';
import { registerCommands } from './commands.js';

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
    const serverCommand = resolveServerCommand(context);
    const config = workspace.getConfiguration('flavorGrenade');

    const serverOptions: ServerOptions = {
        run: serverCommand,
        debug: serverCommand,
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'markdown' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*.md'),
        },
        initializationOptions: {
            linkStyle: config.get('linkStyle'),
            completionCandidates: config.get('completion.candidates'),
            diagnosticsSuppress: config.get('diagnostics.suppress'),
        },
    };

    client = new LanguageClient(
        'flavorGrenade',
        'Flavor Grenade',
        serverOptions,
        clientOptions,
    );

    // Register status listeners before start() so early initialize/initialized
    // notifications cannot be missed during the LSP handshake.
    const statusBar = createStatusBar(client);
    context.subscriptions.push(statusBar);

    // Reset status bar text on restart cycles (e.g., after restartServer command)
    context.subscriptions.push(client.onDidChangeState((event) => {
        if (event.newState === State.Starting) {
            statusBar.text = '$(loading~spin) FG: Starting...';
            statusBar.tooltip = 'Flavor Grenade: Starting server';
        }
    }));

    context.subscriptions.push(client);

    await client.start();

    // If the server reached ready before the notification listener observed it,
    // awaitIndexReady gives us a deterministic post-start status check.
    client.sendRequest<{ docIds?: unknown[] }>('flavorGrenade/queryIndex', {
        rootUri: workspace.workspaceFolders?.[0]?.uri.toString(),
    }).then((result) => {
        const docCount = Array.isArray(result?.docIds) ? result.docIds.length : 0;
        statusBar.text = `$(check) FG: ${docCount} docs`;
        statusBar.tooltip = `Flavor Grenade: Ready - ${docCount} docs`;
    }, () => {
        // Ignore best-effort status refresh failures; normal LSP features still report errors.
    });

    // Palette commands
    const commandDisposables = registerCommands(client);
    context.subscriptions.push(...commandDisposables);

    // Restart on server path change
    context.subscriptions.push(
        workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('flavorGrenade.server.path') && client) {
                await client.restart();
            }
        }),
    );

    // LanguageClient implements Disposable — pushing to subscriptions handles
    // stop() on deactivation. No explicit stop() in deactivate() needed.
}

export function deactivate(): void {
    // Client cleanup is handled by context.subscriptions disposal.
}
