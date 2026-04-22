import { type ExtensionContext, Uri, workspace } from 'vscode';

/**
 * Resolves the path to the flavor-grenade-lsp server binary.
 *
 * Resolution order (2-tier):
 * 1. User setting `flavorGrenade.server.path` — escape hatch for local dev builds.
 * 2. Bundled binary at `server/flavor-grenade-lsp[.exe]` — default for all users.
 *
 * No PATH fallback, no env var, no download. Platform-specific VSIXs guarantee
 * the binary is present at tier 2.
 */
export function resolveServerPath(context: ExtensionContext): string {
    const config = workspace.getConfiguration('flavorGrenade');
    const custom = config.get<string>('server.path');

    if (custom && custom.trim().length > 0) {
        return custom;
    }

    const binaryName = process.platform === 'win32'
        ? 'flavor-grenade-lsp.exe'
        : 'flavor-grenade-lsp';

    return Uri.joinPath(context.extensionUri, 'server', binaryName).fsPath;
}
