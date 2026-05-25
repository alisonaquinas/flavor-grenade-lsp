import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { parse as parseJsonc, type ParseError } from 'jsonc-parser';
import { CORE_SCHEMA, load as yamlLoad } from 'js-yaml';
import type { MarkdownFlavorSelection } from './markdown-flavor-contract.js';
import { isMarkdownFlavorSelection } from './markdown-flavor-state.js';
import { PROJECT_MARKDOWN_CONFIG_FILES } from './project-markdown-config-files.js';
import {
  isStructuredProfileSelection,
  type StructuredProfileSelection,
} from './structured-profiles.js';
import {
  confineExistingPathToVaultRoot,
  resolveVaultRelativePath,
} from '../vault/vault-path-confinement.js';

const MAX_PROJECT_CONFIG_BYTES = 8192;
const DANGEROUS_CONFIG_KEY_PATTERN =
  /(^|[\s.[{,])"?(__proto__|constructor|prototype)"?(\s*:|\s*=|\s*\]|\s*\.|\s*\})/;

interface NormalizedProjectMarkdownConfig {
  flavor?: MarkdownFlavorSelection;
  structuredProfiles?: StructuredProfileSelection;
  overrides: ProjectMarkdownConfigOverride[];
}

interface ProjectMarkdownConfigOverride {
  path: string;
  flavor?: MarkdownFlavorSelection;
  structuredProfiles?: StructuredProfileSelection;
}

@Injectable()
/**
 * Reads project-level Markdown flavor evidence from Flavor Grenade config files.
 *
 * Supported files are `.flavor-grenade.toml`, `.flavor-grenade.json`,
 * `.flavor-grenade.jsonc`, `.flavor-grenade.yaml`, `.flavor-grenade.yml`, and
 * `.editorconfig`. Reads are confined to the vault root, size-capped, and
 * rejected when prototype-related keys are present.
 */
export class ProjectMarkdownFlavorConfig {
  /**
   * Resolve the project-configured Markdown flavor for a vault root/document.
   *
   * @param vaultRoot - Absolute vault root path, or `null` when no vault exists.
   * @param resourcePath - Optional absolute document path for directory overrides.
   * @returns A safe selector value when project config declares one.
   */
  resolveFlavor(
    vaultRoot: string | null,
    resourcePath?: string | null,
  ): MarkdownFlavorSelection | undefined {
    return this.resolveConfigValue(vaultRoot, resourcePath, (config) => config.flavor);
  }

  resolveStructuredProfiles(
    vaultRoot: string | null,
    resourcePath?: string | null,
  ): StructuredProfileSelection | undefined {
    return this.resolveConfigValue(vaultRoot, resourcePath, (config) => config.structuredProfiles);
  }

  private resolveConfigValue<T>(
    vaultRoot: string | null,
    resourcePath: string | null | undefined,
    selector: (config: NormalizedProjectMarkdownConfig) => T | undefined,
  ): T | undefined {
    if (vaultRoot === null) {
      return undefined;
    }

    const config = this.readProjectConfig(vaultRoot);
    if (config === undefined) {
      return undefined;
    }

    const relativePath = resourcePath ? toVaultRelativePath(vaultRoot, resourcePath) : undefined;
    return selector(applyBestOverride(config, relativePath));
  }

  private readProjectConfig(vaultRoot: string): NormalizedProjectMarkdownConfig | undefined {
    for (const fileName of PROJECT_MARKDOWN_CONFIG_FILES) {
      const candidateConfigPath = resolveVaultRelativePath(vaultRoot, fileName);
      if (candidateConfigPath === null) {
        continue;
      }

      const configPath = confineExistingPathToVaultRoot(vaultRoot, candidateConfigPath);
      if (configPath === null) {
        continue;
      }

      const content = this.readConfig(configPath);
      if (content === null || hasDangerousConfigKey(content)) {
        return undefined;
      }

      const parsed = parseConfigFile(fileName, content);
      if (parsed === undefined || hasDangerousObjectKey(parsed)) {
        return undefined;
      }
      return parsed;
    }
    return undefined;
  }

  private readConfig(configPath: string): string | null {
    let fd: number | undefined;
    try {
      fd = fs.openSync(configPath, 'r');
      const stat = fs.fstatSync(fd);
      if (!stat.isFile() || stat.size > MAX_PROJECT_CONFIG_BYTES) {
        return null;
      }
      const content = fs.readFileSync(fd, 'utf8');
      return Buffer.byteLength(content, 'utf8') > MAX_PROJECT_CONFIG_BYTES ? null : content;
    } catch {
      return null;
    } finally {
      if (fd !== undefined) {
        fs.closeSync(fd);
      }
    }
  }
}

function parseConfigFile(
  fileName: string,
  content: string,
): NormalizedProjectMarkdownConfig | undefined {
  if (fileName === '.editorconfig') {
    return parseEditorConfig(content);
  }
  if (fileName.endsWith('.jsonc')) {
    const errors: ParseError[] = [];
    const value = parseJsonc(content, errors);
    return errors.length === 0 ? normalizeProjectConfigObject(value) : undefined;
  }
  if (fileName.endsWith('.json')) {
    try {
      return normalizeProjectConfigObject(JSON.parse(content) as unknown);
    } catch {
      return undefined;
    }
  }
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
    try {
      return normalizeProjectConfigObject(yamlLoad(content, { schema: CORE_SCHEMA }));
    } catch {
      return undefined;
    }
  }
  return parseTomlConfig(content);
}

function normalizeProjectConfigObject(value: unknown): NormalizedProjectMarkdownConfig | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const markdown = getNestedRecord(value, ['core', 'markdown']);
  if (markdown === undefined) {
    return undefined;
  }

  return normalizeMarkdownRecord(markdown);
}

function normalizeMarkdownRecord(
  markdown: Record<string, unknown>,
): NormalizedProjectMarkdownConfig {
  const flavor = normalizeFlavor(markdown.flavor);
  const structuredProfiles = normalizeStructuredProfiles(
    markdown.structured_profiles ?? markdown.structuredProfiles,
  );
  const overrides = normalizeOverrides(markdown.overrides);
  return { flavor, structuredProfiles, overrides };
}

function normalizeOverrides(value: unknown): ProjectMarkdownConfigOverride[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const overrides: ProjectMarkdownConfigOverride[] = [];
  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }
    const rawPath = item.path ?? item.directory ?? item.dir;
    if (typeof rawPath !== 'string' || rawPath.trim().length === 0) {
      continue;
    }
    const flavor = normalizeFlavor(item.flavor);
    const structuredProfiles = normalizeStructuredProfiles(
      item.structured_profiles ?? item.structuredProfiles,
    );
    if (flavor === undefined && structuredProfiles === undefined) {
      continue;
    }
    overrides.push({
      path: normalizeConfigPath(rawPath),
      flavor,
      structuredProfiles,
    });
  }
  return overrides;
}

function parseTomlConfig(content: string): NormalizedProjectMarkdownConfig {
  const markdown: Record<string, unknown> = { overrides: [] };
  let target: Record<string, unknown> | undefined;
  const rawLines = content.split(/\r?\n/);

  for (let index = 0; index < rawLines.length; index += 1) {
    const line = stripInlineComment(rawLines[index]).trim();
    if (line.length === 0) {
      continue;
    }

    if (line === '[[core.markdown.overrides]]') {
      const override: Record<string, unknown> = {};
      (markdown.overrides as Record<string, unknown>[]).push(override);
      target = override;
      continue;
    }

    const sectionMatch = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line);
    if (sectionMatch) {
      target = sectionMatch[1] === 'core.markdown' ? markdown : undefined;
      continue;
    }

    const arrayStartMatch = /^([A-Za-z0-9_.-]+)\s*=\s*\[\s*$/.exec(line);
    if (arrayStartMatch) {
      const assignedTarget = resolveTomlAssignmentTarget(markdown, target, arrayStartMatch[1]);
      if (assignedTarget === undefined) {
        continue;
      }
      const arrayLines: string[] = [];
      for (index += 1; index < rawLines.length; index += 1) {
        const arrayLine = stripInlineComment(rawLines[index]).trim();
        if (arrayLine === ']') {
          assignedTarget.target[assignedTarget.key] = parseStringArray(arrayLines.join(','));
          break;
        }
        if (arrayLine.endsWith(']')) {
          arrayLines.push(arrayLine.slice(0, -1));
          assignedTarget.target[assignedTarget.key] = parseStringArray(arrayLines.join(','));
          break;
        }
        arrayLines.push(arrayLine);
      }
      continue;
    }

    const valueMatch = /^([A-Za-z0-9_.-]+)\s*=\s*(?:"([^"]*)"|\[([^\]]*)\])\s*$/.exec(line);
    if (!valueMatch) {
      continue;
    }
    const assignedTarget = resolveTomlAssignmentTarget(markdown, target, valueMatch[1]);
    if (assignedTarget === undefined) {
      continue;
    }
    assignedTarget.target[assignedTarget.key] =
      valueMatch[2] !== undefined ? valueMatch[2] : parseStringArray(valueMatch[3]);
  }

  return normalizeMarkdownRecord(markdown);
}

function resolveTomlAssignmentTarget(
  markdown: Record<string, unknown>,
  sectionTarget: Record<string, unknown> | undefined,
  rawKey: string,
): { target: Record<string, unknown>; key: string } | undefined {
  if (rawKey.startsWith('core.markdown.')) {
    return { target: markdown, key: rawKey.slice('core.markdown.'.length) };
  }
  if (sectionTarget !== undefined && !rawKey.includes('.')) {
    return { target: sectionTarget, key: rawKey };
  }
  return undefined;
}

function parseEditorConfig(content: string): NormalizedProjectMarkdownConfig {
  const config: NormalizedProjectMarkdownConfig = { overrides: [] };
  let section = '';
  let current: Record<string, string> = {};

  const flush = (): void => {
    if (section.length === 0 || Object.keys(current).length === 0) {
      current = {};
      return;
    }
    const flavor = normalizeFlavor(
      current.flavor_grenade_markdown_flavor ?? current['flavor_grenade.markdown_flavor'],
    );
    const structuredProfiles = normalizeStructuredProfilesFromEditorConfig(
      current.flavor_grenade_markdown_structured_profiles ??
        current['flavor_grenade.markdown_structured_profiles'],
    );
    if (flavor !== undefined || structuredProfiles !== undefined) {
      config.overrides.push({
        path: normalizeConfigPath(section),
        flavor,
        structuredProfiles,
      });
    }
    current = {};
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const line = stripEditorConfigComment(rawLine).trim();
    if (line.length === 0) {
      continue;
    }
    const sectionMatch = /^\[([^\]]+)\]$/.exec(line);
    if (sectionMatch) {
      flush();
      section = sectionMatch[1];
      continue;
    }
    const entryMatch = /^([^=:\s]+)\s*[=:]\s*(.*?)\s*$/.exec(line);
    if (entryMatch) {
      current[entryMatch[1].toLowerCase()] = entryMatch[2];
    }
  }
  flush();
  return config;
}

function normalizeFlavor(value: unknown): MarkdownFlavorSelection | undefined {
  return isMarkdownFlavorSelection(value) ? value : undefined;
}

function normalizeStructuredProfiles(value: unknown): StructuredProfileSelection | undefined {
  return isStructuredProfileSelection(value) ? value : undefined;
}

function normalizeStructuredProfilesFromEditorConfig(
  value: string | undefined,
): StructuredProfileSelection | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed === 'auto' || trimmed === 'none') {
    return trimmed;
  }
  const parsed = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return isStructuredProfileSelection(parsed) ? parsed : undefined;
}

function applyBestOverride(
  config: NormalizedProjectMarkdownConfig,
  relativePath: string | undefined,
): NormalizedProjectMarkdownConfig {
  if (relativePath === undefined) {
    return config;
  }

  let best: ProjectMarkdownConfigOverride | undefined;
  for (const override of config.overrides) {
    if (!configPathMatches(override.path, relativePath)) {
      continue;
    }
    if (best === undefined || override.path.length >= best.path.length) {
      best = override;
    }
  }
  if (best === undefined) {
    return config;
  }
  return {
    flavor: best.flavor ?? config.flavor,
    structuredProfiles: best.structuredProfiles ?? config.structuredProfiles,
    overrides: config.overrides,
  };
}

function configPathMatches(pattern: string, relativePath: string): boolean {
  const normalizedPattern = normalizeConfigPath(pattern);
  const normalizedPath = normalizeConfigPath(relativePath);
  if (normalizedPattern.includes('*')) {
    return globPatternMatches(normalizedPattern, normalizedPath);
  }
  return (
    normalizedPath === normalizedPattern ||
    normalizedPath.startsWith(`${normalizedPattern.replace(/\/$/, '')}/`)
  );
}

function globPatternMatches(pattern: string, relativePath: string): boolean {
  const patternForRegex = pattern.startsWith('/') ? pattern.slice(1) : pattern;
  const pathForRegex = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  let source = '';
  for (let index = 0; index < patternForRegex.length; index += 1) {
    const char = patternForRegex[index];
    if (char === '*' && patternForRegex[index + 1] === '*') {
      if (patternForRegex[index + 2] === '/') {
        source += '(?:.*/)?';
        index += 2;
      } else {
        source += '.*';
        index += 1;
      }
      continue;
    }
    source += char === '*' ? '[^/]*' : escapeRegex(char);
  }
  return new RegExp(`^${source}$`).test(pathForRegex);
}

function toVaultRelativePath(vaultRoot: string, resourcePath: string): string | undefined {
  const absoluteRoot = path.resolve(vaultRoot);
  const absoluteResource = path.resolve(resourcePath);
  const relative = path.relative(absoluteRoot, absoluteResource);
  if (relative.length === 0 || relative.startsWith('..') || path.isAbsolute(relative)) {
    return undefined;
  }
  return normalizeConfigPath(relative);
}

function normalizeConfigPath(value: string): string {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/\/+$/, '');
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

function getNestedRecord(
  value: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | undefined {
  let current: unknown = value;
  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[key];
  }
  return isRecord(current) ? current : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stripInlineComment(line: string): string {
  const hashIndex = line.indexOf('#');
  return hashIndex === -1 ? line : line.slice(0, hashIndex);
}

function stripEditorConfigComment(line: string): string {
  const hashIndex = line.indexOf('#');
  const semicolonIndex = line.indexOf(';');
  const indexes = [hashIndex, semicolonIndex].filter((index) => index >= 0);
  return indexes.length === 0 ? line : line.slice(0, Math.min(...indexes));
}

function escapeRegex(char: string): string {
  return /[\\^$+?.()|[\]{}]/.test(char) ? `\\${char}` : char;
}

function hasDangerousConfigKey(content: string): boolean {
  return DANGEROUS_CONFIG_KEY_PATTERN.test(content);
}

function hasDangerousObjectKey(value: unknown): boolean {
  const stack: unknown[] = [value];
  let visited = 0;
  while (stack.length > 0) {
    const current = stack.pop();
    visited += 1;
    if (visited > 10_000) {
      return true;
    }
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }
    if (!isRecord(current)) {
      continue;
    }
    for (const key of Object.keys(current)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return true;
      }
      stack.push(current[key]);
    }
  }
  return false;
}
