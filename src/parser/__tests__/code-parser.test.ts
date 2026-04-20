import { describe, it, expect } from '@jest/globals';
import { CodeParser } from '../code-parser.js';

describe('CodeParser', () => {
  it('finds a backtick fenced code block', () => {
    const text = '```js\nconsole.log("hi");\n```';
    const regions = CodeParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('code');
    expect(regions[0].start).toBe(0);
    expect(regions[0].end).toBe(text.length);
  });

  it('finds a tilde fenced code block', () => {
    const text = '~~~python\nprint("hi")\n~~~';
    const regions = CodeParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('code');
  });

  it('finds inline code span', () => {
    const text = 'Use `code` here';
    const regions = CodeParser.parse(text, 0);
    expect(regions).toHaveLength(1);
    expect(regions[0].kind).toBe('code');
    expect(regions[0].start).toBe(4);
    expect(regions[0].end).toBe(10);
  });

  it('finds indented code block', () => {
    const text = 'Normal line\n\n    indented code\n    more code\n\nNormal again\n';
    const regions = CodeParser.parse(text, 0);
    expect(regions.some((r) => r.kind === 'code')).toBe(true);
  });

  it('returns empty array for plain text', () => {
    expect(CodeParser.parse('just text', 0)).toHaveLength(0);
  });

  it('applies bodyOffset', () => {
    const bodyOffset = 10;
    const text = '          `code`';
    const regions = CodeParser.parse(text, bodyOffset);
    expect(regions[0].start).toBe(10);
    expect(regions[0].end).toBe(16);
  });

  it('handles multiple inline code spans', () => {
    const text = '`a` and `b` and `c`';
    const regions = CodeParser.parse(text, 0);
    expect(regions).toHaveLength(3);
  });
});
