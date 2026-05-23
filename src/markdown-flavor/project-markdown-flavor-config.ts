import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import type { MarkdownFlavorSelection } from './markdown-flavor-contract.js';
import { isMarkdownFlavorSelection } from './markdown-flavor-state.js';
import {
  confineExistingPathToVaultRoot,
  resolveVaultRelativePath,
} from '../vault/vault-path-confinement.js';

const PROJECT_CONFIG_FILE = '.flavor-grenade.toml';
const MAX_PROJECT_CONFIG_BYTES = 8192;

@Injectable()
export class ProjectMarkdownFlavorConfig {
  resolveFlavor(vaultRoot: string | null): MarkdownFlavorSelection | undefined {
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
    return parseProjectFlavor(content);
  }

  private readConfig(configPath: string): string | null {
    try {
      const stat = fs.statSync(configPath);
      if (!stat.isFile() || stat.size > MAX_PROJECT_CONFIG_BYTES) {
        return null;
      }
      return fs.readFileSync(configPath, 'utf8');
    } catch {
      return null;
    }
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
      section = sectionMatch[1];
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
