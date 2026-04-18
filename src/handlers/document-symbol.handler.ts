import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { HeadingEntry } from '../parser/types.js';

const SYMBOL_KIND_MODULE = 2;  // SymbolKind.Module (used for headings)
const SYMBOL_KIND_KEY = 20;    // SymbolKind.Key (used for block anchors)

interface DocumentSymbol {
  name: string;
  kind: number;
  range: Range;
  selectionRange: Range;
  children?: DocumentSymbol[];
}

/**
 * Handles `textDocument/documentSymbol` requests.
 *
 * Builds a hierarchical tree of {@link DocumentSymbol} from the document's
 * headings and block anchors:
 *
 * - H1 headings become top-level symbols.
 * - H2 headings are nested under their parent H1.
 * - H3 headings are nested under their parent H2, and so on.
 * - Block anchors are leaf nodes placed in the section of the heading they fall under.
 */
@Injectable()
export class DocumentSymbolHandler {
  constructor(private readonly parseCache: ParseCache) {}

  handle(params: { textDocument: { uri: string } }): DocumentSymbol[] {
    const doc = this.parseCache.get(params.textDocument.uri);
    if (doc === undefined) return [];

    const headings = doc.index.headings;
    const anchors = doc.index.blockAnchors;

    if (headings.length === 0 && anchors.length === 0) return [];

    // Build heading symbols with nesting
    const roots: DocumentSymbol[] = [];
    // Stack keeps track of the current path at each level (level → symbol)
    const stack: Array<{ level: number; symbol: DocumentSymbol }> = [];

    for (const heading of headings) {
      const sym: DocumentSymbol = {
        name: heading.text,
        kind: SYMBOL_KIND_MODULE,
        range: heading.range,
        selectionRange: heading.range,
        children: [],
      };

      // Pop stack entries that are at the same or deeper level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(sym);
      } else {
        const parent = stack[stack.length - 1].symbol;
        if (parent.children === undefined) parent.children = [];
        parent.children.push(sym);
      }

      stack.push({ level: heading.level, symbol: sym });
    }

    // Place block anchors into their heading section
    if (anchors.length > 0) {
      for (const anchor of anchors) {
        const anchorLine = anchor.range.start.line;

        // Find the heading section this anchor belongs to
        const parentSym = this.findParentSection(headings, anchorLine, roots, stack);
        if (parentSym !== null) {
          if (parentSym.children === undefined) parentSym.children = [];
          parentSym.children.push({
            name: anchor.id,
            kind: SYMBOL_KIND_KEY,
            range: anchor.range,
            selectionRange: anchor.range,
          });
        }
      }
    }

    return roots;
  }

  /**
   * Find the DocumentSymbol that "owns" a given line number.
   * The owner is the last heading whose start line <= anchorLine.
   */
  private findParentSection(
    headings: HeadingEntry[],
    anchorLine: number,
    roots: DocumentSymbol[],
    _stack: Array<{ level: number; symbol: DocumentSymbol }>,
  ): DocumentSymbol | null {
    // Find the last heading before the anchor line
    let lastHeadingIdx = -1;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].range.start.line <= anchorLine) {
        lastHeadingIdx = i;
      } else {
        break;
      }
    }

    if (lastHeadingIdx === -1) return null;

    // Find the corresponding DocumentSymbol by traversing the tree
    const targetHeading = headings[lastHeadingIdx];
    return this.findSymbolByName(roots, targetHeading.text);
  }

  private findSymbolByName(symbols: DocumentSymbol[], name: string): DocumentSymbol | null {
    for (const sym of symbols) {
      if (sym.name === name) return sym;
      if (sym.children !== undefined) {
        const found = this.findSymbolByName(sym.children, name);
        if (found !== null) return found;
      }
    }
    return null;
  }
}
