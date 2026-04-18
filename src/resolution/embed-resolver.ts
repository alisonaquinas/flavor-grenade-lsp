import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { EmbedEntry } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultScanner } from '../vault/vault-scanner.js';
import { Oracle } from './oracle.js';

/** Image file extensions recognised as binary assets (not markdown). */
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp']);

/**
 * The result of resolving an `![[embed]]` target.
 *
 * - `markdown` — target is a vault document (optionally with heading/block sub-target)
 * - `asset`    — target is a non-markdown file tracked in the asset index
 * - `broken`   — target could not be found in either index
 */
export type EmbedResolution =
  | { kind: 'markdown'; targetDocId: DocId; headingTarget?: string; blockTarget?: string }
  | { kind: 'asset'; assetPath: string }
  | { kind: 'broken' };

/**
 * Resolves `![[embed]]` targets to markdown documents or vault assets.
 *
 * Resolution order:
 * 1. If target extension is an image extension → look up in asset index.
 *    Found → `asset`; not found → `broken`.
 * 2. Otherwise → delegate to {@link Oracle} for markdown doc lookup.
 *    Resolved → `markdown`; anything else → `broken`.
 */
@Injectable()
export class EmbedResolver {
  constructor(
    private readonly oracle: Oracle,
    private readonly vaultScanner: VaultScanner,
  ) {}

  /**
   * Resolve an embed entry to its destination.
   *
   * @param entry - The parsed embed entry from the document index.
   */
  resolve(entry: EmbedEntry): EmbedResolution {
    const ext = this.extension(entry.target);
    if (IMAGE_EXTENSIONS.has(ext)) {
      return this.resolveAsset(entry.target);
    }
    return this.resolveMarkdown(entry.target);
  }

  private resolveAsset(target: string): EmbedResolution {
    // ADR013: only look up the path as-is in the asset index; no fs calls.
    if (this.vaultScanner.hasAsset(target)) {
      return { kind: 'asset', assetPath: target };
    }
    return { kind: 'broken' };
  }

  private resolveMarkdown(target: string): EmbedResolution {
    const result = this.oracle.resolve(target);
    if (result.kind === 'resolved') {
      const resolution: EmbedResolution & { kind: 'markdown' } = {
        kind: 'markdown',
        targetDocId: result.targetDocId,
      };
      if (result.headingTarget !== undefined) resolution.headingTarget = result.headingTarget;
      if (result.blockTarget !== undefined) resolution.blockTarget = result.blockTarget;
      return resolution;
    }
    return { kind: 'broken' };
  }

  private extension(target: string): string {
    const dot = target.lastIndexOf('.');
    return dot === -1 ? '' : target.slice(dot + 1).toLowerCase();
  }
}
