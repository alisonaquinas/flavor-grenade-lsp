import 'reflect-metadata';
import { Inject, Injectable, Optional } from '@nestjs/common';
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
import {
  confineExistingPathToVaultRoot,
  resolveVaultRelativePath,
} from './vault-path-confinement.js';
import { OFMParser } from '../parser/ofm-parser.js';
import { JsonRpcDispatcher } from '../transport/json-rpc-dispatcher.js';
import { TagRegistry } from '../tags/tag-registry.js';
import { SERVER_VERSION } from '../version.js';
import { FlavorGrenadeConfigFiles } from '../markdown-flavor/fg-config-files.js';
import { MarkdownFlavorState } from '../markdown-flavor/markdown-flavor-state.js';
import type { ParseContext } from '../parser/types.js';

export const VAULT_SCAN_FILE_LIMIT = Symbol('VAULT_SCAN_FILE_LIMIT');

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
  private static readonly DEFAULT_MAX_SCAN_FILES = 50_000;

  /** Vault-relative paths of all non-`.md` files found during the last scan. */
  private assetIndex: Set<string> = new Set();
  private scannedFileCount = 0;
  private scanFileLimitReached = false;
  private readonly maxScanFiles: number;

  constructor(
    private readonly vaultDetector: VaultDetector,
    private readonly vaultIndex: VaultIndex,
    private readonly folderLookup: FolderLookup,
    private readonly ignoreFilter: IgnoreFilter,
    private readonly ofmParser: OFMParser,
    private readonly dispatcher: JsonRpcDispatcher,
    private readonly tagRegistry: TagRegistry,
    private readonly flavorState: MarkdownFlavorState,
    private readonly fgConfigFiles: FlavorGrenadeConfigFiles,
    @Optional() @Inject(VAULT_SCAN_FILE_LIMIT) maxScanFiles?: number,
  ) {
    this.maxScanFiles = maxScanFiles ?? VaultScanner.DEFAULT_MAX_SCAN_FILES;
  }

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
        serverVersion: SERVER_VERSION,
      });
      return;
    }

    const detection = this.vaultDetector.detect(SingleFileModeGuard.uriToPath(rootUri));
    const vaultRoot = detection.vaultRoot!;

    this.ignoreFilter.load(vaultRoot);
    this.assetIndex = new Set();
    this.scannedFileCount = 0;
    this.scanFileLimitReached = false;
    this.vaultIndex.clear();
    const documentExtensions = await this.loadDocumentExtensions(vaultRoot);
    this.vaultIndex.setAttachmentFolderHint(await this.loadObsidianAttachmentFolderHint(vaultRoot));
    await this.walkAndIndex(
      vaultRoot,
      vaultRoot,
      documentExtensions,
      detection.mode === 'obsidian',
    );
    if (this.scanFileLimitReached) {
      this.dispatcher.sendNotification('window/showMessage', {
        type: 2,
        message: `Flavor Grenade stopped indexing after reaching the ${this.maxScanFiles} file limit.`,
      });
    }
    this.folderLookup.rebuild(this.vaultIndex);
    this.tagRegistry.rebuild(this.vaultIndex);
    this.dispatcher.sendNotification('flavorGrenade/status', {
      state: 'ready',
      vaultCount: 1,
      docCount: this.vaultIndex.size(),
      serverVersion: SERVER_VERSION,
    });
  }

  private async walkAndIndex(
    vaultRoot: string,
    dir: string,
    documentExtensions: ReadonlySet<string>,
    hasObsidianMarker: boolean,
  ): Promise<void> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = resolveVaultRelativePath(dir, entry.name);
      if (fullPath === null) {
        continue;
      }

      const relPath = path.relative(vaultRoot, fullPath).split(path.sep).join('/');

      if (this.ignoreFilter.shouldIgnore(relPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        if (this.fgConfigFiles.shouldPruneDirectory(vaultRoot, fullPath)) {
          continue;
        }
        await this.walkAndIndex(vaultRoot, fullPath, documentExtensions, hasObsidianMarker);
        if (this.scanFileLimitReached) {
          return;
        }
      } else if (entry.isFile() && this.shouldSkipVisiblePath(vaultRoot, fullPath, relPath)) {
        continue;
      } else if (entry.isFile() && documentExtensions.has(path.extname(entry.name).toLowerCase())) {
        if (!this.reserveFileBudget()) {
          return;
        }
        if (confineExistingPathToVaultRoot(vaultRoot, fullPath) === null) {
          continue;
        }
        await this.indexFile(vaultRoot, fullPath, hasObsidianMarker);
      } else if (entry.isFile()) {
        if (!this.reserveFileBudget()) {
          return;
        }
        if (confineExistingPathToVaultRoot(vaultRoot, fullPath) === null) {
          continue;
        }
        this.assetIndex.add(relPath);
        await this.indexAttachment(fullPath, relPath);
      }
    }
  }

  private shouldSkipVisiblePath(vaultRoot: string, fullPath: string, relPath: string): boolean {
    if (isFlavorGrenadeConfigFile(relPath)) {
      return true;
    }
    return this.fgConfigFiles.resolveForFile(vaultRoot, fullPath).ignored;
  }

  private reserveFileBudget(): boolean {
    if (this.scannedFileCount >= this.maxScanFiles) {
      this.scanFileLimitReached = true;
      return false;
    }
    this.scannedFileCount += 1;
    return true;
  }

  private async indexAttachment(filePath: string, relPath: string): Promise<void> {
    try {
      this.vaultIndex.setAttachment(await buildAttachmentEntry(filePath, relPath));
    } catch {
      // Skip unreadable attachments silently.
    }
  }

  private async loadDocumentExtensions(vaultRoot: string): Promise<ReadonlySet<string>> {
    const configPath = resolveVaultRelativePath(vaultRoot, '.flavor-grenade.toml');
    if (configPath === null) {
      return VaultScanner.DEFAULT_DOCUMENT_EXTENSIONS;
    }

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
    const appJsonPath = resolveVaultRelativePath(vaultRoot, '.obsidian/app.json');
    if (appJsonPath === null) {
      return undefined;
    }

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

  private async indexFile(
    vaultRoot: string,
    filePath: string,
    hasObsidianMarker: boolean,
  ): Promise<void> {
    try {
      const text = await fs.promises.readFile(filePath, 'utf8');
      const uri = pathToFileURL(filePath).toString();
      const doc = this.ofmParser.parse(
        uri,
        text,
        0,
        this.resolveParseContext(vaultRoot, filePath, uri, text, hasObsidianMarker),
      );
      const id = toDocId(vaultRoot, filePath);
      this.vaultIndex.set(id, doc);
    } catch {
      // Skip unreadable files silently.
    }
  }

  private resolveParseContext(
    vaultRoot: string,
    filePath: string,
    uri: string,
    text: string,
    hasObsidianMarker: boolean,
  ): ParseContext {
    const fgConfig = this.fgConfigFiles.resolveForFile(vaultRoot, filePath);
    const result = this.flavorState.resolveForDocument({
      uri,
      languageId: 'markdown',
      hasObsidianMarker,
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
}

function isFlavorGrenadeConfigFile(vaultRelativePath: string): boolean {
  const basename = path.basename(vaultRelativePath);
  return basename === '.fgignore' || basename === '.fgattributes';
}
