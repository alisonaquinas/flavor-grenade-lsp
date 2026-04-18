import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { VaultDetector } from './vault-detector.js';
import { VaultIndex } from './vault-index.js';
import { FolderLookup } from './folder-lookup.js';
import { IgnoreFilter } from './ignore-filter.js';
import { SingleFileModeGuard } from './single-file-mode.js';
import { toDocId } from './doc-id.js';
import { OFMParser } from '../parser/ofm-parser.js';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { TagRegistry } from '../tags/tag-registry.js';

/**
 * Performs the initial recursive scan of a vault root, parsing all `.md`
 * files and populating the {@link VaultIndex}, {@link FolderLookup}, and
 * {@link TagRegistry}.
 *
 * After scanning, sends a `flavorGrenade/status` `'ready'` notification via
 * the {@link JsonRpcDispatcher}.
 */
@Injectable()
export class VaultScanner {
  constructor(
    private readonly vaultDetector: VaultDetector,
    private readonly vaultIndex: VaultIndex,
    private readonly folderLookup: FolderLookup,
    private readonly ignoreFilter: IgnoreFilter,
    private readonly ofmParser: OFMParser,
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly tagRegistry: TagRegistry,
  ) {}

  /**
   * Scan the vault rooted at `rootUri`, index all `.md` files, and send
   * a `'ready'` status notification when done.
   *
   * In single-file mode the recursive walk is skipped entirely.
   *
   * @param rootUri - `file://` URI for the workspace root.
   */
  async scan(rootUri: string): Promise<void> {
    if (SingleFileModeGuard.isActive(this.vaultDetector, rootUri)) {
      this.dispatcher.sendNotification('flavorGrenade/status', { status: 'ready' });
      return;
    }

    const vaultRoot = this.vaultDetector.detect(
      SingleFileModeGuard.uriToPath(rootUri),
    ).vaultRoot!;

    this.ignoreFilter.load(vaultRoot);
    await this.walkAndIndex(vaultRoot, vaultRoot);
    this.folderLookup.rebuild(this.vaultIndex);
    this.tagRegistry.rebuild(this.vaultIndex);
    this.dispatcher.sendNotification('flavorGrenade/status', { status: 'ready' });
  }

  private async walkAndIndex(vaultRoot: string, dir: string): Promise<void> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(vaultRoot, fullPath).split(path.sep).join('/');

      if (this.ignoreFilter.shouldIgnore(relPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.walkAndIndex(vaultRoot, fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        await this.indexFile(vaultRoot, fullPath);
      }
    }
  }

  private async indexFile(vaultRoot: string, filePath: string): Promise<void> {
    try {
      const text = await fs.promises.readFile(filePath, 'utf8');
      const uri = `file://${filePath.split(path.sep).join('/')}`;
      const doc = this.ofmParser.parse(uri, text, 0);
      const id = toDocId(vaultRoot, filePath);
      this.vaultIndex.set(id, doc);
    } catch {
      // Skip unreadable files silently.
    }
  }
}
