import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { FolderLookup } from '../vault/folder-lookup.js';
import { VaultIndex } from '../vault/vault-index.js';

/** Maximum number of completion items to return before setting isIncomplete. */
const MAX_ITEMS = 100;

/** LSP CompletionItemKind.File = 17 */
const COMPLETION_KIND_FILE = 17;

/**
 * Provides `[[` completion items by enumerating all vault documents.
 */
@Injectable()
export class WikiLinkCompletionProvider {
  constructor(
    private readonly folderLookup: FolderLookup,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Return completion items for a partial wiki-link target.
   *
   * Filters by stem prefix match (case-insensitive). Caps at 100 items.
   *
   * @param partial - The typed partial string after `[[`.
   */
  getCompletions(partial: string): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPartial = partial.toLowerCase();
    const items: CompletionItem[] = [];

    for (const [docId] of this.vaultIndex.entries()) {
      const stem = this.extractStem(docId);
      if (!stem.toLowerCase().startsWith(lowerPartial)) continue;

      items.push({
        label: stem,
        kind: COMPLETION_KIND_FILE,
        detail: docId,
      });

      if (items.length >= MAX_ITEMS) {
        return { items, isIncomplete: true };
      }
    }

    return { items, isIncomplete: false };
  }

  private extractStem(docId: string): string {
    const segments = docId.split('/');
    return segments[segments.length - 1];
  }
}
