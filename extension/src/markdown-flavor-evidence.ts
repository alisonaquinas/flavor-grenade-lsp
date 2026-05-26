import { open, realpath, stat } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  FLAVOR_GRENADE_EDITORCONFIG_DIRECTIVE_PATTERN,
  FLAVOR_GRENADE_PROJECT_CONFIG_FILES,
} from './project-config-files.js';
import {
  isMarkdownFlavorSelection,
  isStructuredProfileSelection,
  type MarkdownFlavorSelection,
  type StructuredProfileSelection,
} from './markdown-flavor.js';

const DEFAULT_PROJECT_CONFIG_MAX_BYTES = 8192;
const DANGEROUS_KEY_PATTERN = /(^|[\s.[{])(__proto__|constructor|prototype)(\s*=|\s*\]|\s*\.|\s*\})/;

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
    projectConfigMaxBytes?: unknown;
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

    const configPath = await findProjectConfigPath(current, {
      readFileFn: options.readFileFn,
      realBoundary,
      realpathFn,
      statFn,
      projectConfigMaxBytes: options.projectConfigMaxBytes,
    });
    if (configPath) {
      const config = await readProjectMarkdownConfig(configPath, startPath, {
        readFileFn: options.readFileFn,
        projectConfigMaxBytes: options.projectConfigMaxBytes,
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
    projectConfigMaxBytes?: unknown;
  } = {},
): Promise<MarkdownFlavorSelection | undefined> {
  return (await readProjectMarkdownConfig(configPath, undefined, options)).projectFlavor;
}

async function readProjectMarkdownConfig(
  configPath: string,
  resourcePath: string | undefined,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
    projectConfigMaxBytes?: unknown;
  } = {},
): Promise<{
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
}> {
  const maxBytes = normalizeProjectConfigMaxBytes(options.projectConfigMaxBytes);
  const content = options.readFileFn
    ? await readConfigWithInjectedReader(configPath, options.readFileFn, maxBytes)
    : await readConfigFromOpenFile(configPath, maxBytes);

  if (content === undefined || hasDangerousTomlKey(content)) {
    return {};
  }

  const relativeResourcePath =
    resourcePath === undefined ? undefined : relative(dirname(configPath), resourcePath);
  return parseProjectMarkdownConfig(configPath, content, relativeResourcePath);
}

async function readConfigWithInjectedReader(
  configPath: string,
  readFileFn: ReadFileFn,
  maxBytes: number,
): Promise<string | undefined> {
  try {
    const content = await readFileFn(configPath, 'utf8');
    return Buffer.byteLength(content, 'utf8') > maxBytes ? undefined : content;
  } catch {
    return undefined;
  }
}

async function readConfigFromOpenFile(
  configPath: string,
  maxBytes: number,
): Promise<string | undefined> {
  let file: Awaited<ReturnType<typeof open>> | undefined;
  try {
    file = await open(configPath, 'r');
    const result = await file.stat();
    if (!result.isFile() || result.size > maxBytes) {
      return undefined;
    }

    const content = await file.readFile('utf8');
    return Buffer.byteLength(content, 'utf8') > maxBytes ? undefined : content;
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

async function findProjectConfigPath(
  dir: string,
  options: {
    readFileFn?: ReadFileFn;
    realBoundary?: string;
    realpathFn: RealpathFn;
    statFn: StatFn;
    projectConfigMaxBytes?: unknown;
  },
): Promise<string | undefined> {
  const maxBytes = normalizeProjectConfigMaxBytes(options.projectConfigMaxBytes);
  for (const marker of FLAVOR_GRENADE_PROJECT_CONFIG_FILES) {
    const markerPath = join(dir, marker);
    const exists =
      (await markerExists(markerPath, 'file', options.statFn)) &&
      (options.realBoundary === undefined ||
        (await realpathIsWithinOrEqual(markerPath, options.realBoundary, options.realpathFn)));
    if (!exists) {
      continue;
    }
    if (marker !== '.editorconfig') {
      return markerPath;
    }
    const content = options.readFileFn
      ? await readConfigWithInjectedReader(markerPath, options.readFileFn, maxBytes)
      : await readConfigFromOpenFile(markerPath, maxBytes);
    if (content !== undefined && FLAVOR_GRENADE_EDITORCONFIG_DIRECTIVE_PATTERN.test(content)) {
      return markerPath;
    }
  }
  return undefined;
}

function parseProjectMarkdownConfig(
  configPath: string,
  content: string,
  resourcePath: string | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  if (basename(configPath) === '.editorconfig') {
    return parseEditorConfig(content, resourcePath);
  }
  if (configPath.endsWith('.json') || configPath.endsWith('.jsonc')) {
    return parseObjectConfig(parseJsonLike(content, configPath.endsWith('.jsonc')), resourcePath);
  }
  if (configPath.endsWith('.yaml') || configPath.endsWith('.yml')) {
    return parseYamlConfig(content, resourcePath);
  }
  return parseTomlConfig(content, resourcePath);
}

function parseTomlConfig(
  content: string,
  resourcePath: string | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  const globalFlavor = parseTomlProjectMarkdownKey(content, 'flavor');
  const globalProfiles = parseTomlProjectMarkdownKey(content, 'structured_profiles');
  const global = {
    projectFlavor:
      typeof globalFlavor === 'string' && isMarkdownFlavorSelection(globalFlavor)
        ? globalFlavor
        : undefined,
    projectStructuredProfiles: isStructuredProfileSelection(globalProfiles)
      ? globalProfiles
      : undefined,
  };
  const override = mostSpecificOverride(parseTomlOverrides(content), resourcePath);
  return mergeOverride(global, override);
}

function parseTomlProjectMarkdownKey(
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

interface ProjectConfigOverride {
  path: string;
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
}

function parseTomlOverrides(content: string): ProjectConfigOverride[] {
  const overrides: ProjectConfigOverride[] = [];
  let current: Record<string, string | readonly string[]> | undefined;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = stripInlineComment(rawLine).trim();
    if (line.length === 0) {
      continue;
    }
    if (line === '[[core.markdown.overrides]]') {
      current = {};
      overrides.push(currentToOverride(current));
      continue;
    }
    if (!current) {
      continue;
    }
    const valueMatch = /^([A-Za-z0-9_.-]+)\s*=\s*(?:"([^"]*)"|\[([^\]]*)\])\s*$/.exec(line);
    if (!valueMatch) {
      continue;
    }
    current[valueMatch[1] ?? ''] =
      valueMatch[2] !== undefined ? valueMatch[2] : (parseStringArray(valueMatch[3] ?? '') ?? []);
    overrides[overrides.length - 1] = currentToOverride(current);
  }

  return overrides.filter((override) => override.path.length > 0);
}

function currentToOverride(raw: Record<string, string | readonly string[]>): ProjectConfigOverride {
  const flavor = raw.flavor;
  const profiles = raw.structured_profiles;
  return {
    path: typeof raw.path === 'string' ? raw.path : '',
    projectFlavor:
      typeof flavor === 'string' && isMarkdownFlavorSelection(flavor) ? flavor : undefined,
    projectStructuredProfiles: isStructuredProfileSelection(profiles) ? profiles : undefined,
  };
}

function parseObjectConfig(
  parsed: unknown,
  resourcePath: string | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  if (!isPlainRecord(parsed) || hasDangerousObjectKey(parsed)) {
    return {};
  }
  const markdown = getMarkdownObject(parsed);
  const global = configValuesFromRecord(markdown);
  const overrides = Array.isArray(markdown?.overrides)
    ? markdown.overrides.map(configValuesFromRecord).filter((override) => override.path.length > 0)
    : [];
  return mergeOverride(global, mostSpecificOverride(overrides, resourcePath));
}

function parseJsonLike(content: string, jsonc: boolean): unknown {
  try {
    return JSON.parse(jsonc ? stripJsonComments(content) : content);
  } catch {
    return undefined;
  }
}

function parseYamlConfig(
  content: string,
  resourcePath: string | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  const lines = content.split(/\r?\n/);
  let inMarkdown = false;
  let inOverrides = false;
  let currentOverride: Record<string, string | readonly string[]> | undefined;
  const markdown: Record<string, string | readonly string[]> = {};
  const overrides: ProjectConfigOverride[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+#.*$/, '');
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (/^markdown:\s*$/.test(trimmed)) {
      inMarkdown = true;
      inOverrides = false;
      continue;
    }
    if (!inMarkdown) {
      continue;
    }
    if (/^overrides:\s*$/.test(trimmed)) {
      inOverrides = true;
      continue;
    }
    if (inOverrides && /^-\s+/.test(trimmed)) {
      currentOverride = {};
      overrides.push(currentToOverride(currentOverride));
      applyYamlKeyValue(trimmed.slice(2), currentOverride);
      overrides[overrides.length - 1] = currentToOverride(currentOverride);
      continue;
    }
    if (inOverrides && currentOverride) {
      applyYamlKeyValue(trimmed, currentOverride);
      overrides[overrides.length - 1] = currentToOverride(currentOverride);
      continue;
    }
    applyYamlKeyValue(trimmed, markdown);
  }

  return mergeOverride(
    configValuesFromRecord(markdown),
    mostSpecificOverride(overrides.filter((override) => override.path.length > 0), resourcePath),
  );
}

function parseEditorConfig(
  content: string,
  resourcePath: string | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  const sections: ProjectConfigOverride[] = [];
  let current: ProjectConfigOverride | undefined;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }
    const section = /^\[([^\]]+)\]$/.exec(line);
    if (section) {
      current = { path: section[1] ?? '' };
      sections.push(current);
      continue;
    }
    if (!current) {
      continue;
    }
    const match = /^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/.exec(line);
    if (!match) {
      continue;
    }
    const key = (match[1] ?? '').toLowerCase();
    const value = (match[2] ?? '').trim();
    if (
      (key === 'flavor_grenade_markdown_flavor' ||
        key === 'flavor_grenade.markdown_flavor') &&
      isMarkdownFlavorSelection(value)
    ) {
      current.projectFlavor = value;
    }
    if (
      key === 'flavor_grenade_markdown_structured_profiles' ||
      key === 'flavor_grenade.markdown_structured_profiles'
    ) {
      const parsed = parseEditorConfigProfiles(value);
      if (isStructuredProfileSelection(parsed)) {
        current.projectStructuredProfiles = parsed;
      }
    }
  }

  return mergeOverride({}, mostSpecificOverride(sections, resourcePath));
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

function stripJsonComments(content: string): string {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasDangerousObjectKey(value: unknown): boolean {
  if (!isPlainRecord(value) && !Array.isArray(value)) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some(hasDangerousObjectKey);
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (hasDangerousObjectKey(child)) {
      return true;
    }
  }
  return false;
}

function getMarkdownObject(parsed: Record<string, unknown>): Record<string, unknown> | undefined {
  const core = parsed.core;
  if (!isPlainRecord(core)) {
    return undefined;
  }
  const markdown = core.markdown;
  return isPlainRecord(markdown) ? markdown : undefined;
}

function configValuesFromRecord(raw: unknown): ProjectConfigOverride {
  if (!isPlainRecord(raw)) {
    return { path: '' };
  }
  const pathValue = raw.path ?? raw.directory ?? raw.dir;
  const flavor = raw.flavor;
  const profiles = raw.structured_profiles ?? raw.structuredProfiles;
  return {
    path: typeof pathValue === 'string' ? pathValue : '',
    projectFlavor:
      typeof flavor === 'string' && isMarkdownFlavorSelection(flavor) ? flavor : undefined,
    projectStructuredProfiles: isStructuredProfileSelection(profiles) ? profiles : undefined,
  };
}

function applyYamlKeyValue(line: string, target: Record<string, string | readonly string[]>): void {
  const match = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/.exec(line);
  if (!match) {
    return;
  }
  const key = match[1] ?? '';
  const value = (match[2] ?? '').trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    target[key] = parseBareOrQuotedArray(value.slice(1, -1)) ?? [];
    return;
  }
  if (value.length > 0) {
    target[key] = unquote(value);
  }
}

function parseBareOrQuotedArray(value: string): readonly string[] | undefined {
  if (value.trim().length === 0) {
    return [];
  }
  return value.split(',').map((part) => unquote(part.trim())).filter(Boolean);
}

function parseEditorConfigProfiles(value: string): StructuredProfileSelection | undefined {
  if (value === 'none' || value === 'auto') {
    return value;
  }
  const parsed = parseBareOrQuotedArray(value);
  return isStructuredProfileSelection(parsed) ? parsed : undefined;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function mostSpecificOverride(
  overrides: readonly ProjectConfigOverride[],
  resourcePath: string | undefined,
): ProjectConfigOverride | undefined {
  if (!resourcePath) {
    return undefined;
  }
  const normalizedResource = resourcePath.replaceAll('\\', '/');
  return overrides
    .filter((override) => pathMatchesOverride(normalizedResource, override.path))
    .sort((left, right) => right.path.length - left.path.length)[0];
}

function pathMatchesOverride(resourcePath: string, overridePath: string): boolean {
  const normalized = normalizeConfigPath(overridePath);
  const normalizedResource = normalizeConfigPath(resourcePath);
  if (normalized.length === 0 || normalizedResource.startsWith('../')) {
    return false;
  }
  if (normalized.includes('*')) {
    if (!normalized.includes('/')) {
      const pathName = normalizedResource.split('/').at(-1) ?? '';
      return wildcardSegmentMatches(normalized, pathName);
    }
    return globPathMatches(normalized, normalizedResource);
  }
  return (
    normalizedResource === normalized ||
    normalizedResource.startsWith(`${normalized.replace(/\/$/, '')}/`)
  );
}

function normalizeConfigPath(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\/+/, '').replace(/^\.\//, '').replace(/\/$/, '');
}

function globPathMatches(pattern: string, relativePath: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = relativePath.split('/').filter(Boolean);
  return globPathPartsMatch(patternParts, pathParts, 0, 0);
}

function globPathPartsMatch(
  patternParts: readonly string[],
  pathParts: readonly string[],
  patternIndex: number,
  pathIndex: number,
): boolean {
  if (patternIndex === patternParts.length) {
    return pathIndex === pathParts.length;
  }
  const patternPart = patternParts[patternIndex];
  if (patternPart === '**') {
    for (let nextPathIndex = pathIndex; nextPathIndex <= pathParts.length; nextPathIndex += 1) {
      if (globPathPartsMatch(patternParts, pathParts, patternIndex + 1, nextPathIndex)) {
        return true;
      }
    }
    return false;
  }
  return (
    pathIndex < pathParts.length &&
    wildcardSegmentMatches(patternPart, pathParts[pathIndex]) &&
    globPathPartsMatch(patternParts, pathParts, patternIndex + 1, pathIndex + 1)
  );
}

function wildcardSegmentMatches(pattern: string, value: string): boolean {
  let patternIndex = 0;
  let valueIndex = 0;
  let starIndex = -1;
  let valueAfterStar = 0;

  while (valueIndex < value.length) {
    if (patternIndex < pattern.length && pattern[patternIndex] === value[valueIndex]) {
      patternIndex += 1;
      valueIndex += 1;
    } else if (patternIndex < pattern.length && pattern[patternIndex] === '*') {
      starIndex = patternIndex;
      valueAfterStar = valueIndex;
      patternIndex += 1;
    } else if (starIndex !== -1) {
      patternIndex = starIndex + 1;
      valueAfterStar += 1;
      valueIndex = valueAfterStar;
    } else {
      return false;
    }
  }

  while (patternIndex < pattern.length && pattern[patternIndex] === '*') {
    patternIndex += 1;
  }
  return patternIndex === pattern.length;
}

function normalizeProjectConfigMaxBytes(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_PROJECT_CONFIG_MAX_BYTES;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : DEFAULT_PROJECT_CONFIG_MAX_BYTES;
}

function mergeOverride(
  global: {
    projectFlavor?: MarkdownFlavorSelection;
    projectStructuredProfiles?: StructuredProfileSelection;
  },
  override: ProjectConfigOverride | undefined,
): {
  projectFlavor?: MarkdownFlavorSelection;
  projectStructuredProfiles?: StructuredProfileSelection;
} {
  return {
    projectFlavor: override?.projectFlavor ?? global.projectFlavor,
    projectStructuredProfiles:
      override?.projectStructuredProfiles ?? global.projectStructuredProfiles,
  };
}

function stripInlineComment(line: string): string {
  const hashIndex = line.indexOf('#');
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function hasDangerousTomlKey(content: string): boolean {
  return DANGEROUS_KEY_PATTERN.test(content);
}
