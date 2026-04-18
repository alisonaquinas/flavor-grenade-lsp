import { describe, it, expect, beforeEach } from '@jest/globals';
import { PrepareRenameHandler } from '../prepare-rename.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, HeadingEntry, WikiLinkEntry, OpaqueRegion } from '../../parser/types.js';

const POS = (line: number, character: number) => ({ line, character });
const RANGE = (sl: number, sc: number, el: number, ec: number) => ({
  start: { line: sl, character: sc },
  end: { line: el, character: ec },
});

function makeDoc(overrides: Partial<OFMDoc> = {}): OFMDoc {
  return {
    uri: 'file:///vault/test.md',
    version: 1,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
    },
    ...overrides,
  };
}

describe('PrepareRenameHandler', () => {
  let parseCache: ParseCache;
  let handler: PrepareRenameHandler;
  const uri = 'file:///vault/test.md';

  beforeEach(() => {
    parseCache = new ParseCache();
    handler = new PrepareRenameHandler(parseCache);
  });

  it('returns null when document is not in cache', () => {
    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 5),
    });
    expect(result).toBeNull();
  });

  it('returns heading text range and placeholder when cursor is on heading', () => {
    // "## My Heading"
    // Full range: line 0, chars 0-13
    // Text range after "## ": chars 3-13
    const heading: HeadingEntry = {
      level: 2,
      text: 'My Heading',
      range: RANGE(0, 0, 0, 13),
    };
    const doc = makeDoc({ uri, index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [heading] } });
    parseCache.set(uri, doc);

    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 5),
    });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('error');
    const r = result as { range: { start: { line: number; character: number }; end: { line: number; character: number } }; placeholder: string };
    expect(r.placeholder).toBe('My Heading');
    // heading text range starts after "## " (level=2, so 2 # chars + 1 space = 3 chars)
    expect(r.range.start.character).toBe(3);
    expect(r.range.end.character).toBe(13);
  });

  it('returns heading text range for h1 (1 # char + space)', () => {
    const heading: HeadingEntry = {
      level: 1,
      text: 'Title',
      range: RANGE(0, 0, 0, 7),
    };
    const doc = makeDoc({ uri, index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [heading] } });
    parseCache.set(uri, doc);

    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 3),
    }) as { range: { start: { character: number } }; placeholder: string } | null;

    expect(result).not.toBeNull();
    expect(result!.placeholder).toBe('Title');
    // "# Title" → text starts at char 2 (1 # + 1 space)
    expect(result!.range.start.character).toBe(2);
  });

  it('returns wiki-link range and placeholder when cursor is on wiki-link', () => {
    const wikiLink: WikiLinkEntry = {
      raw: '[[beta]]',
      target: 'beta',
      range: RANGE(0, 5, 0, 13),
    };
    const doc = makeDoc({ uri, index: { wikiLinks: [wikiLink], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] } });
    parseCache.set(uri, doc);

    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 8),
    });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('error');
    const r = result as { range: unknown; placeholder: string };
    expect(r.placeholder).toBe('beta');
    expect(r.range).toEqual(wikiLink.range);
  });

  it('returns error when cursor is inside an opaque region (code block)', () => {
    // Opaque region covers offsets 0–50 (entire first few lines)
    // position line 0, char 5 → offset 5 is inside region [0, 50)
    const opaqueRegion: OpaqueRegion = { kind: 'code', start: 0, end: 50 };
    // We need the doc text to compute offset. Position (0, 5) = offset 5 (within region).
    // We'll use a doc where the text would be inside the region.
    // Since PrepareRenameHandler uses positionToOffset internally, we need the text.
    // The doc uri text would be fetched from parseCache. Let's make the doc with a code opaque region
    // covering the position line 0, char 5.
    // positionToOffset for (0, 5) = 5 (line 0 has 5 chars before position)
    const doc = makeDoc({
      uri,
      opaqueRegions: [opaqueRegion],
      index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
    });
    parseCache.set(uri, doc);

    // We need doc text for positionToOffset. The handler needs text from somewhere.
    // Looking at the implementation spec: positionToOffset(text, position) — text comes from OFMDoc
    // Actually OFMDoc doesn't have text. Let's check if handler needs to store text separately...
    // The handler gets the doc from parseCache and checks opaqueRegions.
    // positionToOffset needs actual text. But OFMDoc doesn't carry the raw text.
    // The handler likely uses a simpler approach: offset = sum of line lengths or
    // uses position.line * some_constant. Let's check what the spec says:
    // "positionToOffset(text, position): sum lengths of lines 0..position.line (each +1 for \n), then add position.character"
    // Since we don't have text in OFMDoc, we may need to track text separately,
    // or the handler uses ParseCache and DocumentStore...
    // For testing, opaque region start=0, end=50.
    // For position (0, 5): offset = 0 (line 0) + 5 = 5. This is within [0, 50).
    // The handler will need text to compute offset. We'll store text in a way that
    // makes position (0, 5) = offset 5. A text like "```\ncode here\n```" would work.
    // But since OFMDoc doesn't carry text, the handler must have another way.
    // Let's assume the handler stores text in a separate map or uses a simple calculation.
    // We'll test it after seeing the implementation. For now, let's create the test.
    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 5),
    });

    // Inside opaque region → error
    expect(result).not.toBeNull();
    const r = result as { error?: { code: number; message: string } };
    expect(r.error).toBeDefined();
    expect(r.error!.code).toBe(-32602);
  });

  it('returns null when cursor is not on any entity', () => {
    const doc = makeDoc({ uri });
    parseCache.set(uri, doc);

    const result = handler.handle({
      textDocument: { uri },
      position: POS(0, 5),
    });

    expect(result).toBeNull();
  });
});
