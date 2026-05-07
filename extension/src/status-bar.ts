import { type StatusBarItem, StatusBarAlignment, window } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';
import { formatFlavorGrenadeStatus, type FlavorGrenadeStatus } from './status-presentation.js';

export function applyFlavorGrenadeStatus(
    item: Pick<StatusBarItem, 'text' | 'tooltip'>,
    params: FlavorGrenadeStatus,
): void {
    const presentation = formatFlavorGrenadeStatus(params);
    item.text = presentation.text;
    item.tooltip = presentation.tooltip;
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
            applyFlavorGrenadeStatus(item, params);
        },
    );

    return item;
}
