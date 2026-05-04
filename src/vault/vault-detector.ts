import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** The detection mode for a vault. */
export type VaultMode = 'obsidian' | 'flavor-grenade' | 'single-file';

/** Result returned by {@link VaultDetector.detect}. */
export interface VaultDetectionResult {
  /** Which kind of vault marker was found (or `'single-file'` if none). */
  mode: VaultMode;
  /** Absolute path to the vault root directory, or `null` for single-file mode. */
  vaultRoot: string | null;
}

/**
 * Detects the vault root by walking up the directory tree looking for
 * `.obsidian/` or `.flavor-grenade.toml` marker files.
 *
 * Detection precedence: `.obsidian/` beats `.flavor-grenade.toml` when both
 * are present at the same level.
 *
 * Result is cached after the first call.
 */
@Injectable()
export class VaultDetector {
  private cached: VaultDetectionResult | null = null;

  /**
   * Detect the vault mode starting at `startPath` and walking up the tree.
   *
   * @param startPath - Absolute path to start detection from (a file or dir).
   * @returns The detected {@link VaultDetectionResult}.
   */
  detect(startPath: string): VaultDetectionResult {
    if (this.cached !== null) {
      return this.cached;
    }

    const result = this.walk(startPath);
    this.cached = result;
    return result;
  }

  /**
   * Detect the vault mode without reading or mutating the process-wide cache.
   *
   * This is useful for per-document editor queries where each URI may live in
   * a different workspace folder from the root URI that initialized the server.
   */
  detectFresh(startPath: string): VaultDetectionResult {
    return this.walk(startPath);
  }

  private walk(startPath: string): VaultDetectionResult {
    let current = this.resolveDir(startPath);

    while (true) {
      const result = this.checkDir(current);
      if (result !== null) {
        return result;
      }

      const parent = path.dirname(current);
      if (parent === current) {
        // Reached filesystem root without finding a marker.
        return { mode: 'single-file', vaultRoot: null };
      }
      current = parent;
    }
  }

  private resolveDir(startPath: string): string {
    try {
      const stat = fs.statSync(startPath);
      return stat.isDirectory() ? startPath : path.dirname(startPath);
    } catch {
      return path.dirname(startPath);
    }
  }

  private checkDir(dir: string): VaultDetectionResult | null {
    const hasObsidian = this.isDir(path.join(dir, '.obsidian'));
    if (hasObsidian) {
      return { mode: 'obsidian', vaultRoot: dir };
    }

    const hasFg = this.isFile(path.join(dir, '.flavor-grenade.toml'));
    if (hasFg) {
      return { mode: 'flavor-grenade', vaultRoot: dir };
    }

    return null;
  }

  private isDir(p: string): boolean {
    try {
      return fs.statSync(p).isDirectory();
    } catch {
      return false;
    }
  }

  private isFile(p: string): boolean {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  }
}
