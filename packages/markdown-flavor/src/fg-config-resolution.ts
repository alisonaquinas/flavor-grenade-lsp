import { applyFgAttributes, type FgAttributes, parseFgAttributes } from './fgattributes.js';
import { matchFgIgnore, parseFgIgnore, shouldPruneDirectoryByFgIgnore } from './fgignore.js';
import {
  confinePathToRoot,
  normalizeRootPath,
  resolveRootRelativePath,
  rootRelativePath,
} from './path-confinement.js';

export const DEFAULT_FG_CONFIG_MAX_BYTES = 8192;

export interface FlavorConfigFileStat {
  isFile(): boolean;
  size: number;
}

export interface FlavorConfigFileReader {
  stat(
    filePath: string,
  ): FlavorConfigFileStat | undefined | Promise<FlavorConfigFileStat | undefined>;
  readFile(filePath: string): string | undefined | Promise<string | undefined>;
}

export interface SyncFlavorConfigFileReader {
  stat(filePath: string): FlavorConfigFileStat | undefined;
  readFile(filePath: string): string | undefined;
}

export interface FlavorConfigResolution {
  ignored: boolean;
  inactiveReason?: 'fgignore' | 'outside-vault';
  configFilesSeen: boolean;
  attributes: FgAttributes;
}

export type ResolveFlavorConfigInput = {
  root: string;
  path: string;
  maxConfigBytes?: number;
} & ({ reader: FlavorConfigFileReader } | FlavorConfigFileReader);

export type ResolveFlavorConfigSyncInput = {
  root: string;
  path: string;
  maxConfigBytes?: number;
} & ({ reader: SyncFlavorConfigFileReader } | SyncFlavorConfigFileReader);

interface ConfigDirectory {
  directory: string;
  relativeTargetPath: string;
}

export async function resolveFlavorConfig(
  input: ResolveFlavorConfigInput,
): Promise<FlavorConfigResolution> {
  const confinedResource = confinePathToRoot(input.root, input.path);
  if (confinedResource === null) {
    return outsideVaultResult();
  }

  const maxConfigBytes = normalizeMaxConfigBytes(input.maxConfigBytes);
  const directories = configDirectoriesFor(input.root, confinedResource);
  let configFilesSeen = false;
  let ignored = false;
  let attributes: FgAttributes = {};

  for (const directory of directories) {
    const ignoreContent = await readConfigIfPresent(
      input,
      directory.directory,
      '.fgignore',
      maxConfigBytes,
    );
    if (ignoreContent !== undefined) {
      configFilesSeen = true;
      ignored = matchFgIgnore(parseFgIgnore(ignoreContent), directory.relativeTargetPath, ignored);
    }

    const attributesContent = await readConfigIfPresent(
      input,
      directory.directory,
      '.fgattributes',
      maxConfigBytes,
    );
    if (attributesContent !== undefined) {
      configFilesSeen = true;
      attributes = applyFgAttributes(
        parseFgAttributes(attributesContent),
        directory.relativeTargetPath,
        attributes,
      );
    }
  }

  return flavorConfigResult(ignored, configFilesSeen, attributes);
}

export function resolveFlavorConfigSync(
  input: ResolveFlavorConfigSyncInput,
): FlavorConfigResolution {
  const confinedResource = confinePathToRoot(input.root, input.path);
  if (confinedResource === null) {
    return outsideVaultResult();
  }

  const maxConfigBytes = normalizeMaxConfigBytes(input.maxConfigBytes);
  const directories = configDirectoriesFor(input.root, confinedResource);
  let configFilesSeen = false;
  let ignored = false;
  let attributes: FgAttributes = {};

  for (const directory of directories) {
    const ignoreContent = readConfigIfPresentSync(
      input,
      directory.directory,
      '.fgignore',
      maxConfigBytes,
    );
    if (ignoreContent !== undefined) {
      configFilesSeen = true;
      ignored = matchFgIgnore(parseFgIgnore(ignoreContent), directory.relativeTargetPath, ignored);
    }

    const attributesContent = readConfigIfPresentSync(
      input,
      directory.directory,
      '.fgattributes',
      maxConfigBytes,
    );
    if (attributesContent !== undefined) {
      configFilesSeen = true;
      attributes = applyFgAttributes(
        parseFgAttributes(attributesContent),
        directory.relativeTargetPath,
        attributes,
      );
    }
  }

  return flavorConfigResult(ignored, configFilesSeen, attributes);
}

export async function shouldPruneDirectoryByFlavorConfig(
  input: ResolveFlavorConfigInput,
): Promise<boolean> {
  const confinedDirectory = confinePathToRoot(input.root, input.path);
  if (confinedDirectory === null) {
    return true;
  }

  const maxConfigBytes = normalizeMaxConfigBytes(input.maxConfigBytes);
  const directories = configDirectoriesFor(input.root, confinedDirectory);
  let ignored = false;

  for (const directory of directories) {
    const ignoreContent = await readConfigIfPresent(
      input,
      directory.directory,
      '.fgignore',
      maxConfigBytes,
    );
    if (ignoreContent !== undefined) {
      ignored = shouldPruneDirectoryByFgIgnore(
        parseFgIgnore(ignoreContent),
        directory.relativeTargetPath,
        ignored,
      );
    }
  }

  return ignored;
}

export function shouldPruneDirectoryByFlavorConfigSync(
  input: ResolveFlavorConfigSyncInput,
): boolean {
  const confinedDirectory = confinePathToRoot(input.root, input.path);
  if (confinedDirectory === null) {
    return true;
  }

  const maxConfigBytes = normalizeMaxConfigBytes(input.maxConfigBytes);
  const directories = configDirectoriesFor(input.root, confinedDirectory);
  let ignored = false;

  for (const directory of directories) {
    const ignoreContent = readConfigIfPresentSync(
      input,
      directory.directory,
      '.fgignore',
      maxConfigBytes,
    );
    if (ignoreContent !== undefined) {
      ignored = shouldPruneDirectoryByFgIgnore(
        parseFgIgnore(ignoreContent),
        directory.relativeTargetPath,
        ignored,
      );
    }
  }

  return ignored;
}

async function readConfigIfPresent(
  input: ResolveFlavorConfigInput,
  directory: string,
  fileName: '.fgignore' | '.fgattributes',
  maxConfigBytes: number,
): Promise<string | undefined> {
  const candidate = configFilePath(input.root, directory, fileName);
  if (candidate === null) {
    return undefined;
  }

  const reader = configFileReader(input);
  try {
    const stat = await reader.stat(candidate);
    if (stat === undefined || !stat.isFile() || stat.size > maxConfigBytes) {
      return undefined;
    }

    const content = await reader.readFile(candidate);
    if (content === undefined || utf8ByteLength(content) > maxConfigBytes) {
      return undefined;
    }
    return content;
  } catch {
    return undefined;
  }
}

function readConfigIfPresentSync(
  input: ResolveFlavorConfigSyncInput,
  directory: string,
  fileName: '.fgignore' | '.fgattributes',
  maxConfigBytes: number,
): string | undefined {
  const candidate = configFilePath(input.root, directory, fileName);
  if (candidate === null) {
    return undefined;
  }

  const reader = syncConfigFileReader(input);
  const stat = reader.stat(candidate);
  if (stat === undefined || !stat.isFile() || stat.size > maxConfigBytes) {
    return undefined;
  }

  const content = reader.readFile(candidate);
  if (content === undefined || utf8ByteLength(content) > maxConfigBytes) {
    return undefined;
  }
  return content;
}

function configDirectoriesFor(root: string, resourcePath: string): ConfigDirectory[] {
  const relativeResource = rootRelativePath(root, resourcePath);
  if (relativeResource === null) {
    return [];
  }

  const relativeDirectory = relativeDirname(relativeResource);
  const parts =
    relativeDirectory === null || relativeDirectory === '' || relativeDirectory === '.'
      ? []
      : relativeDirectory.split('/');
  const result: ConfigDirectory[] = [];

  for (let index = 0; index <= parts.length; index += 1) {
    const relativeDir = parts.slice(0, index).join('/');
    const directory =
      relativeDir.length === 0
        ? normalizeRootPath(root)
        : resolveRootRelativePath(root, relativeDir);
    if (directory === null) {
      continue;
    }
    const relativeTargetPath =
      relativeDir.length === 0
        ? relativeResource
        : relativeResource.slice(`${relativeDir}/`.length);
    result.push({ directory, relativeTargetPath });
  }

  return result;
}

function configFilePath(
  root: string,
  directory: string,
  fileName: '.fgignore' | '.fgattributes',
): string | null {
  const relativeDirectory = rootRelativePath(root, directory);
  if (relativeDirectory === null) {
    return null;
  }
  if (relativeDirectory === '' || relativeDirectory === '.') {
    return resolveRootRelativePath(root, fileName);
  }
  return resolveRootRelativePath(root, `${relativeDirectory}/${fileName}`);
}

function normalizeMaxConfigBytes(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_FG_CONFIG_MAX_BYTES;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : DEFAULT_FG_CONFIG_MAX_BYTES;
}

function configFileReader(input: ResolveFlavorConfigInput): FlavorConfigFileReader {
  return 'reader' in input ? input.reader : input;
}

function syncConfigFileReader(input: ResolveFlavorConfigSyncInput): SyncFlavorConfigFileReader {
  return 'reader' in input ? input.reader : input;
}

function flavorConfigResult(
  ignored: boolean,
  configFilesSeen: boolean,
  attributes: FgAttributes,
): FlavorConfigResolution {
  if (ignored) {
    return {
      ignored: true,
      inactiveReason: 'fgignore',
      configFilesSeen,
      attributes: {},
    };
  }

  return {
    ignored: false,
    configFilesSeen,
    attributes,
  };
}

function outsideVaultResult(): FlavorConfigResolution {
  return {
    ignored: true,
    inactiveReason: 'outside-vault',
    configFilesSeen: false,
    attributes: {},
  };
}

function relativeDirname(relativePath: string): string {
  const index = relativePath.lastIndexOf('/');
  return index < 0 ? '' : relativePath.slice(0, index);
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}
