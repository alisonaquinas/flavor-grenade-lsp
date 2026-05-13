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

describe('Obsidian parser analysis', () => {
  const parser = new OFMParser();

  it('treats Obsidian vault syntax as active while opaque regions stay inert', () => {
    const doc = parser.parse(
      'file:///vault/obsidian.md',
      [
        '---',
        'title: Obsidian Demo',
        '---',
        '',
        '# Vault Note',
        '',
        '[[Target#Heading^block]]',
        '![[assets/image.png]]',
        '#project/tag',
        '^block',
        '> [!note]',
        '> body',
        '',
        '$$',
        '[[hidden-in-math]]',
        '$$',
        '',
        '%% [[hidden-in-comment]] %%',
        '',
        '<%*',
        'const hidden = "[[hidden-in-templater]]";',
        '%>',
      ].join('\n'),
      1,
      { effectiveFlavor: 'obsidian' },
    );

    expect(doc.markdownFlavor).toBe('obsidian');
    expect(doc.frontmatter).toMatchObject({ title: 'Obsidian Demo' });
    expect(doc.index.headings.map((heading) => heading.text)).toEqual(['Vault Note']);
    expect(doc.index.wikiLinks.map((link) => link.target)).toEqual(['Target']);
    expect(doc.index.embeds.map((embed) => embed.target)).toEqual(['assets/image.png']);
    expect(doc.index.tags.map((tag) => tag.tag)).toEqual(['#project/tag']);
    expect(doc.index.blockAnchors.map((anchor) => anchor.id)).toEqual(['block']);
    expect(doc.index.callouts.map((callout) => callout.type)).toEqual(['note']);
    expect(doc.opaqueRegions.map((region) => region.kind)).toEqual(
      expect.arrayContaining(['math', 'comment', 'templater']),
    );
  });

  it('marks Obsidian LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('obsidian');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('GitHub Flavored Markdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats GFM signature syntax as active and Obsidian-only syntax as inert', () => {
    const doc = parser.parse(
      'file:///vault/gfm.md',
      [
        '# GFM Demo',
        '',
        '| Task | Owner |',
        '| --- | --- |',
        '| Ship | Docs |',
        '',
        '- [x] done',
        '- [ ] todo',
        '',
        '~~old text~~',
        'Visit www.example.com/docs.',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
        '> [!note]',
        '',
        '```md',
        '| hidden | table |',
        '| --- | --- |',
        '~~hidden~~',
        '```',
      ].join('\n'),
      1,
      { effectiveFlavor: 'gfm' },
    );

    expect(doc.markdownFlavor).toBe('gfm');
    expect(doc.index.gfmTables).toHaveLength(1);
    expect(doc.index.gfmTables[0]).toMatchObject({ headerCells: ['Task', 'Owner'] });
    expect(doc.index.gfmTaskListItems.map((item) => item.checked)).toEqual([true, false]);
    expect(doc.index.gfmStrikethroughs.map((entry) => entry.text)).toEqual(['old text']);
    expect(doc.index.gfmAutolinks.map((entry) => entry.target)).toEqual([
      'http://www.example.com/docs',
    ]);
    expect(doc.index.markdownLinks.map((entry) => entry.target)).toContain(
      'http://www.example.com/docs',
    );
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
    expect(doc.index.callouts).toHaveLength(0);
  });

  it('marks GFM LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('gfm');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});
