import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { VaultIndex } from '../vault/vault-index.js';

/** LSP CompletionItemKind.EnumMember = 20 */
const COMPLETION_KIND_ENUM_MEMBER = 20;

/** Standard Obsidian callout types (includes GitHub Alerts aliases). */
const STANDARD_CALLOUTS: readonly string[] = [
  'NOTE',
  'INFO',
  'TIP',
  'IMPORTANT',
  'WARNING',
  'CAUTION',
  'DANGER',
  'SUCCESS',
  'QUESTION',
  'FAILURE',
  'BUG',
  'EXAMPLE',
  'QUOTE',
  'ABSTRACT',
  'TODO',
];

/**
 * Provides callout type completion items after `> [!` triggers.
 *
 * Combines the 15 standard callout types with any custom types observed in the
 * vault index. Filters by case-insensitive prefix match on `partial`.
 */
@Injectable()
export class CalloutCompletionProvider {
  constructor(private readonly vaultIndex: VaultIndex) {}

  /**
   * Return completion items for callout types.
   *
   * @param partial - The partially typed callout type (case-insensitive).
   */
  getCompletions(partial: string): { items: CompletionItem[]; isIncomplete: boolean } {
    const lowerPartial = partial.toLowerCase();

    // Collect unique callout types: standard + custom from vault
    const typeSet = new Set<string>(STANDARD_CALLOUTS);
    for (const doc of this.vaultIndex.values()) {
      for (const callout of doc.index.callouts) {
        typeSet.add(callout.type.toUpperCase());
      }
    }

    const items: CompletionItem[] = [];
    for (const type of typeSet) {
      if (type.toLowerCase().startsWith(lowerPartial)) {
        items.push({
          label: type,
          kind: COMPLETION_KIND_ENUM_MEMBER,
          insertText: `${type}] `,
        });
      }
    }

    return { items, isIncomplete: false };
  }
}
