import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import type { Range } from 'vscode-languageserver-types';
import { ParseCache } from '../parser/parser.module.js';
import type { HeadingEntry } from '../parser/types.js';

const SYMBOL_KIND_MODULE = 2; // SymbolKind.Module (used for headings)
const SYMBOL_KIND_KEY = 20; // SymbolKind.Key (used for block anchors)
const SYMBOL_KIND_ARRAY = 18; // SymbolKind.Array (used for table regions)
const SYMBOL_KIND_BOOLEAN = 17; // SymbolKind.Boolean (used for task items)
const SYMBOL_KIND_STRING = 15; // SymbolKind.String (used for inline flavor markers)

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
    const gfmTables = doc.index.gfmTables ?? [];
    const gfmTasks = doc.index.gfmTaskListItems ?? [];
    const glfmDescriptionLists = doc.index.glfmDescriptionLists ?? [];
    const glfmTocTags = doc.index.glfmTocTags ?? [];
    const pandocTitleBlocks = doc.index.pandocTitleBlocks ?? [];
    const pandocAttributes = doc.index.pandocAttributes ?? [];
    const pandocFootnotes = doc.index.pandocFootnotes ?? [];
    const multimarkdownMetadata = doc.index.multimarkdownMetadata ?? [];
    const multimarkdownLabels = doc.index.multimarkdownLabels ?? [];
    const multimarkdownCitations = doc.index.multimarkdownCitations ?? [];
    const multimarkdownFootnotes = doc.index.multimarkdownFootnotes ?? [];
    const mdxEsmDeclarations = doc.index.mdxEsmDeclarations ?? [];
    const mdxJsxElements = doc.index.mdxJsxElements ?? [];
    const mdxExpressions = doc.index.mdxExpressions ?? [];
    const kramdownAttributes = doc.index.kramdownAttributes ?? [];
    const kramdownDefinitionLists = doc.index.kramdownDefinitionLists ?? [];
    const kramdownTables = doc.index.kramdownTables ?? [];
    const kramdownFootnotes = doc.index.kramdownFootnotes ?? [];

    if (
      headings.length === 0 &&
      anchors.length === 0 &&
      gfmTables.length === 0 &&
      gfmTasks.length === 0 &&
      glfmDescriptionLists.length === 0 &&
      glfmTocTags.length === 0 &&
      pandocTitleBlocks.length === 0 &&
      pandocAttributes.length === 0 &&
      pandocFootnotes.length === 0 &&
      multimarkdownMetadata.length === 0 &&
      multimarkdownLabels.length === 0 &&
      multimarkdownCitations.length === 0 &&
      multimarkdownFootnotes.length === 0 &&
      mdxEsmDeclarations.length === 0 &&
      mdxJsxElements.length === 0 &&
      mdxExpressions.length === 0 &&
      kramdownAttributes.length === 0 &&
      kramdownDefinitionLists.length === 0 &&
      kramdownTables.length === 0 &&
      kramdownFootnotes.length === 0
    )
      return [];

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

    for (const table of gfmTables) {
      const symbol: DocumentSymbol = {
        name: `GFM table: ${table.headerCells.join(', ')}`,
        kind: SYMBOL_KIND_ARRAY,
        range: table.range,
        selectionRange: table.range,
      };
      this.addSymbolAtLine(symbol, table.range.start.line, headings, roots);
    }

    for (const task of gfmTasks) {
      const symbol: DocumentSymbol = {
        name: `Task: ${task.text}`,
        kind: SYMBOL_KIND_BOOLEAN,
        range: task.range,
        selectionRange: task.markerRange,
      };
      this.addSymbolAtLine(symbol, task.range.start.line, headings, roots);
    }

    for (const list of glfmDescriptionLists) {
      const symbol: DocumentSymbol = {
        name: `Description: ${list.term}`,
        kind: SYMBOL_KIND_ARRAY,
        range: list.range,
        selectionRange: list.range,
      };
      this.addSymbolAtLine(symbol, list.range.start.line, headings, roots);
    }

    for (const toc of glfmTocTags) {
      const symbol: DocumentSymbol = {
        name: 'GitLab table of contents',
        kind: SYMBOL_KIND_STRING,
        range: toc.range,
        selectionRange: toc.range,
      };
      this.addSymbolAtLine(symbol, toc.range.start.line, headings, roots);
    }

    for (const block of pandocTitleBlocks) {
      roots.unshift({
        name: 'Pandoc metadata',
        kind: SYMBOL_KIND_STRING,
        range: block.range,
        selectionRange: block.range,
      });
    }

    for (const attribute of pandocAttributes) {
      if (attribute.id === undefined) continue;
      const symbol: DocumentSymbol = {
        name: `Pandoc label: ${attribute.id}`,
        kind: SYMBOL_KIND_KEY,
        range: attribute.range,
        selectionRange: attribute.range,
      };
      this.addSymbolAtLine(symbol, attribute.range.start.line, headings, roots);
    }

    for (const footnote of pandocFootnotes) {
      const symbol: DocumentSymbol = {
        name: `Footnote: ${footnote.label}`,
        kind: SYMBOL_KIND_KEY,
        range: footnote.range,
        selectionRange: footnote.labelRange,
      };
      this.addSymbolAtLine(symbol, footnote.range.start.line, headings, roots);
    }

    if (multimarkdownMetadata.length > 0) {
      const first = multimarkdownMetadata[0];
      const last = multimarkdownMetadata[multimarkdownMetadata.length - 1];
      roots.unshift({
        name: 'MultiMarkdown metadata',
        kind: SYMBOL_KIND_STRING,
        range: { start: first.range.start, end: last.range.end },
        selectionRange: first.keyRange,
      });
    }

    for (const label of multimarkdownLabels) {
      const symbol: DocumentSymbol = {
        name: `MultiMarkdown label: ${label.label}`,
        kind: SYMBOL_KIND_KEY,
        range: label.range,
        selectionRange: label.labelRange,
      };
      this.addSymbolAtLine(symbol, label.range.start.line, headings, roots);
    }

    for (const citation of multimarkdownCitations) {
      const symbol: DocumentSymbol = {
        name: `Citation: ${citation.key}`,
        kind: SYMBOL_KIND_KEY,
        range: citation.range,
        selectionRange: citation.keyRange,
      };
      this.addSymbolAtLine(symbol, citation.range.start.line, headings, roots);
    }

    for (const footnote of multimarkdownFootnotes) {
      const symbol: DocumentSymbol = {
        name: `Footnote: ${footnote.label}`,
        kind: SYMBOL_KIND_KEY,
        range: footnote.range,
        selectionRange: footnote.labelRange,
      };
      this.addSymbolAtLine(symbol, footnote.range.start.line, headings, roots);
    }

    for (const declaration of mdxEsmDeclarations) {
      const symbol: DocumentSymbol = {
        name: `MDX ${declaration.kind}: ${declaration.name}`,
        kind: SYMBOL_KIND_STRING,
        range: declaration.range,
        selectionRange: declaration.nameRange,
      };
      this.addSymbolAtLine(symbol, declaration.range.start.line, headings, roots);
    }

    for (const element of mdxJsxElements) {
      const symbol: DocumentSymbol = {
        name: `MDX component: ${element.name}`,
        kind: SYMBOL_KIND_MODULE,
        range: element.range,
        selectionRange: element.nameRange,
      };
      this.addSymbolAtLine(symbol, element.range.start.line, headings, roots);
    }

    for (const expression of mdxExpressions) {
      const symbol: DocumentSymbol = {
        name: 'MDX expression',
        kind: SYMBOL_KIND_STRING,
        range: expression.range,
        selectionRange: expression.range,
      };
      this.addSymbolAtLine(symbol, expression.range.start.line, headings, roots);
    }

    for (const attribute of kramdownAttributes) {
      const label =
        attribute.id !== undefined
          ? attribute.id
          : attribute.classes.length > 0
            ? `.${attribute.classes[0]}`
            : undefined;
      if (label === undefined) continue;
      const symbol: DocumentSymbol = {
        name: `kramdown attribute: ${label}`,
        kind: SYMBOL_KIND_KEY,
        range: attribute.range,
        selectionRange: attribute.markerRange,
      };
      this.addSymbolAtLine(symbol, attribute.range.start.line, headings, roots);
    }

    for (const list of kramdownDefinitionLists) {
      const symbol: DocumentSymbol = {
        name: `Definition: ${list.term}`,
        kind: SYMBOL_KIND_ARRAY,
        range: list.range,
        selectionRange: list.range,
      };
      this.addSymbolAtLine(symbol, list.range.start.line, headings, roots);
    }

    for (const table of kramdownTables) {
      const symbol: DocumentSymbol = {
        name: `kramdown table: ${table.headerCells.join(', ')}`,
        kind: SYMBOL_KIND_ARRAY,
        range: table.range,
        selectionRange: table.range,
      };
      this.addSymbolAtLine(symbol, table.range.start.line, headings, roots);
    }

    for (const footnote of kramdownFootnotes) {
      const symbol: DocumentSymbol = {
        name: `Footnote: ${footnote.label}`,
        kind: SYMBOL_KIND_KEY,
        range: footnote.range,
        selectionRange: footnote.labelRange,
      };
      this.addSymbolAtLine(symbol, footnote.range.start.line, headings, roots);
    }

    return roots;
  }

  private addSymbolAtLine(
    symbol: DocumentSymbol,
    line: number,
    headings: HeadingEntry[],
    roots: DocumentSymbol[],
  ): void {
    const parentSym = this.findParentSection(headings, line, roots, []);
    if (parentSym === null) {
      roots.push(symbol);
      return;
    }
    if (parentSym.children === undefined) parentSym.children = [];
    parentSym.children.push(symbol);
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
