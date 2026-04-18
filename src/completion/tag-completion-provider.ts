import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { CompletionItem } from 'vscode-languageserver-types';
import { TagRegistry } from '../tags/tag-registry.js';

/** Maximum number of completion items before the result is marked incomplete. */
const MAX_ITEMS = 100;

/**
 * LSP `CompletionItemKind.Value` = 12.
 * Used for tag completions since tags are document values, not symbols.
 */
const COMPLETION_KIND_VALUE = 12;

/**
 * Provides `#` tag completion items by querying the {@link TagRegistry}.
 *
 * Returns frequency-sorted candidates — the registry's `allTags()` order
 * (descending count) is preserved so the most-used tags surface first.
 *
 * Labels do NOT include the `#` character; the client supplies the trigger
 * character itself in the text-edit.
 */
@Injectable()
export class TagCompletionProvider {
  constructor(private readonly tagRegistry: TagRegistry) {}

  /**
   * Return completion items for a partial tag.
   *
   * @param partial - Text typed after `#` (leading `#` is stripped if present).
   * @returns `{ items, isIncomplete }` — `isIncomplete` is `true` when the
   *   result is capped at {@link MAX_ITEMS}.
   */
  getCompletions(partial: string): { items: CompletionItem[]; isIncomplete: boolean } {
    const bare = partial.startsWith('#') ? partial.slice(1) : partial;

    // allTags() is sorted by frequency descending; we filter by prefix.
    const allSorted = this.tagRegistry.allTags();
    const items: CompletionItem[] = [];

    for (const { tag, count } of allSorted) {
      const body = tag.slice(1); // strip '#' for label
      if (!body.startsWith(bare)) continue;

      items.push({
        label: body,
        kind: COMPLETION_KIND_VALUE,
        detail: `${count} occurrence${count !== 1 ? 's' : ''}`,
      });

      if (items.length >= MAX_ITEMS) {
        return { items, isIncomplete: true };
      }
    }

    return { items, isIncomplete: false };
  }
}
