import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { FolderLookup } from '../vault/folder-lookup.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { LinkStyle } from '../lsp/services/server-settings.js';

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
  getCompletions(
    partial: string,
    linkStyle: LinkStyle = 'file-stem',
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPartial = partial.toLowerCase();
    const items: CompletionItem[] = [];

    for (const [docId, doc] of this.vaultIndex.entries()) {
      const stem = this.extractStem(docId);
      const insertText = this.formatTarget(docId, stem, doc.frontmatter, linkStyle);
      if (!this.matchesPartial(lowerPartial, stem, docId, insertText)) continue;

      items.push({
        label: stem,
        kind: COMPLETION_KIND_FILE,
        detail: docId,
        insertText,
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

  private formatTarget(
    docId: string,
    stem: string,
    frontmatter: Record<string, unknown> | null,
    linkStyle: LinkStyle,
  ): string {
    if (linkStyle === 'file-path-stem') {
      return docId;
    }
    if (linkStyle === 'title-slug') {
      const title = frontmatter?.['title'];
      if (typeof title === 'string' && title.trim().length > 0) {
        return title;
      }
    }
    return stem;
  }

  private matchesPartial(
    lowerPartial: string,
    stem: string,
    docId: string,
    insertText: string,
  ): boolean {
    return [stem, docId, insertText].some((value) => value.toLowerCase().startsWith(lowerPartial));
  }
}
