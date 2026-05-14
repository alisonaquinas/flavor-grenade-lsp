import { describe, it, expect, beforeEach } from '@jest/globals';
import { SemanticTokensHandler } from '../semantic-tokens.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry, TagEntry } from '../../parser/types.js';

function makeWikiLink(target: string, line: number, char: number): WikiLinkEntry {
  const raw = `[[${target}]]`;
  return {
    raw,
    target,
    range: {
      start: { line, character: char },
      end: { line, character: char + raw.length },
    },
  };
}

function makeTag(tag: string, line: number, char: number): TagEntry {
  return {
    tag,
    range: {
      start: { line, character: char },
      end: { line, character: char + tag.length },
    },
  };
}

function makeDoc(uri: string, overrides: Partial<OFMDoc['index']> = {}): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    text: '',
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      ...overrides,
    },
  };
}

const DOC_URI = 'file:///vault/test.md';

describe('SemanticTokensHandler', () => {
  let parseCache: ParseCache;
  let handler: SemanticTokensHandler;

  beforeEach(() => {
    parseCache = new ParseCache();
    handler = new SemanticTokensHandler(parseCache);
  });

  it('returns empty data array for empty document', () => {
    const doc = makeDoc(DOC_URI);
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });
    expect(result).toBeDefined();
    expect(result!.data).toEqual([]);
  });

  it('returns null when doc not in cache', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/missing.md' } });
    expect(result).toBeNull();
  });

  it('encodes wiki-link token with type index 0 (string)', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('target', 0, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data.length).toBeGreaterThanOrEqual(5);
    // First token: [deltaLine, deltaStartChar, length, tokenTypeIndex, tokenModifiersEncoded]
    // tokenTypeIndex for wiki-link = 0 (string)
    expect(result!.data[3]).toBe(0);
  });

  it('encodes tag token with type index 1 (keyword)', () => {
    const doc = makeDoc(DOC_URI, {
      tags: [makeTag('#todo', 2, 5)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data.length).toBeGreaterThanOrEqual(5);
    // tokenTypeIndex for tag = 1 (keyword)
    expect(result!.data[3]).toBe(1);
  });

  it('uses delta encoding correctly for multiple tokens', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('first', 0, 0), makeWikiLink('second', 0, 20)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    // Should have 10 integers (2 tokens × 5 each)
    expect(result!.data).toHaveLength(10);
    // First token: deltaLine=0, deltaStartChar=0
    expect(result!.data[0]).toBe(0);
    expect(result!.data[1]).toBe(0);
    // Second token: deltaLine=0, deltaStartChar = 20 - 0 = 20
    expect(result!.data[5]).toBe(0); // same line
    expect(result!.data[6]).toBe(20); // delta from position 0
  });

  it('encodes declaration modifier (bit 0) for wiki-links', () => {
    const doc = makeDoc(DOC_URI, {
      wikiLinks: [makeWikiLink('target', 1, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    // tokenModifiersEncoded for declaration = 1 << 0 = 1
    expect(result!.data[4]).toBe(1);
  });

  it('tag tokens have 0 modifier bits', () => {
    const doc = makeDoc(DOC_URI, {
      tags: [makeTag('#todo', 0, 0)],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data[4]).toBe(0);
  });

  it('encodes GFM task markers and strikethrough spans', () => {
    const doc = makeDoc(DOC_URI, {
      gfmTaskListItems: [
        {
          raw: '- [x] done',
          checked: true,
          text: 'done',
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
          markerRange: { start: { line: 0, character: 2 }, end: { line: 0, character: 5 } },
        },
      ],
      gfmStrikethroughs: [
        {
          raw: '~~old~~',
          text: 'old',
          range: { start: { line: 1, character: 0 }, end: { line: 1, character: 7 } },
          textRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 5 } },
        },
      ],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(10);
  });

  it('encodes GLFM inapplicable task markers and footnote labels', () => {
    const doc = makeDoc(DOC_URI, {
      glfmInapplicableTaskListItems: [
        {
          raw: '- [~] n/a',
          text: 'n/a',
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 9 } },
          markerRange: { start: { line: 0, character: 2 }, end: { line: 0, character: 5 } },
        },
      ],
      glfmFootnotes: [
        {
          raw: '[^a]: note',
          label: 'a',
          range: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
          labelRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 3 } },
        },
      ],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(10);
  });

  it('encodes Pandoc citations, footnote labels, and attributes', () => {
    const doc = makeDoc(DOC_URI, {
      pandocCitations: [
        {
          raw: '@doe99',
          key: 'doe99',
          range: { start: { line: 0, character: 4 }, end: { line: 0, character: 10 } },
          keyRange: { start: { line: 0, character: 5 }, end: { line: 0, character: 10 } },
        },
      ],
      pandocFootnotes: [
        {
          raw: '[^n]: note',
          label: 'n',
          range: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
          labelRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 3 } },
        },
      ],
      pandocAttributes: [
        {
          raw: '{#id}',
          id: 'id',
          classes: [],
          keyValues: {},
          range: { start: { line: 2, character: 0 }, end: { line: 2, character: 5 } },
        },
      ],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(15);
  });

  it('encodes MultiMarkdown metadata, labels, citations, and footnotes', () => {
    const doc = makeDoc(DOC_URI, {
      multimarkdownMetadata: [
        {
          raw: 'Title: Demo',
          key: 'Title',
          value: 'Demo',
          range: { start: { line: 0, character: 0 }, end: { line: 0, character: 11 } },
          keyRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 5 } },
        },
      ],
      multimarkdownLabels: [
        {
          raw: '[sec:intro]',
          label: 'sec:intro',
          range: { start: { line: 1, character: 8 }, end: { line: 1, character: 19 } },
          labelRange: { start: { line: 1, character: 9 }, end: { line: 1, character: 18 } },
        },
      ],
      multimarkdownCitations: [
        {
          raw: '[#doe2020]: Citation',
          key: 'doe2020',
          range: { start: { line: 2, character: 0 }, end: { line: 2, character: 21 } },
          keyRange: { start: { line: 2, character: 2 }, end: { line: 2, character: 9 } },
        },
      ],
      multimarkdownFootnotes: [
        {
          raw: '[^n]: note',
          label: 'n',
          range: { start: { line: 3, character: 0 }, end: { line: 3, character: 10 } },
          labelRange: { start: { line: 3, character: 2 }, end: { line: 3, character: 3 } },
        },
      ],
    });
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(20);
  });

  it('encodes MDX ESM declarations, JSX elements, and expressions', () => {
    const doc = makeDoc(DOC_URI);
    const mdxIndex = doc.index as typeof doc.index & {
      mdxEsmDeclarations: Array<{
        raw: string;
        kind: 'import' | 'export';
        name: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        nameRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      mdxJsxElements: Array<{
        raw: string;
        name: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        nameRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      mdxExpressions: Array<{
        raw: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    mdxIndex.mdxEsmDeclarations = [
      {
        raw: "import Chart from './Chart'",
        kind: 'import',
        name: 'Chart',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 27 } },
        nameRange: { start: { line: 0, character: 7 }, end: { line: 0, character: 12 } },
      },
    ];
    mdxIndex.mdxJsxElements = [
      {
        raw: '<Chart />',
        name: 'Chart',
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 9 } },
        nameRange: { start: { line: 1, character: 1 }, end: { line: 1, character: 6 } },
      },
    ];
    mdxIndex.mdxExpressions = [
      {
        raw: '{value}',
        range: { start: { line: 2, character: 0 }, end: { line: 2, character: 7 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(15);
  });

  it('encodes kramdown attributes and footnote labels', () => {
    const doc = makeDoc(DOC_URI);
    const kramdownIndex = doc.index as typeof doc.index & {
      kramdownAttributes: Array<{
        raw: string;
        classes: string[];
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        markerRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      kramdownFootnotes: Array<{
        raw: string;
        label: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        labelRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    kramdownIndex.kramdownAttributes = [
      {
        raw: '{#custom .hero}',
        classes: ['hero'],
        range: { start: { line: 0, character: 10 }, end: { line: 0, character: 25 } },
        markerRange: { start: { line: 0, character: 11 }, end: { line: 0, character: 18 } },
      },
    ];
    kramdownIndex.kramdownFootnotes = [
      {
        raw: '[^note]: body',
        label: 'note',
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 13 } },
        labelRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 6 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(10);
  });

  it('encodes Markdown Extra attributes, footnote labels, and abbreviation labels', () => {
    const doc = makeDoc(DOC_URI);
    const extraIndex = doc.index as typeof doc.index & {
      markdownExtraAttributes: Array<{
        raw: string;
        classes: string[];
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        markerRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      markdownExtraFootnotes: Array<{
        raw: string;
        label: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        labelRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      markdownExtraAbbreviations: Array<{
        raw: string;
        label: string;
        value: string;
        range: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        labelRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    extraIndex.markdownExtraAttributes = [
      {
        raw: '{#custom .hero}',
        classes: ['hero'],
        range: { start: { line: 0, character: 10 }, end: { line: 0, character: 25 } },
        markerRange: { start: { line: 0, character: 11 }, end: { line: 0, character: 18 } },
      },
    ];
    extraIndex.markdownExtraFootnotes = [
      {
        raw: '[^note]: body',
        label: 'note',
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 13 } },
        labelRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 6 } },
      },
    ];
    extraIndex.markdownExtraAbbreviations = [
      {
        raw: '*[HTML]: Hyper Text Markup Language',
        label: 'HTML',
        value: 'Hyper Text Markup Language',
        range: { start: { line: 2, character: 0 }, end: { line: 2, character: 34 } },
        labelRange: { start: { line: 2, character: 2 }, end: { line: 2, character: 6 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(15);
  });

  it('encodes R Markdown chunk labels, options, and inline expressions', () => {
    const doc = makeDoc(DOC_URI);
    const rIndex = doc.index as typeof doc.index & {
      rMarkdownChunks: Array<{
        engineRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        labelRange?: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
        optionRanges: Array<{
          start: { line: number; character: number };
          end: { line: number; character: number };
        }>;
      }>;
      rMarkdownInlineExpressions: Array<{
        expressionRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    rIndex.rMarkdownChunks = [
      {
        engineRange: { start: { line: 0, character: 4 }, end: { line: 0, character: 5 } },
        labelRange: { start: { line: 0, character: 6 }, end: { line: 0, character: 11 } },
        optionRanges: [
          { start: { line: 0, character: 13 }, end: { line: 0, character: 28 } },
          { start: { line: 0, character: 30 }, end: { line: 0, character: 41 } },
        ],
      },
    ];
    rIndex.rMarkdownInlineExpressions = [
      {
        expressionRange: {
          start: { line: 2, character: 8 },
          end: { line: 2, character: 23 },
        },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(25);
  });

  it('encodes Reddit spoiler text, superscripts, and host references', () => {
    const doc = makeDoc(DOC_URI);
    const redditIndex = doc.index as typeof doc.index & {
      redditSpoilers: Array<{
        textRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      redditSuperscripts: Array<{
        textRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      redditHostReferences: Array<{
        targetRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    redditIndex.redditSpoilers = [
      {
        textRange: { start: { line: 0, character: 2 }, end: { line: 0, character: 14 } },
      },
    ];
    redditIndex.redditSuperscripts = [
      {
        textRange: { start: { line: 1, character: 2 }, end: { line: 1, character: 14 } },
      },
    ];
    redditIndex.redditHostReferences = [
      {
        targetRange: { start: { line: 2, character: 2 }, end: { line: 2, character: 12 } },
      },
      {
        targetRange: { start: { line: 2, character: 15 }, end: { line: 2, character: 22 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(20);
  });

  it('encodes Stack Overflow tag, language, and spoiler tokens', () => {
    const doc = makeDoc(DOC_URI);
    const stackIndex = doc.index as typeof doc.index & {
      stackOverflowTagReferences: Array<{
        targetRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      stackOverflowLanguageDirectives: Array<{
        languageRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      stackOverflowFencedCodeBlocks: Array<{
        languageRange?: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
      stackOverflowSpoilers: Array<{
        textRange: {
          start: { line: number; character: number };
          end: { line: number; character: number };
        };
      }>;
    };
    stackIndex.stackOverflowTagReferences = [
      {
        targetRange: { start: { line: 0, character: 5 }, end: { line: 0, character: 13 } },
      },
    ];
    stackIndex.stackOverflowLanguageDirectives = [
      {
        languageRange: { start: { line: 1, character: 19 }, end: { line: 1, character: 26 } },
      },
    ];
    stackIndex.stackOverflowFencedCodeBlocks = [
      {
        languageRange: { start: { line: 2, character: 4 }, end: { line: 2, character: 11 } },
      },
    ];
    stackIndex.stackOverflowSpoilers = [
      {
        textRange: { start: { line: 4, character: 3 }, end: { line: 4, character: 14 } },
      },
    ];
    parseCache.set(DOC_URI, doc);

    const result = handler.handle({ textDocument: { uri: DOC_URI } });

    expect(result).not.toBeNull();
    expect(result!.data).toHaveLength(20);
  });
});
