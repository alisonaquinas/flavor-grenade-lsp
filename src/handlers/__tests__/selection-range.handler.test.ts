import { describe, expect, it, beforeEach } from '@jest/globals';
import type { Range, SelectionRange } from 'vscode-languageserver-types';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { SelectionRangeHandler } from '../selection-range.handler.js';

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
    handler = new SelectionRangeHandler(parseCache);
  });

  it('returns no selection ranges when the document is not cached', () => {
    expect(
      handler.handle({
        textDocument: { uri: 'file:///vault/missing.md' },
        positions: [{ line: 0, character: 0 }],
      }),
    ).toEqual([]);
  });

  it('rejects invalid positions without returning partial results', () => {
    const doc = parser.parse('file:///vault/notes/selection.md', '# Project', 1);
    parseCache.set(doc.uri, doc);

    expect(() =>
      handler.handle({
        textDocument: { uri: doc.uri },
        positions: [
          { line: 0, character: 0 },
          { line: -1, character: 0 },
        ],
      }),
    ).toThrow('Invalid selectionRange position');

    expect(() =>
      handler.handle({
        textDocument: { uri: doc.uri },
        positions: [
          { line: -1, character: 0 },
          { line: 0, character: 99 },
        ],
      }),
    ).toThrow('Invalid selectionRange position');
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
    });

    expect(chainRanges(result[0])).toEqual([
      doc.index.wikiLinks[0].range,
      range(1, 0, 1, lines[1].length),
      range(0, 0, 2, 0),
      range(0, 0, 4, lines[4].length),
    ]);
  });

  it('does not expand selections outside Templater opaque regions', () => {
    const lines = ['# Project', '<%*', 'const title = tp.file.title;', '%>', 'After'];
    const doc = parser.parse('file:///vault/notes/templater.md', lines.join('\n'), 1);
    parseCache.set(doc.uri, doc);

    const result = handler.handle({
      textDocument: { uri: doc.uri },
      positions: [{ line: 2, character: 8 }],
    });

    expect(chainRanges(result[0])).toEqual([range(1, 0, 3, 2)]);
  });

  it('finds opaque regions at CRLF line starts', () => {
    const lines = ['# Project', '<%*', 'const title = tp.file.title;', '%>', 'After'];
    const doc = parser.parse('file:///vault/notes/templater-crlf.md', lines.join('\r\n'), 1);
    parseCache.set(doc.uri, doc);

    const result = handler.handle({
      textDocument: { uri: doc.uri },
      positions: [{ line: 1, character: 0 }],
    });

    expect(chainRanges(result[0])).toEqual([range(1, 0, 3, 2)]);
  });
});
