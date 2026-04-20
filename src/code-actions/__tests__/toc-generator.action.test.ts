import { describe, it, expect, beforeEach } from '@jest/globals';
import { TocGeneratorAction } from '../toc-generator.action.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, HeadingEntry } from '../../parser/types.js';

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

function makeDoc(uri: string, text: string, headings: HeadingEntry[]): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text,
    index: { wikiLinks: [], embeds: [], blockAnchors: [], tags: [], callouts: [], headings },
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('TocGeneratorAction', () => {
  let parseCache: ParseCache;
  let action: TocGeneratorAction;

  beforeEach(() => {
    parseCache = new ParseCache();
    action = new TocGeneratorAction(parseCache);
  });

  it('returns null when document has no headings', () => {
    const doc = makeDoc(DOC_URI, '# Doc\nNo content headings here.', []);
    parseCache.set(DOC_URI, doc);

    const result = action.handle({
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    });

    expect(result).toBeNull();
  });

  it('inserts TOC after first heading when no existing TOC', () => {
    const text = '# My Doc\n\n## Introduction\n\n## Getting Started\n';
    const headings = [
      makeHeading('My Doc', 1, 0),
      makeHeading('Introduction', 2, 2),
      makeHeading('Getting Started', 2, 4),
    ];
    const doc = makeDoc(DOC_URI, text, headings);
    parseCache.set(DOC_URI, doc);

    const result = action.handle({
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    });

    expect(result).not.toBeNull();
    expect(result!.title).toBe('Generate Table of Contents');
    expect(result!.kind).toBe('source.fg.toc');
    expect(result!.edit).toBeDefined();

    // The edit should include TOC content
    const changes = result!.edit!.changes!;
    const edits = changes[DOC_URI];
    expect(edits).toBeDefined();
    expect(edits.length).toBeGreaterThan(0);
    const tocText = edits[0].newText;
    expect(tocText).toContain('Table of Contents');
    expect(tocText).toContain('Introduction');
    expect(tocText).toContain('Getting Started');
  });

  it('replaces existing TOC block', () => {
    const text = [
      '# My Doc',
      '',
      '## Table of Contents',
      '- [[#Old Section]]',
      '',
      '## Introduction',
      '',
      '## New Section',
    ].join('\n');

    const headings = [
      makeHeading('My Doc', 1, 0),
      makeHeading('Table of Contents', 2, 2),
      makeHeading('Introduction', 2, 5),
      makeHeading('New Section', 2, 7),
    ];
    const doc = makeDoc(DOC_URI, text, headings);
    parseCache.set(DOC_URI, doc);

    const result = action.handle({
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    });

    expect(result).not.toBeNull();
    expect(result!.title).toBe('Replace Table of Contents');
    expect(result!.edit).toBeDefined();

    const changes = result!.edit!.changes!;
    const edits = changes[DOC_URI];
    expect(edits).toBeDefined();
    // Should contain newly generated TOC
    const tocText = edits[0].newText;
    expect(tocText).toContain('Introduction');
    expect(tocText).toContain('New Section');
  });

  it('returns null when doc not in cache', () => {
    const result = action.handle({
      textDocument: { uri: 'file:///vault/missing.md' },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    });

    expect(result).toBeNull();
  });

  it('skips H1 in TOC content', () => {
    const text = '# Title\n\n## Section One\n\n### Sub Section\n';
    const headings = [
      makeHeading('Title', 1, 0),
      makeHeading('Section One', 2, 2),
      makeHeading('Sub Section', 3, 4),
    ];
    const doc = makeDoc(DOC_URI, text, headings);
    parseCache.set(DOC_URI, doc);

    const result = action.handle({
      textDocument: { uri: DOC_URI },
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
      context: { diagnostics: [] },
    });

    expect(result).not.toBeNull();
    const changes = result!.edit!.changes![DOC_URI];
    const tocText = changes[0].newText;
    // Title (H1) should not appear as TOC entry
    expect(tocText).not.toMatch(/\[\[#Title\]\]/);
    // H2 and H3 should appear
    expect(tocText).toContain('Section One');
    expect(tocText).toContain('Sub Section');
  });
});
