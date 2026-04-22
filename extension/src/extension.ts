import {
    type ExtensionContext,
    workspace,
} from 'vscode';
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
} from 'vscode-languageclient/node';
import { resolveServerPath } from './server-path.js';
import { createStatusBar } from './status-bar.js';
import { registerCommands } from './commands.js';

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext): Promise<void> {
    const serverPath = resolveServerPath(context);
    const config = workspace.getConfiguration('flavorGrenade');

    const serverOptions: ServerOptions = {
        run:   { command: serverPath },
        debug: { command: serverPath },
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

    await client.start();

    // Status bar widget
    const statusBar = createStatusBar(client);
    context.subscriptions.push(statusBar);

    // Reset status bar text on restart cycles (e.g., after restartServer command)
    client.onDidChangeState(() => {
        statusBar.text = '$(loading~spin) FG: Starting...';
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
    context.subscriptions.push(client);
}

export function deactivate(): void {
    // Client cleanup is handled by context.subscriptions disposal.
}
