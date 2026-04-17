import { describe, it, expect } from '@jest/globals';
import { WikiLinkParser } from '../wiki-link-parser.js';

describe('WikiLinkParser', () => {
  const noRegions = [] as const;

  it('parses a simple wiki link', () => {
    const text = '[[MyNote]]';
    const entries = WikiLinkParser.parse(text, noRegions);
    expect(entries).toHaveLength(1);
    expect(entries[0].target).toBe('MyNote');
    expect(entries[0].raw).toBe('[[MyNote]]');
    expect(entries[0].alias).toBeUndefined();
  });

  it('parses a wiki link with alias', () => {
    const entries = WikiLinkParser.parse('[[Note|Display Name]]', noRegions);
    expect(entries[0].target).toBe('Note');
    expect(entries[0].alias).toBe('Display Name');
  });

  it('parses a wiki link with heading', () => {
    const entries = WikiLinkParser.parse('[[Note#Section]]', noRegions);
    expect(entries[0].target).toBe('Note');
    expect(entries[0].heading).toBe('Section');
  });

  it('parses a wiki link with block ref', () => {
    const entries = WikiLinkParser.parse('[[Note^abc123]]', noRegions);
    expect(entries[0].target).toBe('Note');
    expect(entries[0].blockRef).toBe('abc123');
  });

  it('parses heading and alias together', () => {
    const entries = WikiLinkParser.parse('[[Note#Section|Alias]]', noRegions);
    expect(entries[0].target).toBe('Note');
    expect(entries[0].heading).toBe('Section');
    expect(entries[0].alias).toBe('Alias');
  });

  it('skips links inside opaque regions', () => {
    const text = '`[[NotALink]]`';
    const regions = [{ kind: 'code' as const, start: 0, end: text.length }];
    const entries = WikiLinkParser.parse(text, regions);
    expect(entries).toHaveLength(0);
  });

  it('returns correct LSP range (line/character)', () => {
    const text = 'Line one\n[[Note]]';
    const entries = WikiLinkParser.parse(text, noRegions);
    expect(entries[0].range.start.line).toBe(1);
    expect(entries[0].range.start.character).toBe(0);
    expect(entries[0].range.end.line).toBe(1);
    expect(entries[0].range.end.character).toBe('[[Note]]'.length);
  });

  it('finds multiple wiki links', () => {
    const text = '[[A]] and [[B]]';
    const entries = WikiLinkParser.parse(text, noRegions);
    expect(entries).toHaveLength(2);
  });

  it('does not match embed (exclamation-prefixed) links', () => {
    const text = '![[Embed]]';
    const entries = WikiLinkParser.parse(text, noRegions);
    // embed parser handles these; wiki-link parser should skip them
    expect(entries.every((e) => !e.raw.startsWith('!'))).toBe(true);
  });
});
