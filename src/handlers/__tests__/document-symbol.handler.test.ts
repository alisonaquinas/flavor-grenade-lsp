import { describe, it, expect, beforeEach } from '@jest/globals';
import { DocumentSymbolHandler } from '../document-symbol.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, HeadingEntry, BlockAnchorEntry } from '../../parser/types.js';

function makeHeading(text: string, level: number, line: number): HeadingEntry {
  const prefix = '#'.repeat(level);
  return {
    level,
    text,
    range: {
      start: { line, character: 0 },
      end: { line, character: prefix.length + 1 + text.length },
    },
  };
}

function makeAnchor(anchorId: string, line: number): BlockAnchorEntry {
  return {
    id: anchorId,
    range: { start: { line, character: 0 }, end: { line, character: anchorId.length + 1 } },
  };
}

function makeDoc(
  uri: string,
  headings: HeadingEntry[],
  blockAnchors: BlockAnchorEntry[] = [],
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: { wikiLinks: [], embeds: [], blockAnchors, tags: [], callouts: [], headings },
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('DocumentSymbolHandler', () => {
  let parseCache: ParseCache;
  let handler: DocumentSymbolHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    handler = new DocumentSymbolHandler(parseCache);
  });

  it('returns empty array when doc not in cache', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } });
    expect(result).toHaveLength(0);
  });

  it('returns top-level symbols for H1 headings', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Chapter One', 1, 0)]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Chapter One');
    expect(result[0].range).toBeDefined();
    expect(result[0].selectionRange).toBeDefined();
  });

  it('nests H2 under H1', () => {
    const doc = makeDoc(DOC_URI, [
      makeHeading('Chapter One', 1, 0),
      makeHeading('Section 1.1', 2, 2),
      makeHeading('Section 1.2', 2, 4),
    ]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1); // Only 1 top-level H1
    expect(result[0].name).toBe('Chapter One');
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children![0].name).toBe('Section 1.1');
    expect(result[0].children![1].name).toBe('Section 1.2');
  });

  it('nests H3 under H2 under H1', () => {
    const doc = makeDoc(DOC_URI, [
      makeHeading('Chapter One', 1, 0),
      makeHeading('Section', 2, 2),
      makeHeading('Subsection', 3, 4),
    ]);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).toHaveLength(1);
    const h1 = result[0];
    expect(h1.children).toHaveLength(1);
    const h2 = h1.children![0];
    expect(h2.name).toBe('Section');
    expect(h2.children).toHaveLength(1);
    expect(h2.children![0].name).toBe('Subsection');
  });

  it('adds block anchors as leaf children in their heading section', () => {
    const anchors = [makeAnchor('my-anchor', 3)];
    const doc = makeDoc(
      DOC_URI,
      [makeHeading('Section', 2, 0), makeHeading('Another', 2, 5)],
      anchors,
    );
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    // The anchor on line 3 falls between heading on line 0 and heading on line 5
    const sectionSymbol = result.find((s) => s.name === 'Section');
    expect(sectionSymbol).toBeDefined();
    const anchorChild = sectionSymbol!.children?.find((c) => c.name === 'my-anchor');
    expect(anchorChild).toBeDefined();
    expect(anchorChild!.kind).toBe(20); // SymbolKind.Key
  });

  it('returns empty array when doc has no headings and no anchors', () => {
    const doc = makeDoc(DOC_URI, []);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    expect(result).toHaveLength(0);
  });

  it('adds GFM tables and task items as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Tasks', 1, 0)]);
    doc.index.gfmTables = [
      {
        raw: '| A | B |\n| --- | --- |',
        headerCells: ['A', 'B'],
        rowCount: 0,
        range: { start: { line: 2, character: 0 }, end: { line: 3, character: 13 } },
      },
    ];
    doc.index.gfmTaskListItems = [
      {
        raw: '- [x] done',
        checked: true,
        text: 'done',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 10 } },
        markerRange: { start: { line: 5, character: 2 }, end: { line: 5, character: 5 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result[0].children?.map((child) => child.name) ?? [];

    expect(names).toContain('GFM table: A, B');
    expect(names).toContain('Task: done');
  });

  it('adds GLFM description lists and TOC tags as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('GLFM', 1, 0)]);
    doc.index.glfmDescriptionLists = [
      {
        raw: 'Term\n: definition',
        term: 'Term',
        definitionCount: 1,
        range: { start: { line: 2, character: 0 }, end: { line: 3, character: 12 } },
      },
    ];
    doc.index.glfmTocTags = [
      {
        raw: '[[_TOC_]]',
        range: { start: { line: 5, character: 0 }, end: { line: 5, character: 9 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result[0].children?.map((child) => child.name) ?? [];

    expect(names).toContain('Description: Term');
    expect(names).toContain('GitLab table of contents');
  });

  it('adds Pandoc metadata, labels, and footnotes as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Pandoc', 1, 0)]);
    doc.index.pandocTitleBlocks = [
      {
        raw: '% Title\n% Author',
        lines: 2,
        range: { start: { line: 0, character: 0 }, end: { line: 1, character: 8 } },
      },
    ];
    doc.index.pandocAttributes = [
      {
        raw: '{#sec:intro}',
        id: 'sec:intro',
        classes: [],
        keyValues: {},
        range: { start: { line: 0, character: 9 }, end: { line: 0, character: 21 } },
      },
    ];
    doc.index.pandocFootnotes = [
      {
        raw: '[^n]: note',
        label: 'n',
        range: { start: { line: 3, character: 0 }, end: { line: 3, character: 10 } },
        labelRange: { start: { line: 3, character: 2 }, end: { line: 3, character: 3 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('Pandoc metadata');
    expect(names).toContain('Pandoc label: sec:intro');
    expect(names).toContain('Footnote: n');
  });

  it('adds MultiMarkdown metadata, labels, citations, and footnotes as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('MultiMarkdown', 1, 0)]);
    doc.index.multimarkdownMetadata = [
      {
        raw: 'Title: Demo',
        key: 'Title',
        value: 'Demo',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 11 } },
        keyRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
      },
    ];
    doc.index.multimarkdownLabels = [
      {
        raw: '[sec:intro]',
        label: 'sec:intro',
        range: { start: { line: 1, character: 8 }, end: { line: 1, character: 19 } },
        labelRange: { start: { line: 1, character: 9 }, end: { line: 1, character: 18 } },
      },
    ];
    doc.index.multimarkdownCitations = [
      {
        raw: '[#doe2020]: Citation',
        key: 'doe2020',
        range: { start: { line: 3, character: 0 }, end: { line: 3, character: 21 } },
        keyRange: { start: { line: 3, character: 2 }, end: { line: 3, character: 9 } },
      },
    ];
    doc.index.multimarkdownFootnotes = [
      {
        raw: '[^n]: note',
        label: 'n',
        range: { start: { line: 4, character: 0 }, end: { line: 4, character: 10 } },
        labelRange: { start: { line: 4, character: 2 }, end: { line: 4, character: 3 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('MultiMarkdown metadata');
    expect(names).toContain('MultiMarkdown label: sec:intro');
    expect(names).toContain('Citation: doe2020');
    expect(names).toContain('Footnote: n');
  });

  it('adds MDX imports, exports, JSX elements, and expressions as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('MDX', 1, 2)]);
    const mdxIndex = doc.index as typeof doc.index & {
      mdxEsmDeclarations: Array<{
        raw: string;
        kind: 'import' | 'export';
        name: string;
        range: HeadingEntry['range'];
        nameRange: HeadingEntry['range'];
      }>;
      mdxJsxElements: Array<{
        raw: string;
        name: string;
        range: HeadingEntry['range'];
        nameRange: HeadingEntry['range'];
      }>;
      mdxExpressions: Array<{ raw: string; range: HeadingEntry['range'] }>;
    };
    mdxIndex.mdxEsmDeclarations = [
      {
        raw: "import Chart from './Chart'",
        kind: 'import',
        name: 'Chart',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 27 } },
        nameRange: { start: { line: 0, character: 7 }, end: { line: 0, character: 12 } },
      },
      {
        raw: 'export const title = "Demo"',
        kind: 'export',
        name: 'title',
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 27 } },
        nameRange: { start: { line: 1, character: 13 }, end: { line: 1, character: 18 } },
      },
    ];
    mdxIndex.mdxJsxElements = [
      {
        raw: '<Chart />',
        name: 'Chart',
        range: { start: { line: 4, character: 0 }, end: { line: 4, character: 9 } },
        nameRange: { start: { line: 4, character: 1 }, end: { line: 4, character: 6 } },
      },
    ];
    mdxIndex.mdxExpressions = [
      {
        raw: '{items.map((item) => <Item />)}',
        range: { start: { line: 6, character: 0 }, end: { line: 6, character: 31 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('MDX import: Chart');
    expect(names).toContain('MDX export: title');
    expect(names).toContain('MDX component: Chart');
    expect(names).toContain('MDX expression');
  });

  it('adds kramdown attributes, definition lists, tables, and footnotes as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('kramdown', 1, 0)]);
    const kramdownIndex = doc.index as typeof doc.index & {
      kramdownAttributes: Array<{
        raw: string;
        id?: string;
        classes: string[];
        range: HeadingEntry['range'];
        markerRange: HeadingEntry['range'];
      }>;
      kramdownDefinitionLists: Array<{
        raw: string;
        term: string;
        range: HeadingEntry['range'];
      }>;
      kramdownTables: Array<{
        raw: string;
        headerCells: string[];
        rowCount: number;
        range: HeadingEntry['range'];
      }>;
      kramdownFootnotes: Array<{
        raw: string;
        label: string;
        range: HeadingEntry['range'];
        labelRange: HeadingEntry['range'];
      }>;
    };
    kramdownIndex.kramdownAttributes = [
      {
        raw: '{#custom .hero}',
        id: 'custom',
        classes: ['hero'],
        range: { start: { line: 0, character: 12 }, end: { line: 0, character: 27 } },
        markerRange: { start: { line: 0, character: 13 }, end: { line: 0, character: 20 } },
      },
    ];
    kramdownIndex.kramdownDefinitionLists = [
      {
        raw: 'Term\n: Definition',
        term: 'Term',
        range: { start: { line: 2, character: 0 }, end: { line: 3, character: 12 } },
      },
    ];
    kramdownIndex.kramdownTables = [
      {
        raw: '| A | B |\n|---|---|',
        headerCells: ['A', 'B'],
        rowCount: 1,
        range: { start: { line: 5, character: 0 }, end: { line: 7, character: 9 } },
      },
    ];
    kramdownIndex.kramdownFootnotes = [
      {
        raw: '[^note]: body',
        label: 'note',
        range: { start: { line: 9, character: 0 }, end: { line: 9, character: 13 } },
        labelRange: { start: { line: 9, character: 2 }, end: { line: 9, character: 6 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('kramdown attribute: custom');
    expect(names).toContain('Definition: Term');
    expect(names).toContain('kramdown table: A, B');
    expect(names).toContain('Footnote: note');
  });

  it('adds Markdown Extra attributes, definition lists, tables, footnotes, and abbreviations as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Markdown Extra', 1, 0)]);
    const extraIndex = doc.index as typeof doc.index & {
      markdownExtraAttributes: Array<{
        raw: string;
        id?: string;
        classes: string[];
        range: HeadingEntry['range'];
        markerRange: HeadingEntry['range'];
      }>;
      markdownExtraDefinitionLists: Array<{
        raw: string;
        term: string;
        range: HeadingEntry['range'];
      }>;
      markdownExtraTables: Array<{
        raw: string;
        headerCells: string[];
        rowCount: number;
        range: HeadingEntry['range'];
      }>;
      markdownExtraFootnotes: Array<{
        raw: string;
        label: string;
        range: HeadingEntry['range'];
        labelRange: HeadingEntry['range'];
      }>;
      markdownExtraAbbreviations: Array<{
        raw: string;
        label: string;
        value: string;
        range: HeadingEntry['range'];
        labelRange: HeadingEntry['range'];
      }>;
    };
    extraIndex.markdownExtraAttributes = [
      {
        raw: '{#custom .hero}',
        id: 'custom',
        classes: ['hero'],
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 15 } },
        markerRange: { start: { line: 1, character: 1 }, end: { line: 1, character: 8 } },
      },
    ];
    extraIndex.markdownExtraDefinitionLists = [
      {
        raw: 'Term\n: Definition',
        term: 'Term',
        range: { start: { line: 3, character: 0 }, end: { line: 4, character: 12 } },
      },
    ];
    extraIndex.markdownExtraTables = [
      {
        raw: '| A | B |\n|---|---|',
        headerCells: ['A', 'B'],
        rowCount: 1,
        range: { start: { line: 6, character: 0 }, end: { line: 8, character: 9 } },
      },
    ];
    extraIndex.markdownExtraFootnotes = [
      {
        raw: '[^note]: body',
        label: 'note',
        range: { start: { line: 10, character: 0 }, end: { line: 10, character: 13 } },
        labelRange: { start: { line: 10, character: 2 }, end: { line: 10, character: 6 } },
      },
    ];
    extraIndex.markdownExtraAbbreviations = [
      {
        raw: '*[HTML]: Hyper Text Markup Language',
        label: 'HTML',
        value: 'Hyper Text Markup Language',
        range: { start: { line: 12, character: 0 }, end: { line: 12, character: 34 } },
        labelRange: { start: { line: 12, character: 2 }, end: { line: 12, character: 6 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('Markdown Extra attribute: custom');
    expect(names).toContain('Definition: Term');
    expect(names).toContain('Markdown Extra table: A, B');
    expect(names).toContain('Footnote: note');
    expect(names).toContain('Abbreviation: HTML');
  });

  it('adds R Markdown chunks and inline expressions as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('R Markdown', 1, 0)]);
    const rIndex = doc.index as typeof doc.index & {
      rMarkdownChunks: Array<{
        engine: string;
        label?: string;
        range: HeadingEntry['range'];
      }>;
      rMarkdownInlineExpressions: Array<{
        expression: string;
        range: HeadingEntry['range'];
      }>;
    };
    rIndex.rMarkdownChunks = [
      {
        engine: 'r',
        label: 'setup',
        range: { start: { line: 2, character: 0 }, end: { line: 4, character: 3 } },
      },
      {
        engine: 'python',
        label: 'plot',
        range: { start: { line: 6, character: 0 }, end: { line: 8, character: 3 } },
      },
    ];
    rIndex.rMarkdownInlineExpressions = [
      {
        expression: 'nrow(airquality)',
        range: { start: { line: 10, character: 17 }, end: { line: 10, character: 35 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('R Markdown chunk: setup');
    expect(names).toContain('R Markdown chunk: plot');
    expect(names).toContain('R Markdown inline: nrow(airquality)');
  });

  it('adds Reddit tables and host references as document symbols', () => {
    const doc = makeDoc(DOC_URI, [makeHeading('Reddit', 1, 0)]);
    const redditIndex = doc.index as typeof doc.index & {
      redditTables: Array<{
        raw: string;
        headerCells: string[];
        rowCount: number;
        range: HeadingEntry['range'];
      }>;
      redditHostReferences: Array<{
        raw: string;
        kind: 'subreddit' | 'user';
        target: string;
        range: HeadingEntry['range'];
      }>;
    };
    redditIndex.redditTables = [
      {
        raw: '| A | B |\n|---|---|',
        headerCells: ['A', 'B'],
        rowCount: 1,
        range: { start: { line: 2, character: 0 }, end: { line: 4, character: 9 } },
      },
    ];
    redditIndex.redditHostReferences = [
      {
        raw: 'r/ObsidianMD',
        kind: 'subreddit',
        target: 'ObsidianMD',
        range: { start: { line: 6, character: 4 }, end: { line: 6, character: 16 } },
      },
      {
        raw: 'u/example',
        kind: 'user',
        target: 'example',
        range: { start: { line: 6, character: 21 }, end: { line: 6, character: 30 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    const names = result.flatMap((symbol) => [
      symbol.name,
      ...(symbol.children?.map((child) => child.name) ?? []),
    ]);

    expect(names).toContain('Reddit table: A, B');
    expect(names).toContain('Subreddit: ObsidianMD');
    expect(names).toContain('Reddit user: example');
  });
});
