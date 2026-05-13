import { describe, expect, it } from '@jest/globals';
import { getMarkdownFlavorProfile } from '../../markdown-flavor/index.js';
import { OFMParser } from '../ofm-parser.js';

describe('Original Markdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats historical Markdown constructs as active and later extensions as inert', () => {
    const doc = parser.parse(
      'file:///vault/original.md',
      [
        'Setext Title',
        '============',
        '',
        '# ATX Title',
        '',
        '    indented code',
        '',
        '[Local](notes/target.md)',
        '',
        '[[Obsidian Link]]',
        '> [!note]',
        '',
        '| a | b |',
        '|---|---|',
        '',
        '- [x] task',
      ].join('\n'),
      1,
      { effectiveFlavor: 'original' },
    );

    expect(doc.markdownFlavor).toBe('original');
    expect(doc.index.headings.map((heading) => [heading.level, heading.text])).toEqual([
      [1, 'Setext Title'],
      [1, 'ATX Title'],
    ]);
    expect(doc.index.markdownLinks).toHaveLength(1);
    expect(doc.opaqueRegions.some((region) => region.kind === 'code')).toBe(true);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.callouts).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks Original Markdown LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('original');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});
