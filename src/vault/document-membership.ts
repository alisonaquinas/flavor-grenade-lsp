import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { VaultDetector, type VaultMode } from './vault-detector.js';
import { VaultIndex } from './vault-index.js';
import { SingleFileModeGuard } from './single-file-mode.js';
import { toDocId } from './doc-id.js';

export type DocumentMembershipReason =
  | 'obsidian-vault'
  | 'flavor-config-vault'
  | 'single-file'
  | 'not-indexed';

export interface DocumentMembershipParams {
  uri?: string;
}

export interface DocumentMembershipResult {
  isOfMarkdown: boolean;
  indexed: boolean;
  vaultRoot?: string;
  reason: DocumentMembershipReason;
}

/**
 * Answers whether a URI should be treated as OFMarkdown by editor clients.
 *
 * The request is intentionally read-only: it reflects current vault detection
 * and index state without creating diagnostics or mutating the index.
 */
@Injectable()
export class DocumentMembershipService {
  constructor(
    private readonly vaultDetector: VaultDetector,
    private readonly vaultIndex: VaultIndex,
  ) {}

  handle(params: unknown): DocumentMembershipResult {
    const uri = (params as DocumentMembershipParams | null | undefined)?.uri;
    if (typeof uri !== 'string') {
      return this.negative('not-indexed');
    }

    const fsPath = this.toMarkdownFilePath(uri);
    if (fsPath === null) {
      return this.negative('not-indexed');
    }

    const detection = this.vaultDetector.detectFresh(fsPath);
    if (detection.vaultRoot === null) {
      return this.negative('single-file');
    }
    if (detection.mode === 'single-file') {
      return this.negative('single-file');
    }

    const docId = toDocId(detection.vaultRoot, fsPath);
    return {
      isOfMarkdown: true,
      indexed: this.vaultIndex.has(docId),
      vaultRoot: detection.vaultRoot,
      reason: this.reasonForMode(detection.mode),
    };
  }

  private toMarkdownFilePath(uri: string): string | null {
    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      return null;
    }

    if (parsed.protocol !== 'file:') {
      return null;
    }

    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const normalized = path.normalize(fsPath);
    return normalized.toLowerCase().endsWith('.md') ? normalized : null;
  }

  private reasonForMode(mode: Exclude<VaultMode, 'single-file'>): DocumentMembershipReason {
    return mode === 'obsidian' ? 'obsidian-vault' : 'flavor-config-vault';
  }

  private negative(reason: DocumentMembershipReason): DocumentMembershipResult {
    return {
      isOfMarkdown: false,
      indexed: false,
      reason,
    };
  }
}
