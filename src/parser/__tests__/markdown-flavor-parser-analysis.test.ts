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

describe('CommonMark parser analysis', () => {
  const parser = new OFMParser();

  it('treats CommonMark constructs as active and flavor extensions as inert', () => {
    const doc = parser.parse(
      'file:///vault/commonmark.md',
      [
        'Setext Title',
        '---',
        '',
        '# ATX Title',
        '',
        '```ts',
        'const x = 1;',
        '```',
        '',
        '[Local](notes/target.md)',
        '[Ref]',
        '',
        '[ref]: notes/ref.md',
        '',
        '<https://example.com>',
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
      { effectiveFlavor: 'commonmark' },
    );

    expect(doc.markdownFlavor).toBe('commonmark');
    expect(doc.index.headings.map((heading) => [heading.level, heading.text])).toEqual([
      [2, 'Setext Title'],
      [1, 'ATX Title'],
    ]);
    expect(doc.opaqueRegions.some((region) => region.kind === 'code')).toBe(true);
    expect(doc.index.markdownLinks.map((link) => link.target)).toEqual([
      'notes/target.md',
      'https://example.com',
    ]);
    expect(doc.index.linkLabelRefs.map((entry) => entry.normalizedLabel)).toEqual(['ref']);
    expect(doc.index.linkLabelDefs.map((entry) => entry.normalizedLabel)).toEqual(['ref']);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.callouts).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks CommonMark LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('commonmark');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});
