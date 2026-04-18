import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { CompletionItemKind } from 'vscode-languageserver-types';
import type { CompletionItem } from 'vscode-languageserver-types';
import { Oracle } from '../resolution/oracle.js';
import { VaultIndex } from '../vault/vault-index.js';
import type { DocId } from '../vault/doc-id.js';

/**
 * Provides heading completion items after `[[doc#` or `[[#` triggers.
 *
 * - When `targetStem` is empty → use `currentDocId`'s headings (intra-doc).
 * - When `targetStem` is set  → resolve via Oracle and use that doc's headings.
 *
 * Items are filtered case-insensitively by `headingPrefix`.
 */
@Injectable()
export class HeadingCompletionProvider {
  constructor(
    private readonly oracle: Oracle,
    private readonly vaultIndex: VaultIndex,
  ) {}

  /**
   * Return completion items for headings.
   *
   * @param targetStem    - The target document stem, or empty string for intra-doc.
   * @param headingPrefix - The partially typed heading text to filter by.
   * @param currentDocId  - The current document ID (used when targetStem is empty).
   */
  getCompletions(
    targetStem: string,
    headingPrefix: string,
    currentDocId?: DocId,
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPrefix = headingPrefix.toLowerCase();

    if (targetStem === '') {
      // Intra-document completion
      if (currentDocId === undefined) {
        return { items: [], isIncomplete: false };
      }
      const doc = this.vaultIndex.get(currentDocId);
      if (doc === undefined) {
        return { items: [], isIncomplete: false };
      }
      const items = doc.index.headings
        .filter((h) => h.text.toLowerCase().startsWith(lowerPrefix))
        .map((h) => ({
          label: h.text,
          kind: CompletionItemKind.Reference,
          insertText: h.text,
        }));
      return { items, isIncomplete: false };
    }

    // Cross-document completion
    const result = this.oracle.resolve(targetStem);
    if (result.kind !== 'resolved') {
      return { items: [], isIncomplete: false };
    }

    const doc = this.vaultIndex.get(result.targetDocId);
    if (doc === undefined) {
      return { items: [], isIncomplete: false };
    }

    const stem = this.extractStem(result.targetDocId);
    const items = doc.index.headings
      .filter((h) => h.text.toLowerCase().startsWith(lowerPrefix))
      .map((h) => ({
        label: h.text,
        kind: CompletionItemKind.Reference,
        insertText: `${stem}#${h.text}`,
      }));

    return { items, isIncomplete: false };
  }

  private extractStem(docId: DocId): string {
    const segments = docId.split('/');
    return segments[segments.length - 1];
  }
}
