import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { CompletionItemKind } from 'vscode-languageserver-types';
import type { CompletionItem } from 'vscode-languageserver-types';
import type { OFMDoc } from '../parser/types.js';
import type { DocId } from '../vault/doc-id.js';
import { VaultIndex } from '../vault/vault-index.js';
import { Oracle } from '../resolution/oracle.js';
import { classifyMarkdownTarget } from '../resolution/markdown-target-classifier.js';

/** Provides completions for standard Markdown link URL targets. */
@Injectable()
export class MarkdownLinkCompletionProvider {
  constructor(
    private readonly vaultIndex: VaultIndex,
    private readonly oracle: Oracle,
  ) {}

  /** Return document completions for `[text](...)` contexts. */
  getDocumentCompletions(
    partial: string,
    sourceDocId?: DocId,
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    if (isNonVaultPartial(partial)) return { items: [], isIncomplete: false };

    const lowerPartial = partial.toLowerCase();
    const items: CompletionItem[] = [];
    for (const [docId] of this.vaultIndex.entries()) {
      const stem = docId.split('/').pop() ?? docId;
      const insertText = this.relativeMarkdownPath(docId, sourceDocId);
      if (
        ![stem, insertText, docId].some((value) => value.toLowerCase().startsWith(lowerPartial))
      ) {
        continue;
      }
      items.push({
        label: stem,
        kind: CompletionItemKind.File,
        detail: docId,
        insertText,
      });
    }
    return { items, isIncomplete: false };
  }

  /** Return heading completions for `[text](#...)` and `[text](doc#...)`. */
  getHeadingCompletions(
    target: string,
    headingPrefix: string,
    currentDoc: OFMDoc,
    sourceDocId?: DocId,
  ): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPrefix = headingPrefix.toLowerCase();
    let doc = currentDoc;

    if (target !== '') {
      if (sourceDocId === undefined) return { items: [], isIncomplete: false };
      const classification = classifyMarkdownTarget(target, { sourceDocId });
      const result = this.oracle.resolveMarkdownTarget(sourceDocId, classification);
      if (result.kind !== 'document-resolved' && result.kind !== 'heading-resolved') {
        return { items: [], isIncomplete: false };
      }
      const targetDoc = this.vaultIndex.get(result.targetDocId);
      if (targetDoc === undefined) return { items: [], isIncomplete: false };
      doc = targetDoc;
    }

    const items = doc.index.headings
      .filter((heading) => heading.text.toLowerCase().startsWith(lowerPrefix))
      .map((heading) => ({
        label: heading.text,
        kind: CompletionItemKind.Reference,
        insertText: heading.text,
      }));
    return { items, isIncomplete: false };
  }

  private relativeMarkdownPath(docId: DocId, sourceDocId?: DocId): string {
    const targetPath = `${docId}.md`;
    if (sourceDocId === undefined) return targetPath;

    const sourceDir = sourceDocId.split('/').slice(0, -1).join('/');
    if (sourceDir === '') return targetPath;
    const prefix = `${sourceDir}/`;
    return targetPath.startsWith(prefix) ? targetPath.slice(prefix.length) : targetPath;
  }
}

function isNonVaultPartial(partial: string): boolean {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(partial);
}
