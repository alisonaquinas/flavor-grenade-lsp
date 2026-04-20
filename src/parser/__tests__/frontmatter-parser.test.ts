import { describe, it, expect } from '@jest/globals';
import { FrontmatterParser } from '../frontmatter-parser.js';

describe('FrontmatterParser', () => {
  const parser = new FrontmatterParser();

  it('returns null frontmatter and bodyOffset 0 when no frontmatter', () => {
    const result = parser.parse('# Hello\nworld\n');
    expect(result.frontmatter).toBeNull();
    expect(result.bodyOffset).toBe(0);
  });

  it('parses valid frontmatter at start', () => {
    const text = '---\ntitle: Hello\ntags: [a, b]\n---\nBody here\n';
    const result = parser.parse(text);
    expect(result.frontmatter).toEqual({ title: 'Hello', tags: ['a', 'b'] });
    expect(result.bodyOffset).toBe(text.indexOf('Body here'));
  });

  it('returns null when frontmatter does not start at offset 0', () => {
    const text = '\n---\ntitle: Hello\n---\nBody\n';
    const result = parser.parse(text);
    expect(result.frontmatter).toBeNull();
    expect(result.bodyOffset).toBe(0);
  });

  it('returns null and bodyOffset 0 on invalid YAML', () => {
    const text = '---\ntitle: [unclosed\n---\nBody\n';
    const result = parser.parse(text);
    expect(result.frontmatter).toBeNull();
    expect(result.bodyOffset).toBe(0);
  });

  it('handles empty frontmatter block', () => {
    const text = '---\n---\nBody\n';
    const result = parser.parse(text);
    // empty YAML is null or an empty object; bodyOffset should be past the closing ---
    expect(result.bodyOffset).toBe('---\n---\n'.length);
  });

  it('handles frontmatter with no trailing newline before body', () => {
    const text = '---\ntitle: T\n---\n';
    const result = parser.parse(text);
    expect(result.frontmatter).toEqual({ title: 'T' });
    expect(result.bodyOffset).toBe(text.length);
  });

  it('does not parse when opening --- is not at byte 0', () => {
    const text = ' ---\ntitle: T\n---\nBody\n';
    const result = parser.parse(text);
    expect(result.frontmatter).toBeNull();
    expect(result.bodyOffset).toBe(0);
  });
});
