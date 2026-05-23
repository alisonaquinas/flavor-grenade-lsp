import { open, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { isMarkdownFlavorSelection, type MarkdownFlavorSelection } from './markdown-flavor.js';

const PROJECT_CONFIG_FILE = '.flavor-grenade.toml';
const MAX_PROJECT_CONFIG_BYTES = 8192;

type StatFn = typeof stat;
type ReadFileFn = (path: string, encoding: 'utf8') => Promise<string>;

export interface MarkdownFlavorEvidence {
  hasFlavorConfigMarker: boolean;
  hasObsidianMarker: boolean;
  projectFlavor?: MarkdownFlavorSelection;
}

export async function findMarkdownFlavorEvidence(
  filePath: string,
  options: {
    readFileFn?: ReadFileFn;
    searchBoundary?: string;
    statFn?: StatFn;
  } = {},
): Promise<MarkdownFlavorEvidence> {
  const statFn = options.statFn ?? stat;
  const searchBoundary = options.searchBoundary ? resolve(options.searchBoundary) : undefined;
  let current = dirname(filePath);

  while (true) {
    const obsidianPath = join(current, '.obsidian');
    if (await markerExists(obsidianPath, 'directory', statFn)) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: true,
      };
    }

    const configPath = join(current, PROJECT_CONFIG_FILE);
    if (await markerExists(configPath, 'file', statFn)) {
      return {
        hasFlavorConfigMarker: true,
        hasObsidianMarker: false,
        projectFlavor: await readProjectMarkdownFlavor(configPath, {
          readFileFn: options.readFileFn,
        }),
      };
    }

    if (searchBoundary !== undefined && resolve(current) === searchBoundary) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: false,
      };
    }

    const parent = dirname(current);
    if (parent === current) {
      return {
        hasFlavorConfigMarker: false,
        hasObsidianMarker: false,
      };
    }
    current = parent;
  }
}

export async function readProjectMarkdownFlavor(
  configPath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
  } = {},
): Promise<MarkdownFlavorSelection | undefined> {
  const content = options.readFileFn
    ? await readConfigWithInjectedReader(configPath, options.readFileFn)
    : await readConfigFromOpenFile(configPath);

  return content === undefined || hasDangerousTomlKey(content)
    ? undefined
    : parseProjectFlavor(content);
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
  let section = '';

  for (const rawLine of content.split(/\r?\n/)) {
    const line = stripInlineComment(rawLine).trim();
    if (line.length === 0) {
      continue;
    }

    const sectionMatch = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1] ?? '';
      continue;
    }

    const valueMatch = /^([A-Za-z0-9_.-]+)\s*=\s*"([^"]*)"\s*$/.exec(line);
    if (!valueMatch) {
      continue;
    }

    const fullKey = section.length > 0 ? `${section}.${valueMatch[1]}` : valueMatch[1];
    if (fullKey !== 'core.markdown.flavor') {
      continue;
    }

    return isMarkdownFlavorSelection(valueMatch[2]) ? valueMatch[2] : undefined;
  }

  return undefined;
}

function stripInlineComment(line: string): string {
  const hashIndex = line.indexOf('#');
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function hasDangerousTomlKey(content: string): boolean {
  return /(^|[\s.[{])(__proto__|constructor|prototype)(\s*=|\s*\]|\s*\.|\s*\})/.test(content);
}
