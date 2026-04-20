import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticTokensHandler } from '../semantic-tokens.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry, TagEntry } from '../../parser/types.js';

function makeWikiLink(target: string, line: number, char: number): WikiLinkEntry {
  const raw = `[[${target}]]`;
  return {
    raw,
    target,
    range: {
      start: { line, character: char },
      end: { line, character: char + raw.length },
    },
  };
}

function makeTag(tag: string, line: number, char: number): TagEntry {
  return {
    tag,
    range: {
      start: { line, character: char },
      end: { line, character: char + tag.length },
    },
  };
}

function makeDoc(uri: string, overrides: Partial<OFMDoc['index']> = {}): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      ...overrides,
    },
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('SemanticTokensHandler', () => {
  let parseCache: ParseCache;
  let handler: SemanticTokensHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    handler = new SemanticTokensHandler(parseCache);
  });

  it('returns empty data array for empty document', () => {
    const doc = makeDoc(DOC_URI);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    expect(result).toBeDefined();
    expect(result!.data).toEqual([]);
  });

  it('returns null when doc not in cache', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } });
    expect(result).toBeNull();
  });

  it('encodes wiki-link token with type index 0 (string)', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('target', 0, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data.length).toBeGreaterThanOrEqual(5);
    // First token: [deltaLine, deltaStartChar, length, tokenTypeIndex, tokenModifiersEncoded]
    // tokenTypeIndex for wiki-link = 0 (string)
    expect(result!.data[3]).toBe(0);
  });

  it('encodes tag token with type index 1 (keyword)', () => {
    const doc = makeDoc(DOC_URI, {
      tags: [makeTag('#todo', 2, 5)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data.length).toBeGreaterThanOrEqual(5);
    // tokenTypeIndex for tag = 1 (keyword)
    expect(result!.data[3]).toBe(1);
  });

  it('uses delta encoding correctly for multiple tokens', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('first', 0, 0), makeWikiLink('second', 0, 20)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    // Should have 10 integers (2 tokens × 5 each)
    expect(result!.data).toHaveLength(10);
    // First token: deltaLine=0, deltaStartChar=0
    expect(result!.data[0]).toBe(0);
    expect(result!.data[1]).toBe(0);
    // Second token: deltaLine=0, deltaStartChar = 20 - 0 = 20
    expect(result!.data[5]).toBe(0); // same line
    expect(result!.data[6]).toBe(20); // delta from position 0
  });

  it('encodes declaration modifier (bit 0) for wiki-links', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('target', 1, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    // tokenModifiersEncoded for declaration = 1 << 0 = 1
    expect(result!.data[4]).toBe(1);
  });

  it('tag tokens have 0 modifier bits', () => {
    const doc = makeDoc(DOC_URI, {
      tags: [makeTag('#todo', 0, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data[4]).toBe(0);
  });
});
