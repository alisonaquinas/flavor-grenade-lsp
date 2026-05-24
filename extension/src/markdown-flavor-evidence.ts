import { open, realpath, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  isMarkdownFlavorSelection,
  isStructuredProfileSelection,
  type MarkdownFlavorSelection,
  type StructuredProfileSelection,
} from './markdown-flavor.js';

const PROJECT_CONFIG_FILE = '.flavor-grenade.toml';
const MAX_PROJECT_CONFIG_BYTES = 8192;

type StatFn = typeof stat;
type RealpathFn = (path: string) => Promise<string>;
type ReadFileFn = (path: string, encoding: 'utf8') => Promise<string>;

export interface MarkdownFlavorEvidence {
  hasFlavorConfigMarker: boolean;
  hasObsidianMarker: boolean;
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
}

export async function findMarkdownFlavorEvidence(
  filePath: string,
  options: {
    readFileFn?: ReadFileFn;
    realpathFn?: RealpathFn;
    searchBoundary?: string;
    statFn?: StatFn;
  } = {},
): Promise<MarkdownFlavorEvidence> {
  const statFn = options.statFn ?? stat;
  const realpathFn = options.realpathFn ?? ((path: string) => realpath(path));
  const searchBoundary = options.searchBoundary ? resolve(options.searchBoundary) : undefined;
  const startPath = searchBoundary === undefined ? filePath : resolve(filePath);
  if (searchBoundary !== undefined && !isPathWithinOrEqual(startPath, searchBoundary)) {
    return {
      hasFlavorConfigMarker: false,
      hasObsidianMarker: false,
    };
  }
  const realBoundary =
    searchBoundary === undefined ? undefined : await realpathOrUndefined(searchBoundary, realpathFn);
  if (searchBoundary !== undefined && realBoundary === undefined) {
    return {
      hasFlavorConfigMarker: false,
      hasObsidianMarker: false,
    };
  }
  const realStart =
    realBoundary === undefined ? undefined : await realpathOrUndefined(startPath, realpathFn);
  if (
    realBoundary !== undefined &&
    (realStart === undefined || !isPathWithinOrEqual(realStart, realBoundary))
  ) {
    return {
      hasFlavorConfigMarker: false,
      hasObsidianMarker: false,
    };
  }
  let current = dirname(startPath);
  let foundObsidianMarker = false;

  while (true) {
    const obsidianPath = join(current, '.obsidian');
    const hasObsidianMarker =
      (await markerExists(obsidianPath, 'directory', statFn)) &&
      (realBoundary === undefined ||
        (await realpathIsWithinOrEqual(obsidianPath, realBoundary, realpathFn)));
    foundObsidianMarker ||= hasObsidianMarker;

    const configPath = join(current, PROJECT_CONFIG_FILE);
    const hasFlavorConfigMarker =
      (await markerExists(configPath, 'file', statFn)) &&
      (realBoundary === undefined ||
        (await realpathIsWithinOrEqual(configPath, realBoundary, realpathFn)));
    if (hasFlavorConfigMarker) {
      const config = await readProjectMarkdownConfig(configPath, {
        readFileFn: options.readFileFn,
      });
      return {
        hasFlavorConfigMarker: true,
        hasObsidianMarker: foundObsidianMarker,
        ...(config.projectFlavor !== undefined && { projectFlavor: config.projectFlavor }),
        ...(config.projectStructuredProfiles !== undefined && {
          projectStructuredProfiles: config.projectStructuredProfiles,
        }),
      };
    }

    if (hasObsidianMarker && searchBoundary === undefined) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: true,
      };
    }

    if (searchBoundary !== undefined && resolve(current) === searchBoundary) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: foundObsidianMarker,
      };
    }

    const parent = dirname(current);
    if (parent === current) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: foundObsidianMarker,
      };
    }
    current = parent;
  }
}

function isPathWithinOrEqual(childPath: string, parentPath: string): boolean {
  const relativePath = relative(parentPath, childPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
}

async function realpathIsWithinOrEqual(
  childPath: string,
  parentPath: string,
  realpathFn: RealpathFn,
): Promise<boolean> {
  const realChild = await realpathOrUndefined(childPath, realpathFn);
  return realChild !== undefined && isPathWithinOrEqual(resolve(realChild), resolve(parentPath));
}

async function realpathOrUndefined(
  path: string,
  realpathFn: RealpathFn,
): Promise<string | undefined> {
  try {
    return await realpathFn(path);
  } catch {
    return undefined;
  }
}

export async function readProjectMarkdownFlavor(
  configPath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
  } = {},
): Promise<MarkdownFlavorSelection | undefined> {
  return (await readProjectMarkdownConfig(configPath, options)).projectFlavor;
}

async function readProjectMarkdownConfig(
  configPath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
  } = {},
): Promise<{
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
}> {
  const content = options.readFileFn
    ? await readConfigWithInjectedReader(configPath, options.readFileFn)
    : await readConfigFromOpenFile(configPath);

  if (content === undefined || hasDangerousTomlKey(content)) {
    return {};
  }

  return {
    projectFlavor: parseProjectFlavor(content),
    projectStructuredProfiles: parseProjectStructuredProfiles(content),
  };
}

async function readConfigWithInjectedReader(
  configPath: string,
  readFileFn: ReadFileFn,
): Promise<string | undefined> {
  try {
    const content = await readFileFn(configPath, 'utf8');
    return Buffer.byteLength(content, 'utf8') > MAX_PROJECT_CONFIG_BYTES ? undefined : content;
  } catch {
    return undefined;
  }
}

async function readConfigFromOpenFile(configPath: string): Promise<string | undefined> {
  let file: Awaited<ReturnType<typeof open>> | undefined;
  try {
    file = await open(configPath, 'r');
    const result = await file.stat();
    if (!result.isFile() || result.size > MAX_PROJECT_CONFIG_BYTES) {
      return undefined;
    }

    const content = await file.readFile('utf8');
    return Buffer.byteLength(content, 'utf8') > MAX_PROJECT_CONFIG_BYTES ? undefined : content;
  } catch {
    return undefined;
  } finally {
    await file?.close();
  }
}

async function markerExists(
  markerPath: string,
  expectedKind: 'directory' | 'file',
  statFn: StatFn,
): Promise<boolean> {
  try {
    const marker = await statFn(markerPath);
    return expectedKind === 'directory' ? marker.isDirectory() : marker.isFile();
  } catch {
    return false;
  }
}

function parseProjectFlavor(content: string): MarkdownFlavorSelection | undefined {
  const value = parseProjectMarkdownKey(content, 'flavor');
  return typeof value === 'string' && isMarkdownFlavorSelection(value) ? value : undefined;
}

function parseProjectStructuredProfiles(content: string): StructuredProfileSelection | undefined {
  const value = parseProjectMarkdownKey(content, 'structured_profiles');
  return isStructuredProfileSelection(value) ? value : undefined;
}

function parseProjectMarkdownKey(
  content: string,
  key: string,
): string | readonly string[] | undefined {
  let section = '';

  const rawLines = content.split(/\r?\n/);
  for (let index = 0; index < rawLines.length; index += 1) {
    const rawLine = rawLines[index] ?? '';
    const line = stripInlineComment(rawLine).trim();
    if (line.length === 0) {
      continue;
    }

    const sectionMatch = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1] ?? '';
      continue;
    }

    const arrayStartMatch = /^([A-Za-z0-9_.-]+)\s*=\s*\[\s*$/.exec(line);
    if (arrayStartMatch) {
      const fullKey = section.length > 0 ? `${section}.${arrayStartMatch[1]}` : arrayStartMatch[1];
      if (fullKey !== `core.markdown.${key}`) {
        continue;
      }
      const arrayLines: string[] = [];
      for (index += 1; index < rawLines.length; index += 1) {
        const arrayLine = stripInlineComment(rawLines[index] ?? '').trim();
        if (arrayLine === ']') {
          return parseStringArray(arrayLines.join(','));
        }
        if (arrayLine.endsWith(']')) {
          arrayLines.push(arrayLine.slice(0, -1));
          return parseStringArray(arrayLines.join(','));
        }
        arrayLines.push(arrayLine);
      }
      return undefined;
    }

    const valueMatch = /^([A-Za-z0-9_.-]+)\s*=\s*(?:"([^"]*)"|\[([^\]]*)\])\s*$/.exec(line);
    if (!valueMatch) {
      continue;
    }

    const fullKey = section.length > 0 ? `${section}.${valueMatch[1]}` : valueMatch[1];
    if (fullKey !== `core.markdown.${key}`) {
      continue;
    }

    if (valueMatch[2] !== undefined) {
      return valueMatch[2];
    }
    return parseStringArray(valueMatch[3] ?? '');
  }

  return undefined;
}

function parseStringArray(value: string): readonly string[] | undefined {
  if (value.trim().length === 0) {
    return [];
  }
  const parsed: string[] = [];
  for (const part of value.split(',')) {
    if (part.trim().length === 0) {
      continue;
    }
    const match = /^\s*"([^"]*)"\s*$/.exec(part);
    if (!match) {
      return undefined;
    }
    parsed.push(match[1]);
  }
  return parsed;
}

function stripInlineComment(line: string): string {
  const hashIndex = line.indexOf('#');
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function hasDangerousTomlKey(content: string): boolean {
  return /(^|[\s.[{])(__proto__|constructor|prototype)(\s*=|\s*\]|\s*\.|\s*\})/.test(content);
}
