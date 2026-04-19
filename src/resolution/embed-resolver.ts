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
   * Splits off any `#heading` or `#^blockref` fragment from the target before
   * routing to asset or markdown resolution.
   *
   * @param entry - The parsed embed entry from the document index.
   */
  resolve(entry: EmbedEntry): EmbedResolution {
    // Split heading/block-ref fragment from target (e.g. "doc#Section" or "doc#^anchor")
    const hashIdx = entry.target.indexOf('#');
    const fileTarget = hashIdx === -1 ? entry.target : entry.target.slice(0, hashIdx);
    const fragment = hashIdx === -1 ? '' : entry.target.slice(hashIdx + 1);

    const ext = this.extension(fileTarget);
    if (IMAGE_EXTENSIONS.has(ext)) {
      return this.resolveAsset(fileTarget);
    }

    const heading = fragment !== '' && !fragment.startsWith('^') ? fragment : undefined;
    const blockRef = fragment.startsWith('^') ? fragment.slice(1) : undefined;
    return this.resolveMarkdown(fileTarget, heading, blockRef);
  }

  private resolveAsset(target: string): EmbedResolution {
    // Direct vault-relative path lookup first
    if (this.vaultScanner.hasAsset(target)) {
      return { kind: 'asset', assetPath: target };
    }
    // Obsidian "shortest path" resolution: match by filename suffix
    const suffix = '/' + target;
    for (const assetPath of this.vaultScanner.getAssetIndex()) {
      if (assetPath === target || assetPath.endsWith(suffix)) {
        return { kind: 'asset', assetPath };
      }
    }
    return { kind: 'broken' };
  }

  private resolveMarkdown(target: string, heading?: string, blockRef?: string): EmbedResolution {
    const result = this.oracle.resolve(target);
    if (result.kind === 'resolved') {
      const resolution: EmbedResolution & { kind: 'markdown' } = {
        kind: 'markdown',
        targetDocId: result.targetDocId,
      };
      if (heading !== undefined) resolution.headingTarget = heading;
      if (blockRef !== undefined) resolution.blockTarget = blockRef;
      return resolution;
    }
    return { kind: 'broken' };
  }

  private extension(target: string): string {
    const dot = target.lastIndexOf('.');
    return dot === -1 ? '' : target.slice(dot + 1).toLowerCase();
  }
}
