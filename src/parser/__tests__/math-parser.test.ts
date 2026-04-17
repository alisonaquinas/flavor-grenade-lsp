import { describe, it, expect } from '@jest/globals';
import { MathParser } from '../math-parser.js';

describe('MathParser', () => {
  it('finds a display math block', () => {
    const text = '$$\nx^2\n$$';
    const regions = MathParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('math');
    expect(regions[0].start).toBe(0);
    expect(regions[0].end).toBe(text.length);
  });

  it('finds inline math', () => {
    const text = 'Some $x=1$ text';
    const regions = MathParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('math');
    expect(regions[0].start).toBe(5);
    expect(regions[0].end).toBe(10);
  });

  it('does NOT match inline math spanning newlines', () => {
    const text = 'Some $x\ny$ text';
    const regions = MathParser.parse(text, 0);
    expect(regions).toHaveLength(0);
  });

  it('finds multiple inline math spans', () => {
    const text = '$a$ and $b$';
    const regions = MathParser.parse(text, 0);
    expect(regions).toHaveLength(2);
  });

  it('display math takes priority over inline', () => {
    const text = '$$\na+b\n$$';
    const regions = MathParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].start).toBe(0);
    expect(regions[0].end).toBe(text.length);
  });

  it('returns empty when no math', () => {
    expect(MathParser.parse('plain text', 0)).toHaveLength(0);
  });

  it('applies bodyOffset to offsets', () => {
    const bodyOffset = 5;
    const text = '     $x$';
    const regions = MathParser.parse(text, bodyOffset);
    expect(regions[0].start).toBe(5);
    expect(regions[0].end).toBe(8);
  });
});
