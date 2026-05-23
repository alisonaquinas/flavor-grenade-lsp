import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { VaultIndex } from './vault-index.js';
import type { DocId } from './doc-id.js';
import {
  confineExistingPathToVaultRoot,
  confinePathToVaultRoot,
  normalizeAbsolutePath,
} from './vault-path-confinement.js';

export interface FileRename {
  oldUri: string;
  newUri: string;
}

export interface RenameFilesParams {
  files: FileRename[];
}

export interface PlannedDocumentMove {
  kind: 'document';
  oldUri: string;
  newUri: string;
  oldPath: string;
  newPath: string;
  oldDocId: DocId;
  newDocId: DocId;
}

export interface PlannedAttachmentMove {
  kind: 'attachment';
  oldUri: string;
  newUri: string;
  oldPath: string;
  newPath: string;
}

export type PlannedFileMove = PlannedDocumentMove | PlannedAttachmentMove;

export type FileOperationPlan =
  | { status: 'ok'; moves: PlannedFileMove[] }
  | { status: 'rejected'; reason: string };

interface VaultPathPair {
  oldUri: string;
  newUri: string;
  oldPath: string;
  newPath: string;
}

/**
 * Converts LSP file-operation URI pairs into vault-relative move mappings.
 */
@Injectable()
export class FileOperationPlanner {
  constructor(private readonly vaultIndex: VaultIndex) {}

  planRenameFiles(vaultRoot: string, params: unknown): FileOperationPlan {
    const files = this.readFiles(params);
    const pairs: VaultPathPair[] = [];

    for (const file of files) {
      const oldPath = this.vaultRelativePath(vaultRoot, file.oldUri, true);
      const newPath = this.vaultRelativePath(vaultRoot, file.newUri, false);
      if (oldPath === null || newPath === null) {
        return { status: 'rejected', reason: 'Path escapes vault root' };
      }

      pairs.push({ oldUri: file.oldUri, newUri: file.newUri, oldPath, newPath });
    }

    return { status: 'ok', moves: pairs.flatMap((pair) => this.expandPair(pair)) };
  }

  private readFiles(params: unknown): FileRename[] {
    const files = (params as RenameFilesParams | null | undefined)?.files;
    if (!Array.isArray(files)) {
      return [];
    }

    return files.filter(
      (file): file is FileRename =>
        typeof file?.oldUri === 'string' && typeof file?.newUri === 'string',
    );
  }

  private vaultRelativePath(vaultRoot: string, uri: string, mustExist: boolean): string | null {
    let absPath: string;
    try {
      const filePath = fileURLToPath(uri);
      const confinedPath =
        mustExist && fs.existsSync(filePath)
          ? confineExistingPathToVaultRoot(vaultRoot, filePath)
          : confinePathToVaultRoot(vaultRoot, filePath);
      if (confinedPath === null) {
        return null;
      }
      absPath = confinedPath;
    } catch {
      return null;
    }

    const root = normalizeAbsolutePath(vaultRoot);
    if (root === null) {
      return null;
    }

    return path.relative(root, absPath).split(path.sep).join('/');
  }

  private expandPair(pair: VaultPathPair): PlannedFileMove[] {
    if (pair.oldPath.endsWith('.md')) {
      return [this.documentMove(pair)];
    }

    if (this.vaultIndex.hasAttachment(pair.oldPath)) {
      return [this.attachmentMove(pair)];
    }

    return this.expandFolderPair(pair);
  }

  private expandFolderPair(pair: VaultPathPair): PlannedFileMove[] {
    const moves: PlannedFileMove[] = [];
    for (const [docId] of this.vaultIndex.entries()) {
      const oldPath = `${docId}.md`;
      if (!isPathUnderFolder(oldPath, pair.oldPath)) {
        continue;
      }

      moves.push(
        this.documentMove({
          oldUri: pair.oldUri,
          newUri: pair.newUri,
          oldPath,
          newPath: replaceFolderPrefix(oldPath, pair.oldPath, pair.newPath),
        }),
      );
    }

    for (const attachment of this.vaultIndex.attachments()) {
      if (!isPathUnderFolder(attachment.path, pair.oldPath)) {
        continue;
      }

      moves.push(
        this.attachmentMove({
          oldUri: pair.oldUri,
          newUri: pair.newUri,
          oldPath: attachment.path,
          newPath: replaceFolderPrefix(attachment.path, pair.oldPath, pair.newPath),
        }),
      );
    }

    return moves;
  }

  private documentMove(pair: VaultPathPair): PlannedDocumentMove {
    return {
      kind: 'document',
      oldUri: pair.oldUri,
      newUri: pair.newUri,
      oldPath: pair.oldPath,
      newPath: pair.newPath,
      oldDocId: stripMarkdownExtension(pair.oldPath),
      newDocId: stripMarkdownExtension(pair.newPath),
    };
  }

  private attachmentMove(pair: VaultPathPair): PlannedAttachmentMove {
    return {
      kind: 'attachment',
      oldUri: pair.oldUri,
      newUri: pair.newUri,
      oldPath: pair.oldPath,
      newPath: pair.newPath,
    };
  }
}

function stripMarkdownExtension(vaultPath: string): DocId {
  return vaultPath.replace(/\.md$/i, '') as DocId;
}

function isPathUnderFolder(vaultPath: string, folderPath: string): boolean {
  const normalizedFolder = trimSlashes(folderPath);
  if (normalizedFolder.length === 0) {
    return true;
  }
  return vaultPath === normalizedFolder || vaultPath.startsWith(`${normalizedFolder}/`);
}

function replaceFolderPrefix(vaultPath: string, oldFolder: string, newFolder: string): string {
  const oldPrefix = trimSlashes(oldFolder);
  const newPrefix = trimSlashes(newFolder);
  const suffix = oldPrefix.length === 0 ? vaultPath : vaultPath.slice(oldPrefix.length);
  return `${newPrefix}${suffix}`;
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}
