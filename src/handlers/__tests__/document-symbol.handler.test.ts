import { describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentSymbolHandler } from '../document-symbol.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, HeadingEntry, BlockAnchorEntry } from '../../parser/types.js';

function makeHeading(text: string, level: number, line: number): HeadingEntry {
  const prefix = '#'.repeat(level);
  return {
    level,
    text,
    range: {
      start: { line, character: 0 },
      end: { line, character: prefix.length + 1 + text.length },
    },
  };
}

function makeAnchor(anchorId: string, line: number): BlockAnchorEntry {
  return {
    id: anchorId,
    range: { start: { line, character: 0 }, end: { line, character: anchorId.length + 1 } },
  };
}

function makeDoc(uri: string, headings: HeadingEntry[], blockAnchors: BlockAnchorEntry[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: { wikiLinks: [], embeds: [], blockAnchors, tags: [], callouts: [], headings },
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('DocumentSymbolHandler', () => {
  let parseCache: ParseCache;
  let handler: DocumentSymbolHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    handler = new DocumentSymbolHandler(parseCache);
  });

  it('returns empty array when doc not in cache', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } });
    expect(result).toHaveLength(0);
  });

  it('returns top-level symbols for H1 headings', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Chapter One', 1, 0)]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chapter One');
    expect(result[0].range).toBeDefined();
    expect(result[0].selectionRange).toBeDefined();
  });

  it('nests H2 under H1', () => {
    const doc = makeDoc(DOC_URI, [
      makeHeading('Chapter One', 1, 0),
      makeHeading('Section 1.1', 2, 2),
      makeHeading('Section 1.2', 2, 4),
    ]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1); // Only 1 top-level H1
    expect(result[0].name).toBe('Chapter One');
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children![0].name).toBe('Section 1.1');
    expect(result[0].children![1].name).toBe('Section 1.2');
  });

  it('nests H3 under H2 under H1', () => {
    const doc = makeDoc(DOC_URI, [
      makeHeading('Chapter One', 1, 0),
      makeHeading('Section', 2, 2),
      makeHeading('Subsection', 3, 4),
    ]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1);
    const h1 = result[0];
    expect(h1.children).toHaveLength(1);
    const h2 = h1.children![0];
    expect(h2.name).toBe('Section');
    expect(h2.children).toHaveLength(1);
    expect(h2.children![0].name).toBe('Subsection');
  });

  it('adds block anchors as leaf children in their heading section', () => {
    const anchors = [makeAnchor('my-anchor', 3)];
    const doc = makeDoc(
      DOC_URI,
      [
        makeHeading('Section', 2, 0),
        makeHeading('Another', 2, 5),
      ],
      anchors,
    );
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    // The anchor on line 3 falls between heading on line 0 and heading on line 5
    const sectionSymbol = result.find((s) => s.name === 'Section');
    expect(sectionSymbol).toBeDefined();
    const anchorChild = sectionSymbol!.children?.find((c) => c.name === 'my-anchor');
    expect(anchorChild).toBeDefined();
    expect(anchorChild!.kind).toBe(20); // SymbolKind.Key
  });

  it('returns empty array when doc has no headings and no anchors', () => {
    const doc = makeDoc(DOC_URI, []);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    expect(result).toHaveLength(0);
  });
});
