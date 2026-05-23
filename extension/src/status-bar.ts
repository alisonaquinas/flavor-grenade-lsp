import { type StatusBarItem, StatusBarAlignment, window } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';
import { formatFlavorGrenadeStatus, type FlavorGrenadeStatus } from './status-presentation.js';
import {
    MARKDOWN_FLAVOR_COMMAND,
    formatMarkdownFlavorStatus,
    type MarkdownFlavorResolution,
} from './markdown-flavor.js';

interface StatusNotificationOptions {
    onStatus?(status: FlavorGrenadeStatus): void;
    transform?(status: FlavorGrenadeStatus): FlavorGrenadeStatus;
}

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
export function createFlavorGrenadeStatusBar(): StatusBarItem {
    const item = window.createStatusBarItem(
        'flavorGrenade.status',
        StatusBarAlignment.Left,
        -1,
    );

    item.name = 'Flavor Grenade';
    item.command = 'flavorGrenade.showStatusActions';
    item.text = '$(loading~spin) FG: Starting...';
    item.show();

    return item;
}

export function applyMarkdownFlavorStatus(
    item: Pick<StatusBarItem, 'text' | 'tooltip'>,
    resolution?: MarkdownFlavorResolution,
): void {
    const presentation = formatMarkdownFlavorStatus(resolution);
    item.text = presentation.text;
    item.tooltip = presentation.tooltip;
}

export function createMarkdownFlavorStatusBar(): StatusBarItem {
    const item = window.createStatusBarItem(
        'flavorGrenade.markdownFlavor',
        StatusBarAlignment.Left,
        -2,
    );

    item.name = 'Flavor Grenade Markdown Flavor';
    item.command = MARKDOWN_FLAVOR_COMMAND;
    applyMarkdownFlavorStatus(item);
    item.show();

    return item;
}

export function registerFlavorGrenadeStatusNotifications(
    client: LanguageClient,
    item: Pick<StatusBarItem, 'text' | 'tooltip'>,
    options: StatusNotificationOptions = {},
): void {
    client.onNotification(
        'flavorGrenade/status',
        (params: FlavorGrenadeStatus) => {
            const status = options.transform?.(params) ?? params;
            applyFlavorGrenadeStatus(item, status);
            options.onStatus?.(status);
        },
    );
}

export function createStatusBar(client: LanguageClient): StatusBarItem {
    const item = createFlavorGrenadeStatusBar();
    registerFlavorGrenadeStatusNotifications(client, item);
    return item;
}
