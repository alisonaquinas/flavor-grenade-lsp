import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { type ExtensionContext, Uri, window, workspace } from 'vscode';

/**
 * Resolves the path to the flavor-grenade-lsp server binary.
 *
 * Resolution order (2-tier):
 * 1. User setting `flavorGrenade.server.path` — escape hatch for local dev builds.
 *    Resolved to an absolute path and validated for existence before use.
 * 2. Bundled binary at `server/flavor-grenade-lsp[.exe]` — default for all users.
 *
 * No PATH fallback, no env var, no download. Platform-specific VSIXs guarantee
 * the binary is present at tier 2.
 */
export function resolveServerPath(context: ExtensionContext): string {
    const config = workspace.getConfiguration('flavorGrenade');
    const custom = config.get<string>('server.path');

    if (custom && custom.trim().length > 0) {
        const resolved = resolve(custom);

        if (!existsSync(resolved)) {
            void window.showWarningMessage(
                `Flavor Grenade: custom server path does not exist: ${resolved}. Falling back to bundled binary.`,
            );
        } else {
            void window.showInformationMessage(
                `Flavor Grenade: using custom server binary at ${resolved}`,
            );
            return resolved;
        }
    }

    const binaryName = process.platform === 'win32'
        ? 'flavor-grenade-lsp.exe'
        : 'flavor-grenade-lsp';

    return Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath;
}
