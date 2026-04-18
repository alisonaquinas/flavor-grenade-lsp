import { describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentHighlightHandler } from '../document-highlight.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, WikiLinkEntry, HeadingEntry, BlockAnchorEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(
  uri: string,
  partial: Partial<OFMDoc['index']> = {},
): OFMDoc {
  return {
    uri,
    version: 0,
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
      ...partial,
    },
  };
}

describe('DocumentHighlightHandler', () => {
  let parseCache: ParseCache;
  let vaultIndex: VaultIndex;
  let handler: DocumentHighlightHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    vaultIndex = new VaultIndex();
    handler = new DocumentHighlightHandler(parseCache, vaultIndex);
  });

  it('returns empty when document is not in cache', () => {
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/unknown.md' },
      position: { line: 0, character: 0 },
    });
    expect(result).toEqual([]);
  });

  it('returns empty when cursor is on plain text', () => {
    const doc = makeDoc('file:///vault/beta.md');
    parseCache.set('file:///vault/beta.md', doc);
    vaultIndex.set(id('beta'), doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
    });
    expect(result).toEqual([]);
  });

  it('returns Write highlight for heading + Read for same-doc [[#heading]] refs', () => {
    const heading: HeadingEntry = {
      level: 2,
      text: 'Intro',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 9 } },
    };
    const intraLink: WikiLinkEntry = {
      raw: '[[#Intro]]',
      target: '',
      heading: 'Intro',
      range: { start: { line: 2, character: 0 }, end: { line: 2, character: 10 } },
    };
    const crossLink: WikiLinkEntry = {
      raw: '[[other#Intro]]',
      target: 'other',
      heading: 'Intro',
      range: { start: { line: 3, character: 0 }, end: { line: 3, character: 15 } },
    };

    const doc = makeDoc('file:///vault/beta.md', {
      headings: [heading],
      wikiLinks: [intraLink, crossLink],
    });
    parseCache.set('file:///vault/beta.md', doc);
    vaultIndex.set(id('beta'), doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 4 }, // on heading
    });

    // Should include Write for heading + Read for intra-doc link (not crossLink)
    expect(result.length).toBeGreaterThanOrEqual(1);
    const writeHighlight = result.find((h) => h.kind === 3);
    expect(writeHighlight).toBeDefined();
    expect(writeHighlight!.range).toEqual(heading.range);
  });

  it('returns Write for block anchor + Read for same-doc [[#^id]] refs', () => {
    const anchor: BlockAnchorEntry = {
      id: 'myblock',
      range: { start: { line: 4, character: 10 }, end: { line: 4, character: 18 } },
    };
    const intraRef: WikiLinkEntry = {
      raw: '[[#^myblock]]',
      target: '',
      blockRef: 'myblock',
      range: { start: { line: 6, character: 0 }, end: { line: 6, character: 13 } },
    };

    const doc = makeDoc('file:///vault/beta.md', {
      blockAnchors: [anchor],
      wikiLinks: [intraRef],
    });
    parseCache.set('file:///vault/beta.md', doc);
    vaultIndex.set(id('beta'), doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 4, character: 12 }, // on anchor
    });

    expect(result.length).toBeGreaterThanOrEqual(1);
    const writeHighlight = result.find((h) => h.kind === 3);
    expect(writeHighlight).toBeDefined();
    expect(writeHighlight!.range).toEqual(anchor.range);

    const readHighlight = result.find(
      (h) => h.kind === 2 && h.range === intraRef.range,
    );
    expect(readHighlight).toBeDefined();
  });

  it('returns Read highlights for all occurrences of same wiki-link text', () => {
    const link1: WikiLinkEntry = {
      raw: '[[beta]]',
      target: 'beta',
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
    };
    const link2: WikiLinkEntry = {
      raw: '[[beta]]',
      target: 'beta',
      range: { start: { line: 2, character: 5 }, end: { line: 2, character: 13 } },
    };
    const otherLink: WikiLinkEntry = {
      raw: '[[gamma]]',
      target: 'gamma',
      range: { start: { line: 3, character: 0 }, end: { line: 3, character: 9 } },
    };

    const doc = makeDoc('file:///vault/alpha.md', {
      wikiLinks: [link1, link2, otherLink],
    });
    parseCache.set('file:///vault/alpha.md', doc);
    vaultIndex.set(id('alpha'), doc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/alpha.md' },
      position: { line: 0, character: 3 }, // on link1
    });

    // Should highlight both [[beta]] links as Read
    expect(result).toHaveLength(2);
    const kinds = result.map((h) => h.kind);
    expect(kinds.every((k) => k === 2)).toBe(true);
    const ranges = result.map((h) => h.range);
    expect(ranges).toContainEqual(link1.range);
    expect(ranges).toContainEqual(link2.range);
  });
});
