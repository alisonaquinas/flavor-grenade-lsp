import { describe, it, expect } from '@jest/globals';
import { entityAtPosition } from '../cursor-entity.js';
import type { OFMDoc } from '../../parser/types.js';

function makeDoc(partial: Partial<OFMDoc['index']> = {}): OFMDoc {
  return {
    uri: 'file:///vault/test.md',
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      ...partial,
    },
  };
}

describe('entityAtPosition', () => {
  it('returns none when doc has no entities', () => {
    const doc = makeDoc();
    const result = entityAtPosition(doc, { line: 0, character: 0 });
    expect(result.kind).toBe('none');
  });

  it('returns none when cursor is outside all entities', () => {
    const doc = makeDoc({
      wikiLinks: [
        {
          raw: '[[beta]]',
          target: 'beta',
          range: { start: { line: 0, character: 10 }, end: { line: 0, character: 18 } },
        },
      ],
    });
    const result = entityAtPosition(doc, { line: 0, character: 5 });
    expect(result.kind).toBe('none');
  });

  it('identifies a wiki-link entity', () => {
    const entry = {
      raw: '[[beta]]',
      target: 'beta',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
    };
    const doc = makeDoc({ wikiLinks: [entry] });
    const result = entityAtPosition(doc, { line: 0, character: 3 });
    expect(result.kind).toBe('wiki-link');
    if (result.kind === 'wiki-link') {
      expect(result.entry).toBe(entry);
    }
  });

  it('identifies an embed entity', () => {
    const entry = {
      raw: '![[img.png]]',
      target: 'img.png',
      range: { start: { line: 1, character: 0 }, end: { line: 1, character: 12 } },
    };
    const doc = makeDoc({ embeds: [entry] });
    const result = entityAtPosition(doc, { line: 1, character: 5 });
    expect(result.kind).toBe('embed');
    if (result.kind === 'embed') {
      expect(result.entry).toBe(entry);
    }
  });

  it('identifies a tag entity', () => {
    const entry = {
      tag: '#mytag',
      range: { start: { line: 2, character: 4 }, end: { line: 2, character: 10 } },
    };
    const doc = makeDoc({ tags: [entry] });
    const result = entityAtPosition(doc, { line: 2, character: 6 });
    expect(result.kind).toBe('tag');
    if (result.kind === 'tag') {
      expect(result.entry).toBe(entry);
    }
  });

  it('identifies a heading entity', () => {
    const entry = {
      level: 2,
      text: 'Introduction',
      range: { start: { line: 3, character: 0 }, end: { line: 3, character: 16 } },
    };
    const doc = makeDoc({ headings: [entry] });
    const result = entityAtPosition(doc, { line: 3, character: 5 });
    expect(result.kind).toBe('heading');
    if (result.kind === 'heading') {
      expect(result.entry).toBe(entry);
    }
  });

  it('identifies a block-anchor entity', () => {
    const entry = {
      id: 'my-block',
      range: { start: { line: 4, character: 10 }, end: { line: 4, character: 19 } },
    };
    const doc = makeDoc({ blockAnchors: [entry] });
    const result = entityAtPosition(doc, { line: 4, character: 12 });
    expect(result.kind).toBe('block-anchor');
    if (result.kind === 'block-anchor') {
      expect(result.entry).toBe(entry);
    }
  });

  it('prefers wiki-link when ranges overlap', () => {
    const wikiEntry = {
      raw: '[[beta]]',
      target: 'beta',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
    };
    const headingEntry = {
      level: 1,
      text: 'beta',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
    };
    const doc = makeDoc({ wikiLinks: [wikiEntry], headings: [headingEntry] });
    const result = entityAtPosition(doc, { line: 0, character: 3 });
    expect(result.kind).toBe('wiki-link');
  });

  it('returns none when cursor is on line before entity', () => {
    const doc = makeDoc({
      tags: [
        {
          tag: '#foo',
          range: { start: { line: 5, character: 0 }, end: { line: 5, character: 4 } },
        },
      ],
    });
    const result = entityAtPosition(doc, { line: 4, character: 0 });
    expect(result.kind).toBe('none');
  });

  it('returns entity when cursor is at start of range', () => {
    const entry = {
      raw: '[[x]]',
      target: 'x',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
    };
    const doc = makeDoc({ wikiLinks: [entry] });
    expect(entityAtPosition(doc, { line: 0, character: 0 }).kind).toBe('wiki-link');
  });

  it('returns entity when cursor is at end of range', () => {
    const entry = {
      raw: '[[x]]',
      target: 'x',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
    };
    const doc = makeDoc({ wikiLinks: [entry] });
    expect(entityAtPosition(doc, { line: 0, character: 5 }).kind).toBe('wiki-link');
  });
});
