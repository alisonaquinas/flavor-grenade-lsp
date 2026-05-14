import { describe, expect, it, beforeEach } from '@jest/globals';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { FoldingRangeHandler } from '../folding-range.handler.js';

describe('FoldingRangeHandler', () => {
  let parser: OFMParser;
  let parseCache: ParseCache;
  let handler: FoldingRangeHandler;

  beforeEach(() => {
    parser = new OFMParser();
    parseCache = new ParseCache();
    handler = new FoldingRangeHandler(parseCache);
  });

  it('returns no folding ranges when the document is not in the parse cache', () => {
    expect(handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } })).toEqual([]);
  });

  it('folds frontmatter and heading sections', () => {
    const doc = parser.parse(
      'file:///vault/notes/structure.md',
      ['---', 'title: Example', '---', '# Alpha', 'intro', '## Beta', 'detail', '# Gamma'].join(
        '\n',
      ),
      1,
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 0, endLine: 2, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 3, endLine: 6, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 5, endLine: 6, kind: 'region' });
  });

  it('folds callout blocks and opaque code, math, and comment regions', () => {
    const doc = parser.parse(
      'file:///vault/notes/folds.md',
      [
        '# Doc',
        '> [!NOTE]- title',
        '> Body',
        '> More',
        'Plain',
        '```ts',
        'const x = 1;',
        '```',
        '$$',
        'x',
        '$$',
        '%%',
        'comment',
        '%%',
      ].join('\n'),
      1,
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 1, endLine: 3, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 5, endLine: 7, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 8, endLine: 10, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 11, endLine: 13, kind: 'comment' });
  });

  it('folds multiline Templater opaque regions', () => {
    const doc = parser.parse(
      'file:///vault/notes/templater.md',
      ['# Doc', '<%*', 'const title = tp.file.title;', '%>', 'After'].join('\n'),
      1,
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 1, endLine: 3, kind: 'region' });
  });

  it('folds GFM table blocks when the GFM flavor is active', () => {
    const doc = parser.parse(
      'file:///vault/notes/gfm.md',
      ['# Doc', '', '| A | B |', '| --- | --- |', '| 1 | 2 |', '', 'After'].join('\n'),
      1,
      { effectiveFlavor: 'gfm' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 2, endLine: 4, kind: 'region' });
  });

  it('folds GLFM description lists when the GLFM flavor is active', () => {
    const doc = parser.parse(
      'file:///vault/notes/glfm.md',
      ['# Doc', '', 'Term', ': one', ': two', '', 'After'].join('\n'),
      1,
      { effectiveFlavor: 'glfm' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 2, endLine: 4, kind: 'region' });
  });

  it('folds Pandoc fenced Divs and definition lists when the Pandoc flavor is active', () => {
    const doc = parser.parse(
      'file:///vault/notes/pandoc.md',
      ['# Pandoc', '', 'Term', ': one', ': two', '', '::: {.note}', 'body', ':::'].join('\n'),
      1,
      { effectiveFlavor: 'pandoc' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 2, endLine: 4, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 6, endLine: 8, kind: 'region' });
  });

  it('folds MultiMarkdown metadata and table blocks when the MultiMarkdown flavor is active', () => {
    const doc = parser.parse(
      'file:///vault/notes/multimarkdown.md',
      [
        'Title: Demo',
        'Author: Ada',
        '',
        '# Doc',
        '',
        '| A | B |',
        '| - | - |',
        '| 1 | 2 |',
        '[Caption][tbl:one]',
      ].join('\n'),
      1,
      { effectiveFlavor: 'multimarkdown' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 0, endLine: 1, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 5, endLine: 8, kind: 'region' });
  });

  it('folds MDX JSX and expression blocks when the MDX flavor is active', () => {
    const doc = parser.parse(
      'file:///vault/notes/mdx.md',
      [
        "import Chart from './Chart'",
        '',
        '# MDX',
        '',
        '<Chart>',
        '  content',
        '</Chart>',
        '',
        '{items.map((item) =>',
        '  <Item key={item.id} />',
        ')}',
      ].join('\n'),
      1,
      { effectiveFlavor: 'mdx' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 4, endLine: 6, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 8, endLine: 10, kind: 'region' });
  });

  it('folds kramdown definition lists, tables, and math blocks when active', () => {
    const doc = parser.parse(
      'file:///vault/notes/kramdown.md',
      [
        '# kramdown',
        '',
        'Term',
        ': one',
        ': two',
        '',
        '| A | B |',
        '|---|---|',
        '| 1 | 2 |',
        '',
        '$$',
        'x^2',
        '$$',
      ].join('\n'),
      1,
      { effectiveFlavor: 'kramdown' },
    );
    parseCache.set(doc.uri, doc);

    const ranges = handler.handle({ textDocument: { uri: doc.uri } });

    expect(ranges).toContainEqual({ startLine: 2, endLine: 4, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 6, endLine: 8, kind: 'region' });
    expect(ranges).toContainEqual({ startLine: 10, endLine: 12, kind: 'region' });
  });
});
