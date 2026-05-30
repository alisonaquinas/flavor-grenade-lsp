import * as fs from 'fs';
import * as path from 'path';
import type { MarkdownFlavorSelection } from './markdown-flavor-contract.js';
import { isMarkdownFlavorSelection } from './markdown-flavor-state.js';
import {
  isStructuredProfileSelection,
  type StructuredMarkdownProfileId,
  type StructuredProfileSelection,
} from './structured-profiles.js';
import {
  confineExistingPathToVaultRoot,
  confinePathToVaultRoot,
  resolveVaultRelativePath,
} from '../vault/vault-path-confinement.js';

const DEFAULT_FG_CONFIG_MAX_BYTES = 8192;
const DANGEROUS_ATTRIBUTE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export interface FgAttributes {
  flavor?: MarkdownFlavorSelection;
  structuredProfiles?: StructuredProfileSelection;
}

export interface FgConfigResolution {
  ignored: boolean;
  inactiveReason?: 'fgignore' | 'outside-vault';
  configFilesSeen: boolean;
  attributes: FgAttributes;
}

interface IgnoreRule {
  pattern: string;
  negated: boolean;
}

interface AttributeRule {
  pattern: string;
  negated: boolean;
  assignments: readonly AttributeAssignment[];
}

type AttributeAssignment =
  | { kind: 'set'; key: 'flavor'; value: MarkdownFlavorSelection }
  | { kind: 'set'; key: 'structuredProfiles'; value: StructuredProfileSelection }
  | { kind: 'reset'; key: 'flavor' | 'structuredProfiles' };

interface ConfigDirectory {
  directory: string;
  relativeTargetPath: string;
}

export class FlavorGrenadeConfigFiles {
  private maxConfigBytes = DEFAULT_FG_CONFIG_MAX_BYTES;

  setMaxConfigBytes(value: unknown): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this.maxConfigBytes = DEFAULT_FG_CONFIG_MAX_BYTES;
      return;
    }
    const normalized = Math.floor(value);
    this.maxConfigBytes = normalized > 0 ? normalized : DEFAULT_FG_CONFIG_MAX_BYTES;
  }

  resolveForFile(vaultRoot: string, resourcePath: string): FgConfigResolution {
    const confinedResource = confinePathToVaultRoot(vaultRoot, resourcePath);
    if (confinedResource === null) {
      return {
        ignored: true,
        inactiveReason: 'outside-vault',
        configFilesSeen: false,
        attributes: {},
      };
    }

    const directories = configDirectoriesFor(vaultRoot, confinedResource);
    let configFilesSeen = false;
    let ignored = false;
    const attributes: FgAttributes = {};

    for (const directory of directories) {
      const ignoreContent = this.readConfigIfPresent(vaultRoot, directory.directory, '.fgignore');
      if (ignoreContent !== undefined) {
        configFilesSeen = true;
        ignored = applyIgnoreRules(ignored, parseIgnoreRules(ignoreContent), directory);
      }

      const attributesContent = this.readConfigIfPresent(
        vaultRoot,
        directory.directory,
        '.fgattributes',
      );
      if (attributesContent !== undefined) {
        configFilesSeen = true;
        applyAttributeRules(attributes, parseAttributeRules(attributesContent), directory);
      }
    }

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

  private readConfigIfPresent(
    vaultRoot: string,
    directory: string,
    fileName: '.fgignore' | '.fgattributes',
  ): string | undefined {
    const candidate = configFilePath(vaultRoot, directory, fileName);
    if (candidate === null) {
      return undefined;
    }
    const confined = confineExistingPathToVaultRoot(vaultRoot, candidate);
    if (confined === null) {
      return undefined;
    }

    let fd: number | undefined;
    try {
      fd = fs.openSync(confined, 'r');
      const stat = fs.fstatSync(fd);
      if (!stat.isFile() || stat.size > this.maxConfigBytes) {
        return undefined;
      }
      const content = fs.readFileSync(fd, 'utf8');
      return Buffer.byteLength(content, 'utf8') > this.maxConfigBytes ? undefined : content;
    } catch {
      return undefined;
    } finally {
      if (fd !== undefined) {
        fs.closeSync(fd);
      }
    }
  }
}

function configDirectoriesFor(vaultRoot: string, resourcePath: string): ConfigDirectory[] {
  const relativeResource = toPosix(path.relative(vaultRoot, resourcePath));
  const resourceDirectory = path.dirname(resourcePath);
  const relativeDirectory = toPosix(path.relative(vaultRoot, resourceDirectory));
  const parts =
    relativeDirectory === '' || relativeDirectory === '.' ? [] : relativeDirectory.split('/');
  const result: ConfigDirectory[] = [];

  for (let index = 0; index <= parts.length; index += 1) {
    const relativeDir = parts.slice(0, index).join('/');
    const directory =
      relativeDir.length === 0 ? vaultRoot : resolveVaultRelativePath(vaultRoot, relativeDir);
    if (directory === null) {
      continue;
    }
    const relativeTargetPath =
      relativeDir.length === 0 ? relativeResource : toPosix(path.relative(directory, resourcePath));
    result.push({ directory, relativeTargetPath });
  }

  return result;
}

function configFilePath(
  vaultRoot: string,
  directory: string,
  fileName: '.fgignore' | '.fgattributes',
): string | null {
  const relativeDirectory = toPosix(path.relative(vaultRoot, directory));
  if (relativeDirectory === '' || relativeDirectory === '.') {
    return resolveVaultRelativePath(vaultRoot, fileName);
  }
  return resolveVaultRelativePath(vaultRoot, `${relativeDirectory}/${fileName}`);
}

function parseIgnoreRules(content: string): IgnoreRule[] {
  const rules: IgnoreRule[] = [];
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

function parseAttributeRules(content: string): AttributeRule[] {
  const rules: AttributeRule[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeConfigLine(rawLine);
    if (line.length === 0) {
      continue;
    }
    const tokens = splitConfigTokens(line);
    if (tokens.length < 2) {
      continue;
    }
    const rawPattern = tokens[0];
    const negated = rawPattern.startsWith('!');
    const pattern = unescapePattern(negated ? rawPattern.slice(1) : rawPattern);
    if (pattern.length === 0) {
      continue;
    }
    const assignments = tokens.slice(1).flatMap(parseAttributeToken);
    if (negated || assignments.length > 0) {
      rules.push({ pattern, negated, assignments });
    }
  }
  return rules;
}

function applyIgnoreRules(
  initialIgnored: boolean,
  rules: readonly IgnoreRule[],
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

function applyAttributeRules(
  attributes: FgAttributes,
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
        resetAttribute(attributes, assignment.key);
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
    const key = normalizeAttributeKey(resetMatch[1]);
    if (key === undefined) {
      return [];
    }
    return [
      {
        kind: 'reset',
        key,
      },
    ];
  }

  const [rawKey, ...rawValueParts] = token.split('=');
  const rawValue = rawValueParts.join('=');
  if (rawValueParts.length === 0 || DANGEROUS_ATTRIBUTE_KEYS.has(rawKey)) {
    return [];
  }
  const key = normalizeAttributeKey(rawKey);
  if (key === undefined) {
    return [];
  }
  if (key === 'flavor') {
    return isMarkdownFlavorSelection(rawValue) ? [{ kind: 'set', key, value: rawValue }] : [];
  }
  if (key === 'structuredProfiles') {
    const value = normalizeStructuredProfilesValue(rawValue);
    return value === undefined ? [] : [{ kind: 'set', key, value }];
  }
  return [];
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

function resetAttribute(attributes: FgAttributes, key: 'flavor' | 'structuredProfiles'): void {
  if (key === 'flavor') {
    delete attributes.flavor;
  } else {
    delete attributes.structuredProfiles;
  }
}

function normalizeStructuredProfilesValue(value: string): StructuredProfileSelection | undefined {
  if (value === 'auto' || value === 'none') {
    return value;
  }
  const profiles = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return isStructuredProfileSelection(profiles)
    ? (profiles as StructuredMarkdownProfileId[])
    : undefined;
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
