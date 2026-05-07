import { describe, expect, it, beforeEach } from '@jest/globals';
import type { Position, Range, SelectionRange } from 'vscode-languageserver-types';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { SelectionRangeHandler } from '../selection-range.handler.js';

interface SelectionRangeRequest {
  textDocument: { uri: string };
  positions: Position[];
}

type SelectionRangeHandlerCtor = new (parseCache: ParseCache) => SelectionRangeHandler;

function range(
  startLine: number,
  startCharacter: number,
  endLine: number,
  endCharacter: number,
): Range {
  return {
    start: { line: startLine, character: startCharacter },
    end: { line: endLine, character: endCharacter },
  };
}

function chainRanges(selectionRange: SelectionRange | undefined): Range[] {
  const ranges: Range[] = [];
  let current = selectionRange;

  while (current !== undefined) {
    ranges.push(current.range);
    current = current.parent;
  }

  return ranges;
}

describe('SelectionRangeHandler', () => {
  let parser: OFMParser;
  let parseCache: ParseCache;
  let handler: SelectionRangeHandler;

  beforeEach(() => {
    parser = new OFMParser();
    parseCache = new ParseCache();
    handler = new (SelectionRangeHandler as unknown as SelectionRangeHandlerCtor)(parseCache);
  });

  it('expands a cursor inside a wiki-link through paragraph, section, and document ranges', () => {
    const lines = [
      '# Project',
      'Intro has [[Target|alias]] and more text.',
      '',
      '## Later',
      'Next.',
    ];
    const doc = parser.parse('file:///vault/notes/selection.md', lines.join('\n'), 1);
    parseCache.set(doc.uri, doc);

    const cursor = {
      line: 1,
      character: lines[1].indexOf('Target') + 1,
    };

    const result = handler.handle({
      textDocument: { uri: doc.uri },
      positions: [cursor],
    } as Parameters<SelectionRangeHandler['handle']>[0] & SelectionRangeRequest);

    expect(chainRanges(result[0])).toEqual([
      doc.index.wikiLinks[0].range,
      range(1, 0, 1, lines[1].length),
      range(0, 0, 2, 0),
      range(0, 0, 4, lines[4].length),
    ]);
  });
});
