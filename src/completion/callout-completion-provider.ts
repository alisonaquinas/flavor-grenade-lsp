import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { VaultIndex } from '../vault/vault-index.js';

/** LSP CompletionItemKind.EnumMember = 20 */
const COMPLETION_KIND_ENUM_MEMBER = 20;

/** The 13 standard Obsidian callout types. */
const STANDARD_CALLOUTS: readonly string[] = [
  'NOTE',
  'TIP',
  'IMPORTANT',
  'WARNING',
  'CAUTION',
  'DANGER',
  'INFO',
  'TODO',
  'EXAMPLE',
  'QUESTION',
  'QUOTE',
  'ABSTRACT',
  'SUCCESS',
];

/**
 * Provides callout type completion items after `> [!` triggers.
 *
 * Combines the 13 standard callout types with any custom types observed in the
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
