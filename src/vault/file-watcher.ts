import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { VaultIndex } from './vault-index.js';
import { FolderLookup } from './folder-lookup.js';
import { IgnoreFilter } from './ignore-filter.js';
import { toDocId } from './doc-id.js';
import { OFMParser } from '../parser/ofm-parser.js';

/**
 * Watches the vault root directory for filesystem changes and keeps the
 * {@link VaultIndex} and {@link FolderLookup} up to date.
 *
 * Uses `fs.watch` with `recursive: true` for cross-platform support.
 * All events outside the vault root are silently ignored (ADR013).
 */
@Injectable()
export class FileWatcher {
  private watcher: fs.FSWatcher | null = null;
  private resolvedRoot = '';

  constructor(
    private readonly vaultIndex: VaultIndex,
    private readonly folderLookup: FolderLookup,
    private readonly ignoreFilter: IgnoreFilter,
    private readonly ofmParser: OFMParser,
  ) {}

  /**
   * Start watching `vaultRoot` for changes.
   *
   * @param vaultRoot - Absolute path to the vault root directory.
   */
  start(vaultRoot: string): void {
    this.resolvedRoot = path.resolve(vaultRoot);
    this.watcher = fs.watch(
      this.resolvedRoot,
      { recursive: true },
      (eventType, filename) => {
        if (filename === null) return;
        void this.handleEvent(eventType, filename);
      },
    );
  }

  /** Stop the filesystem watcher. */
  stop(): void {
    if (this.watcher !== null) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private async handleEvent(eventType: string, filename: string): Promise<void> {
    const absPath = path.resolve(this.resolvedRoot, filename);

    // ADR013: confine all access to vault root.
    const rootWithSep = this.resolvedRoot.endsWith(path.sep)
      ? this.resolvedRoot
      : `${this.resolvedRoot}${path.sep}`;
    if (!absPath.startsWith(rootWithSep)) {
      return;
    }

    if (!absPath.endsWith('.md')) {
      return;
    }

    const relPath = path.relative(this.resolvedRoot, absPath).split(path.sep).join('/');
    if (this.ignoreFilter.shouldIgnore(relPath)) {
      return;
    }

    if (eventType === 'rename') {
      const exists = await this.fileExists(absPath);
      if (exists) {
        await this.upsertFile(absPath);
      } else {
        this.deleteFile(absPath);
      }
    } else {
      await this.upsertFile(absPath);
    }
  }

  private async upsertFile(absPath: string): Promise<void> {
    try {
      const text = await fs.promises.readFile(absPath, 'utf8');
      const uri = `file://${absPath.split(path.sep).join('/')}`;
      const doc = this.ofmParser.parse(uri, text, 0);
      const id = toDocId(this.resolvedRoot, absPath);
      this.vaultIndex.set(id, doc);
      this.folderLookup.rebuild(this.vaultIndex);
    } catch {
      // Skip unreadable files.
    }
  }

  private deleteFile(absPath: string): void {
    const id = toDocId(this.resolvedRoot, absPath);
    this.vaultIndex.delete(id);
    this.folderLookup.rebuild(this.vaultIndex);
  }

  private async fileExists(absPath: string): Promise<boolean> {
    try {
      await fs.promises.stat(absPath);
      return true;
    } catch {
      return false;
    }
  }
}
