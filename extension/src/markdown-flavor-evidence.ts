import { open, realpath, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import {
  isMarkdownFlavorSelection,
  isStructuredProfileSelection,
  type MarkdownFlavorSelection,
  type StructuredProfileSelection,
} from './markdown-flavor.js';

const DEFAULT_FG_CONFIG_MAX_BYTES = 8192;

type StatFn = typeof stat;
type RealpathFn = (path: string) => Promise<string>;
type ReadFileFn = (path: string, encoding: 'utf8') => Promise<string>;

interface ConfigDirectory {
  directory: string;
  relativeTargetPath: string;
}

interface AttributeRule {
  pattern: string;
  negated: boolean;
  assignments: AttributeAssignment[];
}

type AttributeAssignment =
  | { kind: 'reset'; key: 'flavor' | 'structuredProfiles' }
  | { kind: 'set'; key: 'flavor'; value: MarkdownFlavorSelection }
  | { kind: 'set'; key: 'structuredProfiles'; value: StructuredProfileSelection };

export interface MarkdownFlavorEvidence {
  hasFlavorConfigMarker: boolean;
  hasObsidianMarker: boolean;
  ignored?: boolean;
  fgAttributesFlavor?: MarkdownFlavorSelection;
  fgAttributesStructuredProfiles?: StructuredProfileSelection;
}

export async function findMarkdownFlavorEvidence(
  filePath: string,
  options: {
    readFileFn?: ReadFileFn;
    realpathFn?: RealpathFn;
    searchBoundary?: string;
    statFn?: StatFn;
    fgConfigMaxBytes?: unknown;
  } = {},
): Promise<MarkdownFlavorEvidence> {
  const statFn = options.statFn ?? stat;
  const realpathFn = options.realpathFn ?? ((path: string) => realpath(path));
  const searchBoundary = options.searchBoundary ? resolve(options.searchBoundary) : undefined;
  const startPath = resolve(filePath);
  if (searchBoundary !== undefined && !isPathWithinOrEqual(startPath, searchBoundary)) {
    return emptyEvidence();
  }

  const realBoundary =
    searchBoundary === undefined ? undefined : await realpathOrUndefined(searchBoundary, realpathFn);
  if (searchBoundary !== undefined && realBoundary === undefined) {
    return emptyEvidence();
  }
  const realStart =
    realBoundary === undefined ? undefined : await realpathOrUndefined(startPath, realpathFn);
  if (
    realBoundary !== undefined &&
    (realStart === undefined || !isPathWithinOrEqual(realStart, realBoundary))
  ) {
    return emptyEvidence();
  }

  const directories = await configDirectoriesForFile(startPath, {
    realBoundary,
    searchBoundary,
    statFn,
  });
  let hasFlavorConfigMarker = false;
  let hasObsidianMarker = false;
  let ignored = false;
  const attributes: {
    flavor?: MarkdownFlavorSelection;
    structuredProfiles?: StructuredProfileSelection;
  } = {};

  for (const directory of directories) {
    hasObsidianMarker ||= await markerExists(join(directory.directory, '.obsidian'), 'directory', statFn);
    hasFlavorConfigMarker ||=
      (await markerExists(join(directory.directory, '.fgignore'), 'file', statFn)) ||
      (await markerExists(join(directory.directory, '.fgattributes'), 'file', statFn));

    const ignoreContent = await readConfigIfPresent(join(directory.directory, '.fgignore'), {
      readFileFn: options.readFileFn,
      fgConfigMaxBytes: options.fgConfigMaxBytes,
      statFn,
    });
    if (ignoreContent !== undefined) {
      ignored = applyIgnoreRules(ignored, parseIgnoreRules(ignoreContent), directory);
    }

    const content = await readConfigIfPresent(join(directory.directory, '.fgattributes'), {
      readFileFn: options.readFileFn,
      fgConfigMaxBytes: options.fgConfigMaxBytes,
      statFn,
    });
    if (content !== undefined) {
      applyAttributeRules(attributes, parseAttributeRules(content), directory);
    }
  }

  return buildEvidence({ hasFlavorConfigMarker, hasObsidianMarker, ignored, attributes });
}

function parseIgnoreRules(content: string): Array<{ pattern: string; negated: boolean }> {
  const rules: Array<{ pattern: string; negated: boolean }> = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) {
      continue;
    }
    const negated = line.startsWith('!');
    const pattern = unescapePattern(negated ? line.slice(1) : line);
    if (pattern.length > 0) {
      rules.push({ pattern, negated });
    }
  }
  return rules;
}

function applyIgnoreRules(
  initialIgnored: boolean,
  rules: readonly { pattern: string; negated: boolean }[],
  directory: ConfigDirectory,
): boolean {
  let ignored = initialIgnored;
  for (const rule of rules) {
    if (patternMatches(rule.pattern, directory.relativeTargetPath)) {
      ignored = !rule.negated;
    }
  }
  return ignored;
}

function buildEvidence(input: {
  hasFlavorConfigMarker: boolean;
  hasObsidianMarker: boolean;
  ignored: boolean;
  attributes: {
    flavor?: MarkdownFlavorSelection;
    structuredProfiles?: StructuredProfileSelection;
  };
}): MarkdownFlavorEvidence {
  return {
    hasFlavorConfigMarker: input.hasFlavorConfigMarker,
    hasObsidianMarker: input.hasObsidianMarker,
    ...(input.ignored && { ignored: true }),
    ...(!input.ignored &&
      input.attributes.flavor !== undefined && { fgAttributesFlavor: input.attributes.flavor }),
    ...(!input.ignored &&
      input.attributes.structuredProfiles !== undefined && {
        fgAttributesStructuredProfiles: input.attributes.structuredProfiles,
      }),
  };
}

export async function readFgAttributesMarkdownFlavor(
  configPath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
    fgConfigMaxBytes?: unknown;
  } = {},
): Promise<MarkdownFlavorSelection | undefined> {
  const content = await readConfigIfPresent(configPath, options);
  if (content === undefined) {
    return undefined;
  }
  const attributes: { flavor?: MarkdownFlavorSelection } = {};
  applyAttributeRules(
    attributes,
    parseAttributeRules(content),
    { directory: dirname(configPath), relativeTargetPath: '' },
  );
  return attributes.flavor;
}

async function configDirectoriesForFile(
  filePath: string,
  options: {
    realBoundary?: string;
    searchBoundary?: string;
    statFn: StatFn;
  },
): Promise<ConfigDirectory[]> {
  const leaf = dirname(filePath);
  const directories: string[] = [];
  let current = leaf;

  while (true) {
    directories.push(current);
    if (options.searchBoundary !== undefined && resolve(current) === options.searchBoundary) {
      break;
    }
    if (
      options.searchBoundary === undefined &&
      (await markerExists(join(current, '.obsidian'), 'directory', options.statFn))
    ) {
      break;
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return directories.reverse().map((directory) => ({
    directory,
    relativeTargetPath: toPosix(relative(directory, filePath)),
  }));
}

async function readConfigIfPresent(
  configPath: string,
  options: {
    readFileFn?: ReadFileFn;
    statFn?: StatFn;
    fgConfigMaxBytes?: unknown;
  },
): Promise<string | undefined> {
  const maxBytes = normalizeFgConfigMaxBytes(options.fgConfigMaxBytes);
  if (options.readFileFn) {
    try {
      const content = await options.readFileFn(configPath, 'utf8');
      return Buffer.byteLength(content, 'utf8') > maxBytes ? undefined : content;
    } catch {
      return undefined;
    }
  }

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

function parseAttributeRules(content: string): AttributeRule[] {
  const rules: AttributeRule[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) {
      continue;
    }
    const tokens = splitConfigTokens(line);
    if (tokens.length < 1) {
      continue;
    }
    const rawPattern = tokens[0] ?? '';
    const negated = rawPattern.startsWith('!');
    const pattern = unescapePattern(negated ? rawPattern.slice(1) : rawPattern);
    const assignments = tokens.slice(1).flatMap(parseAttributeToken);
    if (pattern.length > 0 && (negated || assignments.length > 0)) {
      rules.push({ pattern, negated, assignments });
    }
  }
  return rules;
}

function applyAttributeRules(
  attributes: {
    flavor?: MarkdownFlavorSelection;
    structuredProfiles?: StructuredProfileSelection;
  },
  rules: readonly AttributeRule[],
  directory: ConfigDirectory,
): void {
  for (const rule of rules) {
    if (!patternMatches(rule.pattern, directory.relativeTargetPath)) {
      continue;
    }
    if (rule.negated) {
      delete attributes.flavor;
      delete attributes.structuredProfiles;
      continue;
    }
    for (const assignment of rule.assignments) {
      if (assignment.kind === 'reset') {
        delete attributes[assignment.key];
      } else if (assignment.key === 'flavor') {
        attributes.flavor = assignment.value;
      } else {
        attributes.structuredProfiles = assignment.value;
      }
    }
  }
}

function parseAttributeToken(token: string): AttributeAssignment[] {
  const resetMatch = /^!(flavor|structured_profiles|structuredProfiles)$/.exec(token);
  if (resetMatch) {
    const key = normalizeAttributeKey(resetMatch[1] ?? '');
    return key === undefined ? [] : [{ kind: 'reset', key }];
  }

  const [rawKey, ...rawValueParts] = token.split('=');
  if (rawValueParts.length === 0) {
    return [];
  }
  const key = normalizeAttributeKey(rawKey);
  if (key === undefined) {
    return [];
  }
  const rawValue = rawValueParts.join('=');
  if (key === 'flavor') {
    return isMarkdownFlavorSelection(rawValue) ? [{ kind: 'set', key, value: rawValue }] : [];
  }
  const value = normalizeStructuredProfilesValue(rawValue);
  return value === undefined ? [] : [{ kind: 'set', key, value }];
}

function normalizeAttributeKey(value: string): 'flavor' | 'structuredProfiles' | undefined {
  if (value === 'flavor') {
    return 'flavor';
  }
  if (value === 'structured_profiles' || value === 'structuredProfiles') {
    return 'structuredProfiles';
  }
  return undefined;
}

function normalizeStructuredProfilesValue(value: string): StructuredProfileSelection | undefined {
  if (value === 'auto' || value === 'none') {
    return value;
  }
  const profiles = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return isStructuredProfileSelection(profiles) ? profiles : undefined;
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

function patternMatches(rawPattern: string, rawRelativePath: string): boolean {
  const pattern = normalizePattern(rawPattern);
  const relativePath = trimSlashes(toPosix(rawRelativePath));
  if (pattern.length === 0 || relativePath.length === 0) {
    return false;
  }

  const anchored = pattern.startsWith('/');
  const directoryOnly = pattern.endsWith('/');
  const normalizedPattern = trimSlashes(pattern);
  const candidatePattern = directoryOnly ? `${normalizedPattern}/**` : normalizedPattern;
  if (anchored || candidatePattern.includes('/')) {
    return globPatternMatches(candidatePattern, relativePath);
  }
  return relativePath
    .split('/')
    .some((segment) => wildcardSegmentMatches(candidatePattern, segment));
}

function globPatternMatches(pattern: string, relativePath: string): boolean {
  const patternParts = trimSlashes(pattern).split('/');
  const pathParts = trimSlashes(relativePath).split('/');
  return globSegmentsMatch(patternParts, pathParts, 0, 0);
}

function globSegmentsMatch(
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
      if (globSegmentsMatch(patternParts, pathParts, patternIndex + 1, nextPathIndex)) {
        return true;
      }
    }
    return false;
  }
  return (
    pathIndex < pathParts.length &&
    wildcardSegmentMatches(patternPart, pathParts[pathIndex]) &&
    globSegmentsMatch(patternParts, pathParts, patternIndex + 1, pathIndex + 1)
  );
}

function wildcardSegmentMatches(pattern: string, value: string): boolean {
  let patternIndex = 0;
  let valueIndex = 0;
  let starIndex = -1;
  let valueAfterStar = 0;

  while (valueIndex < value.length) {
    if (
      patternIndex < pattern.length &&
      (pattern[patternIndex] === '?' || pattern[patternIndex] === value[valueIndex])
    ) {
      patternIndex += 1;
      valueIndex += 1;
      continue;
    }
    if (patternIndex < pattern.length && pattern[patternIndex] === '*') {
      starIndex = patternIndex;
      patternIndex += 1;
      valueAfterStar = valueIndex;
      continue;
    }
    if (starIndex !== -1) {
      patternIndex = starIndex + 1;
      valueAfterStar += 1;
      valueIndex = valueAfterStar;
      continue;
    }
    return false;
  }

  while (patternIndex < pattern.length && pattern[patternIndex] === '*') {
    patternIndex += 1;
  }
  return patternIndex === pattern.length;
}

function normalizeConfigLine(rawLine: string): string {
  const trimmedRight = rawLine.replace(/\s+$/u, '');
  if (/^\s*(#|$)/.test(trimmedRight)) {
    return '';
  }
  return trimmedRight.trimStart();
}

function splitConfigTokens(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let escaped = false;
  for (const char of line) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (/\s/u.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += char;
  }
  if (escaped) {
    current += '\\';
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

function normalizePattern(value: string): string {
  return unescapePattern(toPosix(value.trim()));
}

function unescapePattern(value: string): string {
  return value.replace(/\\([#! ])/g, '$1');
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function toPosix(value: string): string {
  return value.replace(/\\/g, '/');
}

function isPathWithinOrEqual(childPath: string, parentPath: string): boolean {
  const relativePath = relative(parentPath, childPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
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

function normalizeFgConfigMaxBytes(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_FG_CONFIG_MAX_BYTES;
  }
  const normalized = Math.floor(value);
  return normalized > 0 ? normalized : DEFAULT_FG_CONFIG_MAX_BYTES;
}

function emptyEvidence(): MarkdownFlavorEvidence {
  return {
    hasFlavorConfigMarker: false,
    hasObsidianMarker: false,
  };
}
