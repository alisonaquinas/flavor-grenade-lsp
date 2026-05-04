import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ServerCommand {
    command: string;
    args?: string[];
}

export interface ServerCommandOptions {
    customPath?: string;
    extensionPath: string;
    isDevelopment: boolean;
    platform?: NodeJS.Platform;
    exists?: (path: string) => boolean;
    notifyInfo?: (message: string) => void;
    notifyWarning?: (message: string) => void;
}

export function resolveServerCommandFromOptions(options: ServerCommandOptions): ServerCommand {
    const exists = options.exists ?? existsSync;
    const platform = options.platform ?? process.platform;
    const custom = options.customPath?.trim();

    if (custom && custom.length > 0) {
        const resolved = resolve(custom);
        if (exists(resolved)) {
            options.notifyInfo?.(`Flavor Grenade: using custom server binary at ${resolved}`);
            return { command: resolved };
        }

        options.notifyWarning?.(
            `Flavor Grenade: custom server path does not exist: ${resolved}. Falling back to default server.`,
        );
    }

    if (options.isDevelopment) {
        return {
            command: 'node',
            args: [resolve(options.extensionPath, '..', 'dist', 'main.js')],
        };
    }

    const binaryName = platform === 'win32' ? 'flavor-grenade-lsp.exe' : 'flavor-grenade-lsp';
    return { command: resolve(options.extensionPath, 'server', binaryName) };
}
