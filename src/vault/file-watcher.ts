import 'reflect-metadata';
import { Injectable, Optional } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { VaultIndex } from './vault-index.js';
import { FolderLookup } from './folder-lookup.js';
import { IgnoreFilter } from './ignore-filter.js';
import { VaultScanner } from './vault-scanner.js';
import { toDocId } from './doc-id.js';
import { buildAttachmentEntry } from './attachment-metadata.js';
import { normalizeAbsolutePath, resolveVaultRelativePath } from './vault-path-confinement.js';
import { OFMParser } from '../parser/ofm-parser.js';
import { TagRegistry } from '../tags/tag-registry.js';
import { MarkdownFlavorState } from '../markdown-flavor/markdown-flavor-state.js';
import { FlavorGrenadeConfigFiles } from '../markdown-flavor/fg-config-files.js';
import type { ParseContext } from '../parser/types.js';

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
    private readonly tagRegistry: TagRegistry,
    private readonly vaultScanner: VaultScanner,
    @Optional() private readonly flavorState: MarkdownFlavorState | null = null,
    @Optional() private readonly fgConfigFiles: FlavorGrenadeConfigFiles | null = null,
  ) {}

  /**
   * Start watching `vaultRoot` for changes.
   *
   * @param vaultRoot - Absolute path to the vault root directory.
   */
  start(vaultRoot: string): void {
    const resolvedRoot = normalizeAbsolutePath(vaultRoot);
    if (resolvedRoot === null) {
      throw new Error('Vault root must be an absolute filesystem path.');
    }

    this.resolvedRoot = resolvedRoot;
    this.watcher = fs.watch(this.resolvedRoot, { recursive: true }, (eventType, filename) => {
      void this.handleEvent(eventType, filename);
    });
  }

  /** Stop the filesystem watcher. */
  stop(): void {
    if (this.watcher !== null) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  private async handleEvent(eventType: string, filename: string | null): Promise<void> {
    if (filename === null) return;

    // ADR013: confine all access to vault root.
    const absPath = resolveVaultRelativePath(this.resolvedRoot, filename);
    if (absPath === null) {
      return;
    }

    const relPath = path.relative(this.resolvedRoot, absPath).split(path.sep).join('/');
    if (this.ignoreFilter.shouldIgnore(relPath)) {
      return;
    }

    if (isFlavorGrenadeConfigFile(relPath)) {
      await this.rescanVault();
      return;
    }

    if (!absPath.endsWith('.md')) {
      // Track non-markdown files in the asset index.
      if (eventType === 'rename') {
        const stat = await this.fileStat(absPath);
        if (stat !== null && !this.isFgIgnored(absPath)) {
          this.vaultScanner.getAssetIndex().add(relPath);
          this.vaultIndex.setAttachment(await buildAttachmentEntry(absPath, relPath, stat));
        } else {
          this.vaultScanner.getAssetIndex().delete(relPath);
          this.vaultIndex.deleteAttachment(relPath);
        }
      }
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
      if (this.isFgIgnored(absPath)) {
        this.deleteFile(absPath);
        return;
      }
      const text = await fs.promises.readFile(absPath, 'utf8');
      const uri = pathToFileURL(absPath).toString();
      const doc = this.ofmParser.parse(uri, text, 0, this.resolveParseContext(absPath, uri, text));
      const id = toDocId(this.resolvedRoot, absPath);
      this.vaultIndex.set(id, doc);
      this.folderLookup.rebuild(this.vaultIndex);
      this.tagRegistry.removeDoc(id);
      this.tagRegistry.addDoc(id, doc);
    } catch {
      // Skip unreadable files.
    }
  }

  private deleteFile(absPath: string): void {
    const id = toDocId(this.resolvedRoot, absPath);
    this.vaultIndex.delete(id);
    this.folderLookup.rebuild(this.vaultIndex);
    this.tagRegistry.removeDoc(id);
  }

  private async fileExists(absPath: string): Promise<boolean> {
    return (await this.fileStat(absPath)) !== null;
  }

  private async fileStat(absPath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(absPath);
    } catch {
      return null;
    }
  }

  private async rescanVault(): Promise<void> {
    await this.vaultScanner.scan(pathToFileURL(this.resolvedRoot).toString());
  }

  private isFgIgnored(absPath: string): boolean {
    return this.fgConfigFiles?.resolveForFile(this.resolvedRoot, absPath).ignored === true;
  }

  private resolveParseContext(absPath: string, uri: string, text: string): ParseContext {
    if (this.flavorState === null || this.fgConfigFiles === null) {
      return { effectiveFlavor: 'obsidian', structuredProfiles: [] };
    }
    const fgConfig = this.fgConfigFiles.resolveForFile(this.resolvedRoot, absPath);
    const result = this.flavorState.resolveForDocument({
      uri,
      languageId: 'markdown',
      hasObsidianMarker: this.hasObsidianMarker(),
      fgAttributesFlavor: fgConfig.attributes.flavor,
      fgAttributesStructuredProfiles: fgConfig.attributes.structuredProfiles,
      syntaxText: text,
    });
    return result.kind === 'active'
      ? {
          effectiveFlavor: result.effective,
          structuredProfiles: result.structuredProfiles,
        }
      : { effectiveFlavor: 'commonmark', structuredProfiles: [] };
  }

  private hasObsidianMarker(): boolean {
    const obsidianPath = resolveVaultRelativePath(this.resolvedRoot, '.obsidian');
    if (obsidianPath === null) {
      return false;
    }
    try {
      return fs.statSync(obsidianPath).isDirectory();
    } catch {
      return false;
    }
  }
}

function isFlavorGrenadeConfigFile(vaultRelativePath: string): boolean {
  const basename = path.basename(vaultRelativePath);
  return basename === '.fgignore' || basename === '.fgattributes';
}
