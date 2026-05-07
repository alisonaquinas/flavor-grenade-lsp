import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
export const extensionRoot = resolve(testDir, '..', '..');

export interface ExtensionManifest {
  contributes?: {
    keybindings?: Array<{
      command?: string;
      key?: string;
      mac?: string;
      when?: string;
    }>;
    languages?: Array<{
      configuration?: string;
      id?: string;
    }>;
    snippets?: Array<{
      language?: string;
      path?: string;
    }>;
  };
}

export async function readManifest(): Promise<ExtensionManifest> {
  return JSON.parse(await readFile(join(extensionRoot, 'package.json'), 'utf8')) as ExtensionManifest;
}

export async function readJsonFile<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(join(extensionRoot, relativePath), 'utf8')) as T;
}
