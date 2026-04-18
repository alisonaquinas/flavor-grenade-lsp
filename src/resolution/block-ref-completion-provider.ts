import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { Oracle } from './oracle.js';
import { VaultIndex } from '../vault/vault-index.js';
import { ParseCache } from '../parser/parser.module.js';

/** LSP CompletionItemKind.Reference = 18 */
const COMPLETION_KIND_REFERENCE = 18;

/**
 * Provides block anchor completion items after `[[doc#^` or `[[#^` triggers.
 *
 * - When `triggerDoc` is provided: resolve the target document via Oracle and
 *   return completions from that document's block anchors.
 * - When `triggerDoc` is empty/undefined and `currentUri` is provided: use
 *   the current document's block anchors from ParseCache (intra-doc).
 */
@Injectable()
export class BlockRefCompletionProvider {
  constructor(
    private readonly oracle: Oracle,
    private readonly vaultIndex: VaultIndex,
    private readonly parseCache: ParseCache,
  ) {}

  /**
   * Return completion items for a partial block anchor ID.
   *
   * @param partial     - The partial anchor ID typed after `[[doc#^` or `[[#^`.
   * @param triggerDoc  - The target document name (stem or path), or undefined
   *                      for intra-document completion.
   * @param currentUri  - The URI of the document currently open (used for
   *                      intra-document anchor lookup when triggerDoc is absent).
   */
  getCompletions(
    partial: string,
    triggerDoc?: string,
    currentUri?: string,
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPartial = partial.toLowerCase();

    let anchors: string[] = [];

    if (triggerDoc !== undefined && triggerDoc !== '') {
      // Cross-document completion: resolve the trigger doc
      const result = this.oracle.resolve(triggerDoc);
      if (result.kind === 'resolved') {
        const doc = this.vaultIndex.get(result.targetDocId);
        anchors = doc?.index.blockAnchors.map((a) => a.id) ?? [];
      }
    } else if (currentUri !== undefined) {
      // Intra-document completion: use the current doc from ParseCache
      const doc = this.parseCache.get(currentUri);
      anchors = doc?.index.blockAnchors.map((a) => a.id) ?? [];
    }

    const items: CompletionItem[] = anchors
      .filter((anchorId) => anchorId.toLowerCase().startsWith(lowerPartial))
      .map((anchorId) => ({
        label: anchorId,
        kind: COMPLETION_KIND_REFERENCE,
      }));

    return { items, isIncomplete: false };
  }
}
