import { describe, it, expect } from '@jest/globals';
import { BlockAnchorParser } from '../block-anchor-parser.js';

describe('BlockAnchorParser', () => {
  const noRegions = [] as const;

  it('finds a block anchor at end of line', () => {
    const text = 'Some paragraph text ^my-anchor';
    const entries = BlockAnchorParser.parse(text, noRegions);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('my-anchor');
  });

  it('finds block anchor with only alphanumeric chars', () => {
    const entries = BlockAnchorParser.parse('Text ^abc123', noRegions);
    expect(entries[0].id).toBe('abc123');
  });

  it('ignores ^ in middle of line', () => {
    const entries = BlockAnchorParser.parse('Text ^mid here', noRegions);
    expect(entries).toHaveLength(0);
  });

  it('ignores blank lines', () => {
    const entries = BlockAnchorParser.parse('\n\n', noRegions);
    expect(entries).toHaveLength(0);
  });

  it('skips anchors inside opaque regions', () => {
    const text = '`text ^anchor`';
    const regions = [{ kind: 'code' as const, start: 0, end: text.length }];
    expect(BlockAnchorParser.parse(text, regions)).toHaveLength(0);
  });

  it('returns correct LSP range for anchor', () => {
    const text = 'Line one\nSome text ^block-id';
    const entries = BlockAnchorParser.parse(text, noRegions);
    expect(entries[0].range.start.line).toBe(1);
    expect(entries[0].range.start.character).toBe('Some text '.length);
  });

  it('finds multiple block anchors', () => {
    const text = 'Line one ^a1\nLine two ^b2';
    const entries = BlockAnchorParser.parse(text, noRegions);
    expect(entries).toHaveLength(2);
  });
});
