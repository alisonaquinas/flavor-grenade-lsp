import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { VaultDetector } from './vault-detector.js';
import { VaultIndex } from './vault-index.js';
import { FolderLookup } from './folder-lookup.js';
import { IgnoreFilter } from './ignore-filter.js';
import { SingleFileModeGuard } from './single-file-mode.js';
import { toDocId } from './doc-id.js';
import { buildAttachmentEntry } from './attachment-metadata.js';
import { OFMParser } from '../parser/ofm-parser.js';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { TagRegistry } from '../tags/tag-registry.js';

/**
 * Performs the initial recursive scan of a vault root, parsing all `.md`
 * files and populating the {@link VaultIndex}, {@link FolderLookup}, and
 * {@link TagRegistry}.
 *
 * Non-markdown files are tracked in the {@link assetIndex} (vault-relative
 * paths) so that `![[embed]]` resolution can confirm assets exist.
 *
 * After scanning, sends a `flavorGrenade/status` `'ready'` notification via
 * the {@link JsonRpcDispatcher}.
 */
@Injectable()
export class VaultScanner {
  private static readonly DEFAULT_DOCUMENT_EXTENSIONS = new Set(['.md']);

  /** Vault-relative paths of all non-`.md` files found during the last scan. */
  private assetIndex: Set<string> = new Set();

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
   * Return the current asset index (vault-relative paths of non-`.md` files).
   */
  getAssetIndex(): Set<string> {
    return this.assetIndex;
  }

  /**
   * Check whether a vault-relative path is a known asset.
   *
   * @param vaultRelPath - Forward-slash vault-relative path.
   */
  hasAsset(vaultRelPath: string): boolean {
    return this.vaultIndex.hasAttachment(vaultRelPath) || this.assetIndex.has(vaultRelPath);
  }

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
      this.dispatcher.sendNotification('flavorGrenade/status', {
        state: 'ready',
        vaultCount: 0,
        docCount: this.vaultIndex.size(),
      });
      return;
    }

    const vaultRoot = this.vaultDetector.detect(SingleFileModeGuard.uriToPath(rootUri)).vaultRoot!;

    this.ignoreFilter.load(vaultRoot);
    this.assetIndex = new Set();
    this.vaultIndex.clear();
    const documentExtensions = await this.loadDocumentExtensions(vaultRoot);
    this.vaultIndex.setAttachmentFolderHint(await this.loadObsidianAttachmentFolderHint(vaultRoot));
    await this.walkAndIndex(vaultRoot, vaultRoot, documentExtensions);
    this.folderLookup.rebuild(this.vaultIndex);
    this.tagRegistry.rebuild(this.vaultIndex);
    this.dispatcher.sendNotification('flavorGrenade/status', {
      state: 'ready',
      vaultCount: 1,
      docCount: this.vaultIndex.size(),
    });
  }

  private async walkAndIndex(
    vaultRoot: string,
    dir: string,
    documentExtensions: ReadonlySet<string>,
  ): Promise<void> {
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
        await this.walkAndIndex(vaultRoot, fullPath, documentExtensions);
      } else if (entry.isFile() && documentExtensions.has(path.extname(entry.name).toLowerCase())) {
        await this.indexFile(vaultRoot, fullPath);
      } else if (entry.isFile()) {
        this.assetIndex.add(relPath);
        await this.indexAttachment(fullPath, relPath);
      }
    }
  }

  private async indexAttachment(filePath: string, relPath: string): Promise<void> {
    try {
      this.vaultIndex.setAttachment(await buildAttachmentEntry(filePath, relPath));
    } catch {
      // Skip unreadable attachments silently.
    }
  }

  private async loadDocumentExtensions(vaultRoot: string): Promise<ReadonlySet<string>> {
    const configPath = path.join(vaultRoot, '.flavor-grenade.toml');
    let configText: string;

    try {
      configText = await fs.promises.readFile(configPath, 'utf8');
    } catch {
      return VaultScanner.DEFAULT_DOCUMENT_EXTENSIONS;
    }

    const configuredExtensions = this.parseVaultExtensions(configText);
    if (configuredExtensions.length === 0) {
      return VaultScanner.DEFAULT_DOCUMENT_EXTENSIONS;
    }

    return new Set(configuredExtensions);
  }

  private async loadObsidianAttachmentFolderHint(vaultRoot: string): Promise<string | undefined> {
    const appJsonPath = path.join(vaultRoot, '.obsidian', 'app.json');
    let configText: string;

    try {
      configText = await fs.promises.readFile(appJsonPath, 'utf8');
    } catch {
      return undefined;
    }

    try {
      const parsed = JSON.parse(configText) as { attachmentFolderPath?: unknown };
      if (typeof parsed.attachmentFolderPath !== 'string') {
        return undefined;
      }
      return this.normalizeAttachmentFolder(parsed.attachmentFolderPath);
    } catch {
      return undefined;
    }
  }

  private parseVaultExtensions(configText: string): string[] {
    const sectionText = this.readTomlSection(configText, 'vault');
    const extensionLine = /^\s*extensions\s*=\s*\[([^\]]*)\]/m.exec(sectionText);
    if (!extensionLine) {
      return [];
    }

    return [...extensionLine[1].matchAll(/["']([^"']+)["']/g)]
      .map((match) => this.normalizeExtension(match[1]))
      .filter((extension): extension is string => extension !== null);
  }

  private readTomlSection(configText: string, sectionName: string): string {
    const lines = configText.split(/\r?\n/);
    const sectionLines: string[] = [];
    let inSection = false;

    for (const line of lines) {
      const header = /^\s*\[([^\]]+)\]\s*$/.exec(line);
      if (header) {
        if (inSection) {
          break;
        }
        inSection = header[1].trim() === sectionName;
        continue;
      }

      if (inSection) {
        sectionLines.push(line);
      }
    }

    return sectionLines.join('\n');
  }

  private normalizeExtension(value: string): string | null {
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length === 0) {
      return null;
    }

    return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
  }

  private normalizeAttachmentFolder(value: string): string | undefined {
    const normalized = value.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
    return normalized.length > 0 && normalized !== '.' ? normalized : undefined;
  }

  private async indexFile(vaultRoot: string, filePath: string): Promise<void> {
    try {
      const text = await fs.promises.readFile(filePath, 'utf8');
      const uri = pathToFileURL(filePath).toString();
      const doc = this.ofmParser.parse(uri, text, 0);
      const id = toDocId(vaultRoot, filePath);
      this.vaultIndex.set(id, doc);
    } catch {
      // Skip unreadable files silently.
    }
  }
}
