import { type StatusBarItem, StatusBarAlignment, window } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

interface FlavorGrenadeStatus {
    state: 'initializing' | 'indexing' | 'ready' | 'error';
    vaultCount: number;
    docCount: number;
    message?: string;
}

/**
 * Creates a status bar item that reflects the server's indexing state.
 *
 * Listens to the non-standard `flavorGrenade/status` notification
 * defined in the API layer (see docs/design/api-layer.md).
 * Clicking the status bar item opens the output channel.
 */
export function createStatusBar(client: LanguageClient): StatusBarItem {
    const item = window.createStatusBarItem(
        'flavorGrenade.status',
        StatusBarAlignment.Left,
        -1,
    );

    item.name = 'Flavor Grenade';
    item.command = 'flavorGrenade.showOutput';
    item.text = '$(loading~spin) FG: Starting...';
    item.show();

    client.onNotification(
        'flavorGrenade/status',
        (params: FlavorGrenadeStatus) => {
            switch (params.state) {
                case 'initializing':
                    item.text = '$(loading~spin) FG: Starting...';
                    item.tooltip = 'Flavor Grenade: Initializing server';
                    break;
                case 'indexing':
                    item.text = '$(loading~spin) FG: Indexing...';
                    item.tooltip = `Flavor Grenade: Indexing ${params.docCount} docs across ${params.vaultCount} vaults`;
                    break;
                case 'ready':
                    item.text = `$(check) FG: ${params.docCount} docs`;
                    item.tooltip = `Flavor Grenade: Ready — ${params.docCount} docs in ${params.vaultCount} vaults`;
                    break;
                case 'error':
                    item.text = '$(error) FG: Error';
                    item.tooltip = `Flavor Grenade: ${params.message ?? 'Unknown error'}`;
                    break;
            }
        },
    );

    return item;
}
