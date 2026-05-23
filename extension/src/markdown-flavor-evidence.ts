import { readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { isMarkdownFlavorSelection, type MarkdownFlavorSelection } from './markdown-flavor.js';

const PROJECT_CONFIG_FILE = '.flavor-grenade.toml';
const MAX_PROJECT_CONFIG_BYTES = 8192;

type StatFn = typeof stat;
type ReadFileFn = typeof readFile;

export interface MarkdownFlavorEvidence {
  hasFlavorConfigMarker: boolean;
  hasObsidianMarker: boolean;
  projectFlavor?: MarkdownFlavorSelection;
}

export async function findMarkdownFlavorEvidence(
  filePath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
  } = {},
): Promise<MarkdownFlavorEvidence> {
  const statFn = options.statFn ?? stat;
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
          statFn,
        }),
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
  const statFn = options.statFn ?? stat;
  let size = 0;
  try {
    const result = await statFn(configPath);
    if (!result.isFile() || result.size > MAX_PROJECT_CONFIG_BYTES) {
      return undefined;
    }
    size = result.size;
  } catch {
    return undefined;
  }

  const readFileFn = options.readFileFn ?? readFile;
  const content = await readFileFn(configPath, 'utf8');
  if (size > MAX_PROJECT_CONFIG_BYTES || hasDangerousTomlKey(content)) {
    return undefined;
  }
  return parseProjectFlavor(content);
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
