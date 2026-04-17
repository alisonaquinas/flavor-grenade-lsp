import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { type Ignore } from 'ignore';

/**
 * Filters vault-relative paths against `.gitignore` and `.ignore` pattern
 * files, plus the always-excluded `.obsidian/` prefix.
 *
 * Call {@link load} with the vault root before using {@link shouldIgnore}.
 */
@Injectable()
export class IgnoreFilter {
  private ig: Ignore = ignore();

  /**
   * Load ignore rules from `vaultRoot/.gitignore` and `vaultRoot/.ignore` if
   * they exist. Replaces any previously loaded rules.
   *
   * @param vaultRoot - Absolute path to the vault root directory.
   */
  load(vaultRoot: string): void {
    this.ig = ignore();
    this.addFileIfExists(vaultRoot, '.gitignore');
    this.addFileIfExists(vaultRoot, '.ignore');
  }

  /**
   * Returns `true` if the given vault-relative path should be excluded.
   *
   * Always excludes paths starting with `.obsidian` regardless of the
   * `.gitignore` / `.ignore` content (ADR013).
   *
   * @param vaultRelativePath - Path relative to the vault root, using `/` separators.
   */
  shouldIgnore(vaultRelativePath: string): boolean {
    if (this.isObsidianPath(vaultRelativePath)) {
      return true;
    }
    return this.ig.ignores(vaultRelativePath);
  }

  private isObsidianPath(p: string): boolean {
    return p === '.obsidian' || p.startsWith('.obsidian/') || p.startsWith('.obsidian\\');
  }

  private addFileIfExists(vaultRoot: string, filename: string): void {
    const filePath = path.join(vaultRoot, filename);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.ig.add(content);
    } catch {
      // File doesn't exist or can't be read — silently skip.
    }
  }
}
