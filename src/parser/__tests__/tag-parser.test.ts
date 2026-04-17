import { describe, it, expect } from '@jest/globals';
import { TagParser } from '../tag-parser.js';

describe('TagParser', () => {
  const noRegions = [] as const;

  it('finds a simple tag at start of line', () => {
    const entries = TagParser.parse('#mytag', noRegions);
    expect(entries).toHaveLength(1);
    expect(entries[0].tag).toBe('#mytag');
  });

  it('finds a tag preceded by whitespace', () => {
    const entries = TagParser.parse('Hello #world', noRegions);
    expect(entries).toHaveLength(1);
    expect(entries[0].tag).toBe('#world');
  });

  it('does NOT match # preceded by alphanumeric (heading-like context or inline code)', () => {
    const entries = TagParser.parse('abc#notag', noRegions);
    expect(entries).toHaveLength(0);
  });

  it('supports hierarchical tags with slash', () => {
    const entries = TagParser.parse('#parent/child', noRegions);
    expect(entries[0].tag).toBe('#parent/child');
  });

  it('supports unicode in tags', () => {
    const entries = TagParser.parse('#café', noRegions);
    expect(entries[0].tag).toBe('#café');
  });

  it('skips tags inside opaque regions', () => {
    const text = '`#notag`';
    const regions = [{ kind: 'code' as const, start: 0, end: text.length }];
    expect(TagParser.parse(text, regions)).toHaveLength(0);
  });

  it('returns correct LSP range', () => {
    const text = 'Line one\n#tag';
    const entries = TagParser.parse(text, noRegions);
    expect(entries[0].range.start.line).toBe(1);
    expect(entries[0].range.start.character).toBe(0);
  });

  it('finds multiple tags', () => {
    const entries = TagParser.parse('#a #b #c', noRegions);
    expect(entries).toHaveLength(3);
  });

  it('tag preceded by punctuation is valid', () => {
    const entries = TagParser.parse('Hello, #tag', noRegions);
    expect(entries).toHaveLength(1);
  });
});
