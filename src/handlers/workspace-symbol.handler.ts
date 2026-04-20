import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import { VaultIndex } from '../vault/vault-index.js';
import { VaultDetector } from '../vault/vault-detector.js';

const SYMBOL_KIND_STRING = 15; // SymbolKind.String
const SYMBOL_KIND_KEY = 20; // SymbolKind.Key
const MAX_RESULTS = 50;

interface WorkspaceSymbol {
  name: string;
  kind: number;
  location: { uri: string; range: Range };
}

interface SymbolWithScore {
  symbol: WorkspaceSymbol;
  isPrefix: boolean;
}

/**
 * Handles `workspace/symbol` requests.
 *
 * Searches across all vault documents for headings, tags, and block anchors
 * that match the query (case-insensitive prefix/substring).
 *
 * Results are sorted: prefix matches before substring matches, then alphabetically.
 * Capped at 50 items.
 */
@Injectable()
export class WorkspaceSymbolHandler {
  constructor(
    private readonly vaultIndex: VaultIndex,
    private readonly vaultDetector: VaultDetector,
  ) {}

  handle(params: { query: string }): WorkspaceSymbol[] {
    const query = params.query.toLowerCase();
    const scored: SymbolWithScore[] = [];

    for (const doc of this.vaultIndex.values()) {
      // Headings — SymbolKind.String (15)
      for (const heading of doc.index.headings) {
        const name = heading.text;
        const nameLower = name.toLowerCase();
        if (!nameLower.includes(query)) continue;
        scored.push({
          symbol: {
            name,
            kind: SYMBOL_KIND_STRING,
            location: { uri: doc.uri, range: heading.range },
          },
          isPrefix: nameLower.startsWith(query),
        });
      }

      // Tags — SymbolKind.Key (20), strip leading '#'
      for (const tagEntry of doc.index.tags) {
        const name = tagEntry.tag.startsWith('#') ? tagEntry.tag.slice(1) : tagEntry.tag;
        const nameLower = name.toLowerCase();
        if (!nameLower.includes(query)) continue;
        scored.push({
          symbol: {
            name,
            kind: SYMBOL_KIND_KEY,
            location: { uri: doc.uri, range: tagEntry.range },
          },
          isPrefix: nameLower.startsWith(query),
        });
      }

      // Block anchors — SymbolKind.Key (20)
      for (const anchor of doc.index.blockAnchors) {
        const name = anchor.id;
        const nameLower = name.toLowerCase();
        if (!nameLower.includes(query)) continue;
        scored.push({
          symbol: { name, kind: SYMBOL_KIND_KEY, location: { uri: doc.uri, range: anchor.range } },
          isPrefix: nameLower.startsWith(query),
        });
      }
    }

    // Sort: prefix matches first, then alphabetical within each group
    scored.sort((a, b) => {
      if (a.isPrefix !== b.isPrefix) return a.isPrefix ? -1 : 1;
      return a.symbol.name.localeCompare(b.symbol.name);
    });

    return scored.slice(0, MAX_RESULTS).map((s) => s.symbol);
  }
}
