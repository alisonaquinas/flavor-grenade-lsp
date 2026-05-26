import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type ServerCommand = ServerExecutableCommand | ServerModuleCommand;

export interface ServerExecutableCommand {
  kind: 'executable';
  command: string;
  args?: string[];
}

export interface ServerModuleCommand {
  kind: 'module';
  module: string;
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
  const custom = options.customPath?.trim();

  if (custom && custom.length > 0) {
    const resolved = resolve(custom);
    if (exists(resolved)) {
      options.notifyInfo?.(`Flavor Grenade: using custom server command at ${resolved}`);
      return { kind: 'executable', command: resolved };
    }

    options.notifyWarning?.(
      `Flavor Grenade: custom server path does not exist: ${resolved}. Falling back to default server.`,
    );
  }

  if (options.isDevelopment) {
    const bundledModule = resolve(options.extensionPath, 'server', 'main.js');
    if (exists(bundledModule)) {
      return { kind: 'module', module: bundledModule };
    }
    return {
      kind: 'executable',
      command: 'node',
      args: [resolve(options.extensionPath, '..', 'dist', 'main.js')],
    };
  }

  return { kind: 'module', module: resolve(options.extensionPath, 'server', 'main.js') };
}
