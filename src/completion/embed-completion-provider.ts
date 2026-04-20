import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { FolderLookup } from '../vault/folder-lookup.js';
import { VaultScanner } from '../vault/vault-scanner.js';
import { VaultIndex } from '../vault/vault-index.js';

/** LSP CompletionItemKind.File = 17 */
const COMPLETION_KIND_FILE = 17;

/**
 * Provides `![[` embed completion items combining document stems from the
 * vault index with asset paths from the vault scanner.
 *
 * Both document stems and asset paths use {@link CompletionItemKind.File}.
 */
@Injectable()
export class EmbedCompletionProvider {
  constructor(
    private readonly folderLookup: FolderLookup,
    private readonly vaultScanner: VaultScanner,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Return completion items for embed targets.
   *
   * @param partial - The partially typed embed target (case-insensitive prefix match).
   */
  getCompletions(partial: string): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPartial = partial.toLowerCase();
    const items: CompletionItem[] = [];
    const seen = new Set<string>();

    // Document stems from vault index
    for (const [docId] of this.vaultIndex.entries()) {
      const stem = this.extractStem(docId);
      if (!seen.has(stem) && stem.toLowerCase().startsWith(lowerPartial)) {
        seen.add(stem);
        items.push({
          label: stem,
          kind: COMPLETION_KIND_FILE,
          detail: docId,
        });
      }
    }

    // Asset paths from vault scanner
    for (const assetPath of this.vaultScanner.getAssetIndex()) {
      if (!seen.has(assetPath) && assetPath.toLowerCase().startsWith(lowerPartial)) {
        seen.add(assetPath);
        items.push({
          label: assetPath,
          kind: COMPLETION_KIND_FILE,
        });
      }
    }

    return { items, isIncomplete: false };
  }

  private extractStem(docId: string): string {
    const segments = docId.split('/');
    return segments[segments.length - 1];
  }
}
