import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import type { MarkdownFlavorSelection } from './markdown-flavor-contract.js';
import { isMarkdownFlavorSelection } from './markdown-flavor-state.js';
import {
  isStructuredProfileSelection,
  type StructuredProfileSelection,
} from './structured-profiles.js';
import {
  confineExistingPathToVaultRoot,
  resolveVaultRelativePath,
} from '../vault/vault-path-confinement.js';

const PROJECT_CONFIG_FILE = '.flavor-grenade.toml';
const MAX_PROJECT_CONFIG_BYTES = 8192;

@Injectable()
/**
 * Reads project-level Markdown flavor evidence from `.flavor-grenade.toml`.
 *
 * Reads are confined to the vault root, capped at a small byte budget, and
 * ignored when the file contains prototype-related TOML keys.
 */
export class ProjectMarkdownFlavorConfig {
  /**
   * Resolve the project-configured Markdown flavor for a vault root.
   *
   * @param vaultRoot - Absolute vault root path, or `null` when no vault exists.
   * @returns A safe selector value when project config declares one.
   */
  resolveFlavor(vaultRoot: string | null): MarkdownFlavorSelection | undefined {
    return this.resolveConfigValue(vaultRoot, parseProjectFlavor);
  }

  resolveStructuredProfiles(vaultRoot: string | null): StructuredProfileSelection | undefined {
    return this.resolveConfigValue(vaultRoot, parseProjectStructuredProfiles);
  }

  private resolveConfigValue<T>(
    vaultRoot: string | null,
    parser: (content: string) => T | undefined,
  ): T | undefined {
    if (vaultRoot === null) {
      return undefined;
    }

    const candidateConfigPath = resolveVaultRelativePath(vaultRoot, PROJECT_CONFIG_FILE);
    if (candidateConfigPath === null) {
      return undefined;
    }

    const configPath = confineExistingPathToVaultRoot(vaultRoot, candidateConfigPath);
    if (configPath === null) {
      return undefined;
    }
    const content = this.readConfig(configPath);
    if (content === null || hasDangerousTomlKey(content)) {
      return undefined;
    }
    return parser(content);
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
    const rawLine = rawLines[index];
    const line = stripInlineComment(rawLine).trim();
    if (line.length === 0) {
      continue;
    }

    const sectionMatch = /^\[([A-Za-z0-9_.-]+)\]$/.exec(line);
    if (sectionMatch) {
      section = sectionMatch[1];
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
        const arrayLine = stripInlineComment(rawLines[index]).trim();
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
    return parseStringArray(valueMatch[3]);
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
