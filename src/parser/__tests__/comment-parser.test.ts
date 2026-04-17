import { describe, it, expect } from '@jest/globals';
import { CommentParser } from '../comment-parser.js';

describe('CommentParser', () => {
  it('finds a single comment', () => {
    const text = 'Hello %%comment%% world';
    const regions = CommentParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('comment');
    expect(regions[0].start).toBe(6);
    expect(regions[0].end).toBe(17);
  });

  it('finds multiple comments', () => {
    const text = '%%one%% text %%two%%';
    const regions = CommentParser.parse(text, 0);
    expect(regions).toHaveLength(2);
    expect(regions[0].start).toBe(0);
    expect(regions[0].end).toBe(7);
    expect(regions[1].start).toBe(13);
    expect(regions[1].end).toBe(20);
  });

  it('returns empty array when no comments', () => {
    expect(CommentParser.parse('no comments here', 0)).toHaveLength(0);
  });

  it('handles multi-line comments', () => {
    const text = '%%\nline one\nline two\n%%';
    const regions = CommentParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBe(0);
    expect(regions[0].end).toBe(text.length);
  });

  it('offsets start/end by bodyOffset', () => {
    const text = '---\n---\n%%comment%%';
    const bodyOffset = 8;
    const regions = CommentParser.parse(text, bodyOffset);
    // comment starts at offset 8 in full doc
    expect(regions[0].start).toBe(8);
    expect(regions[0].end).toBe(text.length);
  });

  it('skips unpaired opening %%', () => {
    const text = 'before %% after';
    const regions = CommentParser.parse(text, 0);
    expect(regions).toHaveLength(0);
  });
});
