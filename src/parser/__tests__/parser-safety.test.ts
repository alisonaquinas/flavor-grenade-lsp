import { describe, expect, it } from '@jest/globals';
import { OFMParser } from '../ofm-parser.js';

describe('OFMParser safety budgets', () => {
  const parser = new OFMParser();

  it('returns an empty parse result for documents over the parser size budget', () => {
    const text = `${'a'.repeat(1024 * 1024 + 1)}\n[[secret]]\n# Heading\n#tag\n`;
    const doc = parser.parse('file:///vault/oversized.md', text, 1);

    expect(doc.index.wikiLinks).toEqual([]);
    expect(doc.index.headings).toEqual([]);
    expect(doc.index.tags).toEqual([]);
    expect(doc.frontmatter).toBeNull();
    expect(doc.opaqueRegions).toEqual([]);
  });

  it('handles adversarial unmatched delimiters inside the parser budget', () => {
    const text = `${'['.repeat(10_000)}${'`'.repeat(10_000)}${'$'.repeat(10_000)}`;
    const startedAt = performance.now();
    const doc = parser.parse('file:///vault/adversarial.md', text, 1);
    const elapsedMs = performance.now() - startedAt;

    expect(doc.index.wikiLinks).toEqual([]);
    expect(doc.index.markdownLinks).toEqual([]);
    expect(elapsedMs).toBeLessThan(200);
  });
});
