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

describe('GitLab Flavored Markdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats GLFM syntax as active while inheriting GFM and keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/glfm.md',
      [
        '# GLFM Demo',
        '',
        '| Task | Owner |',
        '| --- | --- |',
        '| Ship | Docs |',
        '',
        '- [~] not applicable',
        '',
        'Term',
        ': definition',
        '',
        'See footnote.[^note]',
        '',
        '[^note]: detail',
        '',
        '[[_TOC_]]',
        '',
        'See #123, !456, &789, @user, and group/project#42.',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
        '> [!note]',
      ].join('\n'),
      1,
      { effectiveFlavor: 'glfm' },
    );

    expect(doc.markdownFlavor).toBe('glfm');
    expect(doc.index.gfmTables).toHaveLength(1);
    expect(doc.index.glfmInapplicableTaskListItems.map((item) => item.text)).toEqual([
      'not applicable',
    ]);
    expect(doc.index.glfmDescriptionLists.map((entry) => entry.term)).toEqual(['Term']);
    expect(doc.index.glfmFootnotes.map((entry) => entry.label)).toEqual(['note']);
    expect(doc.index.glfmTocTags.map((entry) => entry.raw)).toEqual(['[[_TOC_]]']);
    expect(doc.index.glfmHostReferences.map((entry) => entry.raw)).toEqual([
      '#123',
      '!456',
      '&789',
      '@user',
      'group/project#42',
    ]);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
    expect(doc.index.callouts).toHaveLength(0);
  });

  it('marks GLFM LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('glfm');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('Pandoc Markdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats Pandoc publishing syntax as active while keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/pandoc.md',
      [
        '% Pandoc Demo',
        '% Ada Author',
        '',
        '# Methods {#sec:methods .unnumbered}',
        '',
        'See @doe99 and [@smith04, pp. 33-35].',
        '',
        'Term',
        ': definition',
        '',
        '[^note]: footnote detail',
        '',
        '::: {.callout #tip}',
        'Body',
        ':::',
        '',
        '![Plot](plot.png){#fig:plot width=50%}',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
      ].join('\n'),
      1,
      { effectiveFlavor: 'pandoc' },
    );

    expect(doc.markdownFlavor).toBe('pandoc');
    expect(doc.index.pandocTitleBlocks.map((entry) => entry.lines)).toEqual([2]);
    expect(doc.index.pandocCitations.map((entry) => entry.key)).toEqual(['doe99', 'smith04']);
    expect(doc.index.pandocDefinitionLists.map((entry) => entry.term)).toEqual(['Term']);
    expect(doc.index.pandocFootnotes.map((entry) => entry.label)).toEqual(['note']);
    expect(doc.index.pandocFencedDivs.map((entry) => entry.attributes.id)).toEqual(['tip']);
    expect(doc.index.pandocAttributes.map((entry) => entry.id)).toEqual([
      'sec:methods',
      'tip',
      'fig:plot',
    ]);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks Pandoc LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('pandoc');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('MultiMarkdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats MultiMarkdown document-production syntax as active while keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/multimarkdown.md',
      [
        'Title: MultiMarkdown Demo',
        'Author: Ada Author',
        '',
        '# Intro [sec:intro]',
        '',
        '| Feature | Status |',
        '| ------- | ------ |',
        '| Tables | Active |',
        '[Table caption][tbl:features]',
        '',
        'See [Intro][] and [](#fig:plot).',
        'Cite [](#doe2020).',
        '',
        '[^note]: footnote detail',
        '[#doe2020]: Citation detail',
        '*[HTML]: Hyper Text Markup Language',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
      ].join('\n'),
      1,
      { effectiveFlavor: 'multimarkdown' },
    );

    expect(doc.markdownFlavor).toBe('multimarkdown');
    expect(doc.index.multimarkdownMetadata.map((entry) => entry.key)).toEqual(['Title', 'Author']);
    expect(doc.index.multimarkdownTables.map((entry) => entry.label)).toEqual(['tbl:features']);
    expect(doc.index.multimarkdownFootnotes.map((entry) => entry.label)).toEqual(['note']);
    expect(doc.index.multimarkdownCitations.map((entry) => entry.key)).toEqual(['doe2020']);
    expect(doc.index.multimarkdownCrossReferences.map((entry) => entry.target)).toEqual([
      'Intro',
      'fig:plot',
    ]);
    expect(doc.index.multimarkdownLabels.map((entry) => entry.label)).toEqual([
      'sec:intro',
      'tbl:features',
    ]);
    expect(doc.index.multimarkdownAbbreviations.map((entry) => entry.label)).toEqual(['HTML']);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks MultiMarkdown LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('multimarkdown');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('MDX parser analysis', () => {
  const parser = new OFMParser();

  it('treats MDX JSX and ESM syntax as active while keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/mdx.md',
      [
        "import Chart from './Chart'",
        "export const title = 'Demo'",
        '',
        '# {title}',
        '',
        '<Chart value={total}>',
        '  **Markdown** inside JSX',
        '</Chart>',
        '',
        '{items.map((item) => <Item key={item.id} />)}',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
      ].join('\n'),
      1,
      { effectiveFlavor: 'mdx' },
    );
    const mdxIndex = doc.index as typeof doc.index & {
      mdxEsmDeclarations: Array<{ kind: string }>;
      mdxJsxElements: Array<{ name: string }>;
      mdxExpressions: unknown[];
    };

    expect(doc.markdownFlavor).toBe('mdx');
    expect(mdxIndex.mdxEsmDeclarations.map((entry) => entry.kind)).toEqual(['import', 'export']);
    expect(mdxIndex.mdxJsxElements.map((entry) => entry.name)).toEqual(['Chart', 'Item']);
    expect(mdxIndex.mdxExpressions).toHaveLength(1);
    expect(doc.index.headings.map((entry) => entry.text)).toEqual(['{title}']);
    expect(doc.opaqueRegions.map((region) => region.kind)).toEqual(
      expect.arrayContaining(['mdx-esm', 'mdx-jsx', 'mdx-expression']),
    );
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks MDX LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('mdx');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('kramdown parser analysis', () => {
  const parser = new OFMParser();

  it('treats kramdown attributes and block syntax as active while keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/kramdown.md',
      [
        '# Heading {#custom .hero}',
        '',
        'Paragraph',
        '{:.lead}',
        '',
        'Term',
        ': Definition',
        '',
        '| A | B |',
        '|---|---|',
        '| 1 | 2 |',
        '',
        'Footnote[^note]',
        '',
        '[^note]: footnote detail',
        '',
        '$$',
        'x^2',
        '$$',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
      ].join('\n'),
      1,
      { effectiveFlavor: 'kramdown' },
    );
    const kramdownIndex = doc.index as typeof doc.index & {
      kramdownAttributes: Array<{ id?: string; classes: string[] }>;
      kramdownDefinitionLists: Array<{ term: string }>;
      kramdownTables: Array<{ headerCells: string[] }>;
      kramdownFootnotes: Array<{ label: string }>;
      kramdownMathBlocks: unknown[];
    };

    expect(doc.markdownFlavor).toBe('kramdown');
    expect(kramdownIndex.kramdownAttributes.map((entry) => entry.id)).toEqual([
      'custom',
      undefined,
    ]);
    expect(kramdownIndex.kramdownAttributes.map((entry) => entry.classes)).toEqual([
      ['hero'],
      ['lead'],
    ]);
    expect(kramdownIndex.kramdownDefinitionLists.map((entry) => entry.term)).toEqual(['Term']);
    expect(kramdownIndex.kramdownTables.map((entry) => entry.headerCells)).toEqual([['A', 'B']]);
    expect(kramdownIndex.kramdownFootnotes.map((entry) => entry.label)).toEqual(['note']);
    expect(kramdownIndex.kramdownMathBlocks).toHaveLength(1);
    expect(doc.index.headings.map((entry) => entry.text)).toEqual(['Heading {#custom .hero}']);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks kramdown LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('kramdown');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});

describe('Markdown Extra parser analysis', () => {
  const parser = new OFMParser();

  it('treats Markdown Extra blocks as active while keeping Obsidian inert', () => {
    const doc = parser.parse(
      'file:///vault/markdown-extra.md',
      [
        '# Heading',
        '',
        'Paragraph',
        '{#custom .hero}',
        '',
        'Term',
        ': Definition',
        '',
        '| A | B |',
        '|---|---|',
        '| 1 | 2 |',
        '',
        'Footnote[^note]',
        '',
        '[^note]: footnote detail',
        '',
        '*[HTML]: Hyper Text Markup Language',
        '',
        '``` {.php}',
        'echo "hi";',
        '```',
        '',
        '[[Obsidian Link]]',
        '![[image.png]]',
        '#obsidian/tag',
      ].join('\n'),
      1,
      { effectiveFlavor: 'markdown-extra' },
    );
    const extraIndex = doc.index as typeof doc.index & {
      markdownExtraAttributes: Array<{ id?: string; classes: string[] }>;
      markdownExtraDefinitionLists: Array<{ term: string }>;
      markdownExtraTables: Array<{ headerCells: string[] }>;
      markdownExtraFootnotes: Array<{ label: string }>;
      markdownExtraAbbreviations: Array<{ label: string; value: string }>;
      markdownExtraFencedCodeBlocks: Array<{ language?: string }>;
    };

    expect(doc.markdownFlavor).toBe('markdown-extra');
    expect(extraIndex.markdownExtraAttributes.map((entry) => entry.id)).toEqual(['custom']);
    expect(extraIndex.markdownExtraAttributes.map((entry) => entry.classes)).toEqual([['hero']]);
    expect(extraIndex.markdownExtraDefinitionLists.map((entry) => entry.term)).toEqual(['Term']);
    expect(extraIndex.markdownExtraTables.map((entry) => entry.headerCells)).toEqual([['A', 'B']]);
    expect(extraIndex.markdownExtraFootnotes.map((entry) => entry.label)).toEqual(['note']);
    expect(extraIndex.markdownExtraAbbreviations.map((entry) => entry.label)).toEqual(['HTML']);
    expect(extraIndex.markdownExtraFencedCodeBlocks.map((entry) => entry.language)).toEqual([
      'php',
    ]);
    expect(doc.index.wikiLinks).toHaveLength(0);
    expect(doc.index.embeds).toHaveLength(0);
    expect(doc.index.tags).toHaveLength(0);
  });

  it('marks Markdown Extra LSP surfaces implemented in the profile registry', () => {
    const profile = getMarkdownFlavorProfile('markdown-extra');
    expect(
      Object.values(profile.surfaces).every((surface) => surface.status === 'implemented'),
    ).toBe(true);
  });
});
