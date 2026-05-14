import { describe, it, expect, beforeEach } from '@jest/globals';
import { CompletionRouter } from '../completion-router.js';
import { ContextAnalyzer } from '../context-analyzer.js';
import { WikiLinkCompletionProvider } from '../../resolution/wiki-link-completion-provider.js';
import { HeadingCompletionProvider } from '../heading-completion-provider.js';
import { BlockRefCompletionProvider } from '../../resolution/block-ref-completion-provider.js';
import { EmbedCompletionProvider } from '../embed-completion-provider.js';
import { TagCompletionProvider } from '../tag-completion-provider.js';
import { CalloutCompletionProvider } from '../callout-completion-provider.js';
import { MarkdownLinkCompletionProvider } from '../markdown-link-completion-provider.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { Oracle } from '../../resolution/oracle.js';
import { TagRegistry } from '../../tags/tag-registry.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
import { ServerSettings } from '../../lsp/services/server-settings.js';
import type { OFMDoc } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeDoc(
  uri: string,
  {
    headings = [] as Array<{ level: number; text: string }>,
    blockAnchors = [] as string[],
    callouts = [] as string[],
    frontmatter = null as Record<string, unknown> | null,
    markdownFlavor = 'obsidian' as OFMDoc['markdownFlavor'],
  } = {},
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: blockAnchors.map((anchorId) => ({
        id: anchorId,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      })),
      tags: [],
      callouts: callouts.map((type) => ({
        type,
        depth: 1,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      })),
      headings: headings.map((h) => ({
        level: h.level,
        text: h.text,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      })),
      markdownLinks: [],
      markdownImages: [],
      linkLabelRefs: [],
      linkLabelDefs: [],
    },
    markdownFlavor,
    parseContext: { effectiveFlavor: markdownFlavor },
  };
}

/** Stub VaultScanner with no assets. */
class StubVaultScanner {
  getAssetIndex(): Set<string> {
    return new Set();
  }
}

function buildRouter(): {
  router: CompletionRouter;
  parseCache: ParseCache;
  vaultIndex: VaultIndex;
  folderLookup: FolderLookup;
} {
  const parseCache = new ParseCache();
  const vaultIndex = new VaultIndex();
  const folderLookup = new FolderLookup();
  const oracle = new Oracle(folderLookup, vaultIndex);
  const tagRegistry = new TagRegistry();
  const scanner = new StubVaultScanner() as unknown as VaultScanner;
  const settings = new ServerSettings();

  const contextAnalyzer = new ContextAnalyzer();
  const wikiLinkProvider = new WikiLinkCompletionProvider(folderLookup, vaultIndex);
  const headingProvider = new HeadingCompletionProvider(oracle, vaultIndex);
  const blockRefProvider = new BlockRefCompletionProvider(oracle, vaultIndex, parseCache);
  const embedProvider = new EmbedCompletionProvider(folderLookup, scanner, vaultIndex);
  const tagProvider = new TagCompletionProvider(tagRegistry);
  const calloutProvider = new CalloutCompletionProvider(vaultIndex);
  const markdownLinkProvider = new MarkdownLinkCompletionProvider(vaultIndex, oracle);

  const router = new CompletionRouter(
    contextAnalyzer,
    wikiLinkProvider,
    headingProvider,
    blockRefProvider,
    embedProvider,
    tagProvider,
    calloutProvider,
    markdownLinkProvider,
    parseCache,
    vaultIndex,
    settings,
  );

  return { router, parseCache, vaultIndex, folderLookup };
}

/**
 * Build a minimal params object for textDocument/completion.
 * Position is derived from the given text (cursor at end of text).
 */
function makeParams(
  uri: string,
  text: string,
  triggerChar?: string,
): {
  textDocument: { uri: string };
  position: { line: number; character: number };
  context?: { triggerCharacter?: string };
} {
  const lines = text.split('\n');
  const line = lines.length - 1;
  const character = (lines[line] as string).length;
  return {
    textDocument: { uri },
    position: { line, character },
    context: triggerChar !== undefined ? { triggerCharacter: triggerChar } : undefined,
  };
}

const TEST_URI = 'file:///vault/current.md';

describe('CompletionRouter', () => {
  let router: CompletionRouter;
  let parseCache: ParseCache;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;

  beforeEach(() => {
    ({ router, parseCache, vaultIndex, folderLookup } = buildRouter());
  });

  // ── routing to wiki-link provider ─────────────────────────────────────────────

  describe('wiki-link routing', () => {
    it('routes [[ trigger to WikiLinkCompletionProvider', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '[');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'alpha')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 2 }, end: { line: 0, character: 2 } },
        newText: 'alpha',
      });
    });

    it('suppresses inactive Obsidian completions for Original Markdown', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'original' }));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '[');

      const result = router.route(params);

      expect(result.items).toHaveLength(0);
      expect(result.isIncomplete).toBe(false);
    });

    it('suppresses inactive Obsidian completions for CommonMark', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'commonmark' }));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '[');

      const result = router.route(params);

      expect(result.items).toHaveLength(0);
      expect(result.isIncomplete).toBe(false);
    });
  });

  describe('Obsidian flavor routing', () => {
    it('keeps Obsidian-only completions active for the Obsidian flavor', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const wikiText = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'obsidian' }));
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      const calloutText = '> [!';
      router.setDocumentText(TEST_URI, calloutText);
      const calloutResult = router.route(makeParams(TEST_URI, calloutText, '!'));

      expect(wikiResult.items.some((item) => item.label === 'alpha')).toBe(true);
      expect(calloutResult.items.some((item) => item.label === 'NOTE')).toBe(true);
    });
  });

  describe('GFM flavor routing', () => {
    it('offers table and task-list snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'gfm' }));

      const tableText = '|';
      router.setDocumentText(TEST_URI, tableText);
      const tableResult = router.route(makeParams(TEST_URI, tableText, '|'));

      const taskText = '- ';
      router.setDocumentText(TEST_URI, taskText);
      const taskResult = router.route(makeParams(TEST_URI, taskText, ' '));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(tableResult.items.map((item) => item.label)).toContain('GFM table');
      expect(taskResult.items.map((item) => item.label)).toContain('GFM task item');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('GLFM flavor routing', () => {
    it('offers GLFM snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'glfm' }));

      const taskText = '- ';
      router.setDocumentText(TEST_URI, taskText);
      const taskResult = router.route(makeParams(TEST_URI, taskText, ' '));

      const tocText = '[';
      router.setDocumentText(TEST_URI, tocText);
      const tocResult = router.route(makeParams(TEST_URI, tocText, '['));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(taskResult.items.map((item) => item.label)).toContain('GLFM inapplicable task item');
      expect(tocResult.items.map((item) => item.label)).toContain('GLFM table of contents');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('Pandoc flavor routing', () => {
    it('offers Pandoc snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'pandoc' }));

      const citationText = '[@';
      router.setDocumentText(TEST_URI, citationText);
      const citationResult = router.route(makeParams(TEST_URI, citationText, '@'));

      const attributeText = '{';
      router.setDocumentText(TEST_URI, attributeText);
      const attributeResult = router.route(makeParams(TEST_URI, attributeText, '{'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(citationResult.items.map((item) => item.label)).toContain('Pandoc citation');
      expect(attributeResult.items.map((item) => item.label)).toContain('Pandoc attribute set');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('MultiMarkdown flavor routing', () => {
    it('offers MultiMarkdown snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'multimarkdown' }));

      const metadataText = 'Tit';
      router.setDocumentText(TEST_URI, metadataText);
      const metadataResult = router.route(makeParams(TEST_URI, metadataText, 't'));

      const citationText = '[](#';
      router.setDocumentText(TEST_URI, citationText);
      const citationResult = router.route(makeParams(TEST_URI, citationText, '#'));

      const footnoteText = '[^';
      router.setDocumentText(TEST_URI, footnoteText);
      const footnoteResult = router.route(makeParams(TEST_URI, footnoteText, '^'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(metadataResult.items.map((item) => item.label)).toContain(
        'MultiMarkdown metadata key',
      );
      expect(citationResult.items.map((item) => item.label)).toContain('MultiMarkdown citation');
      expect(footnoteResult.items.map((item) => item.label)).toContain('MultiMarkdown footnote');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('MDX flavor routing', () => {
    it('offers MDX snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'mdx' }));

      const componentText = '<';
      router.setDocumentText(TEST_URI, componentText);
      const componentResult = router.route(makeParams(TEST_URI, componentText, '<'));

      const expressionText = '{';
      router.setDocumentText(TEST_URI, expressionText);
      const expressionResult = router.route(makeParams(TEST_URI, expressionText, '{'));

      const exportText = 'export ';
      router.setDocumentText(TEST_URI, exportText);
      const exportResult = router.route(makeParams(TEST_URI, exportText, ' '));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(componentResult.items.map((item) => item.label)).toContain('MDX component');
      expect(expressionResult.items.map((item) => item.label)).toContain('MDX expression');
      expect(exportResult.items.map((item) => item.label)).toContain('MDX named export');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('kramdown flavor routing', () => {
    it('offers kramdown snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'kramdown' }));

      const attributeText = '{:';
      router.setDocumentText(TEST_URI, attributeText);
      const attributeResult = router.route(makeParams(TEST_URI, attributeText, ':'));

      const footnoteText = '[^';
      router.setDocumentText(TEST_URI, footnoteText);
      const footnoteResult = router.route(makeParams(TEST_URI, footnoteText, '^'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(attributeResult.items.map((item) => item.label)).toContain('kramdown attribute');
      expect(footnoteResult.items.map((item) => item.label)).toContain('kramdown footnote');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('Markdown Extra flavor routing', () => {
    it('offers Markdown Extra snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'markdown-extra' }));

      const tableText = '|';
      router.setDocumentText(TEST_URI, tableText);
      const tableResult = router.route(makeParams(TEST_URI, tableText, '|'));

      const footnoteText = '[^';
      router.setDocumentText(TEST_URI, footnoteText);
      const footnoteResult = router.route(makeParams(TEST_URI, footnoteText, '^'));

      const abbreviationText = '*[';
      router.setDocumentText(TEST_URI, abbreviationText);
      const abbreviationResult = router.route(makeParams(TEST_URI, abbreviationText, '['));

      const attributeText = '{';
      router.setDocumentText(TEST_URI, attributeText);
      const attributeResult = router.route(makeParams(TEST_URI, attributeText, '{'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(tableResult.items.map((item) => item.label)).toContain('Markdown Extra table');
      expect(footnoteResult.items.map((item) => item.label)).toContain('Markdown Extra footnote');
      expect(abbreviationResult.items.map((item) => item.label)).toContain(
        'Markdown Extra abbreviation',
      );
      expect(attributeResult.items.map((item) => item.label)).toContain('Markdown Extra attribute');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('R Markdown flavor routing', () => {
    it('offers R Markdown snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'r-markdown' }));

      const chunkText = '```{';
      router.setDocumentText(TEST_URI, chunkText);
      const chunkResult = router.route(makeParams(TEST_URI, chunkText, '{'));

      const optionText = '```{r setup, ';
      router.setDocumentText(TEST_URI, optionText);
      const optionResult = router.route(makeParams(TEST_URI, optionText, ' '));

      const inlineText = '`r';
      router.setDocumentText(TEST_URI, inlineText);
      const inlineResult = router.route(makeParams(TEST_URI, inlineText, 'r'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(chunkResult.items.map((item) => item.label)).toContain('R Markdown chunk');
      expect(optionResult.items.map((item) => item.label)).toContain('R Markdown chunk option');
      expect(inlineResult.items.map((item) => item.label)).toContain(
        'R Markdown inline expression',
      );
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('Reddit flavor routing', () => {
    it('offers Reddit snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'reddit' }));

      const spoilerText = '>!';
      router.setDocumentText(TEST_URI, spoilerText);
      const spoilerResult = router.route(makeParams(TEST_URI, spoilerText, '!'));

      const superscriptText = '^(';
      router.setDocumentText(TEST_URI, superscriptText);
      const superscriptResult = router.route(makeParams(TEST_URI, superscriptText, '('));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(spoilerResult.items.map((item) => item.label)).toContain('Reddit spoiler');
      expect(superscriptResult.items.map((item) => item.label)).toContain('Reddit superscript');
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  describe('Stack Overflow flavor routing', () => {
    it('offers Stack Overflow snippets without enabling Obsidian completions', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI, { markdownFlavor: 'stack-overflow' }));

      const tagText = '[tag:';
      router.setDocumentText(TEST_URI, tagText);
      const tagResult = router.route(makeParams(TEST_URI, tagText, ':'));

      const languageText = '<!-- language';
      router.setDocumentText(TEST_URI, languageText);
      const languageResult = router.route(makeParams(TEST_URI, languageText, 'e'));

      const wikiText = '[[';
      router.setDocumentText(TEST_URI, wikiText);
      const wikiResult = router.route(makeParams(TEST_URI, wikiText, '['));

      expect(tagResult.items.map((item) => item.label)).toContain('Stack Overflow tag reference');
      expect(languageResult.items.map((item) => item.label)).toContain(
        'Stack Overflow language directive',
      );
      expect(wikiResult.items).toHaveLength(0);
    });
  });

  // ── routing to heading provider ───────────────────────────────────────────────

  describe('heading routing', () => {
    it('routes [[doc# to HeadingCompletionProvider', () => {
      const docId = id('guide');
      vaultIndex.set(
        docId,
        makeDoc('file:///vault/guide.md', {
          headings: [{ level: 1, text: 'Overview' }],
        }),
      );
      folderLookup.rebuild(vaultIndex);

      const text = '[[guide#';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '#');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'Overview')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 8 }, end: { line: 0, character: 8 } },
        newText: 'Overview',
      });
    });

    it('routes [[# to headings from the current parsed document', () => {
      const currentDoc = makeDoc(TEST_URI, {
        headings: [
          { level: 1, text: 'Draft Heading' },
          { level: 2, text: 'Other Heading' },
        ],
      });
      parseCache.set(TEST_URI, currentDoc);

      const text = '[[#Draft';
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '#');

      const result = router.route(params);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].label).toBe('Draft Heading');
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 3 }, end: { line: 0, character: 8 } },
        newText: 'Draft Heading',
      });
    });
  });

  // ── routing to block-ref provider ─────────────────────────────────────────────

  describe('markdown-link routing', () => {
    it('routes Markdown image targets to attachment completions only', () => {
      vaultIndex.set(id('assets/diagram'), makeDoc('file:///vault/assets/diagram.md'));
      vaultIndex.setAttachment({
        path: 'assets/diagram.png',
        uri: 'file:///vault/assets/diagram.png',
        extension: 'png',
        kind: 'image',
        sizeBytes: 42,
      });
      folderLookup.rebuild(vaultIndex);

      const text = '![Diagram](assets/d';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);

      const result = router.route(makeParams(TEST_URI, text, '('));

      expect(result.items.map((item) => item.label)).toEqual(['assets/diagram.png']);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 11 }, end: { line: 0, character: 19 } },
        newText: 'assets/diagram.png',
      });
    });

    it('ranks preferred attachment-folder completions first without hiding others', () => {
      vaultIndex.setAttachmentFolderHint('assets');
      vaultIndex.setAttachment({
        path: 'other/manual.pdf',
        uri: 'file:///vault/other/manual.pdf',
        extension: 'pdf',
        kind: 'pdf',
        sizeBytes: 42,
      });
      vaultIndex.setAttachment({
        path: 'assets/diagram.png',
        uri: 'file:///vault/assets/diagram.png',
        extension: 'png',
        kind: 'image',
        sizeBytes: 42,
      });

      const text = '![Diagram](';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);

      const result = router.route(makeParams(TEST_URI, text, '('));

      expect(result.items.map((item) => item.label)).toEqual([
        'assets/diagram.png',
        'other/manual.pdf',
      ]);
    });

    it('routes [text]( to Markdown document completions', () => {
      vaultIndex.set(id('alpha'), makeDoc('file:///vault/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '[See](';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);

      const result = router.route(makeParams(TEST_URI, text, '('));

      expect(result.items.some((item) => item.label === 'alpha')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 6 }, end: { line: 0, character: 6 } },
        newText: 'alpha.md',
      });
    });

    it('uses vault-relative source DocId for nested Markdown document completions', () => {
      const nestedUri = 'file:///vault/notes/source.md';
      vaultIndex.set(id('notes/source'), makeDoc(nestedUri));
      vaultIndex.set(id('notes/alpha'), makeDoc('file:///vault/notes/alpha.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '[See](';
      parseCache.set(nestedUri, makeDoc(nestedUri));
      router.setDocumentText(nestedUri, text);

      const result = router.route(makeParams(nestedUri, text, '('));

      expect(result.items.find((item) => item.detail === 'notes/alpha')?.textEdit).toEqual({
        range: { start: { line: 0, character: 6 }, end: { line: 0, character: 6 } },
        newText: 'alpha.md',
      });
    });

    it('routes [text](# to current document heading completions', () => {
      const currentDoc = makeDoc(TEST_URI, { headings: [{ level: 1, text: 'Overview' }] });
      parseCache.set(TEST_URI, currentDoc);

      const text = '[See](#Ov';
      router.setDocumentText(TEST_URI, text);

      const result = router.route(makeParams(TEST_URI, text, '#'));

      expect(result.items).toHaveLength(1);
      expect(result.items[0].label).toBe('Overview');
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 7 }, end: { line: 0, character: 9 } },
        newText: 'Overview',
      });
    });

    it('suppresses Markdown completions for external URL targets', () => {
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      const text = '[External](https://';
      router.setDocumentText(TEST_URI, text);

      const result = router.route(makeParams(TEST_URI, text, '/'));

      expect(result.items).toHaveLength(0);
    });
  });

  describe('block-ref routing', () => {
    it('routes [[#^ to BlockRefCompletionProvider (intra-doc)', () => {
      const currentDoc = makeDoc(TEST_URI, { blockAnchors: ['my-anchor'] });
      parseCache.set(TEST_URI, currentDoc);

      const text = '[[#^';
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '^');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'my-anchor')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 4 }, end: { line: 0, character: 4 } },
        newText: 'my-anchor',
      });
    });

    it('does not duplicate doc#^ when completing cross-document blocks', () => {
      const docId = id('guide');
      vaultIndex.set(docId, makeDoc('file:///vault/guide.md', { blockAnchors: ['block-one'] }));
      folderLookup.rebuild(vaultIndex);
      parseCache.set(TEST_URI, makeDoc(TEST_URI));

      const text = '[[guide#^blo';
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '^');

      const result = router.route(params);

      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 9 }, end: { line: 0, character: 12 } },
        newText: 'block-one',
      });
    });
  });

  // ── routing to embed provider ─────────────────────────────────────────────────

  describe('embed routing', () => {
    it('routes ![[  to EmbedCompletionProvider', () => {
      vaultIndex.set(id('image'), makeDoc('file:///vault/image.md'));
      folderLookup.rebuild(vaultIndex);

      const text = '![[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '!');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'image')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 3 }, end: { line: 0, character: 3 } },
        newText: 'image',
      });
    });
  });

  // ── routing to callout provider ───────────────────────────────────────────────

  describe('callout routing', () => {
    it('routes > [! to CalloutCompletionProvider', () => {
      const text = '> [!';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '>');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'NOTE')).toBe(true);
      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 4 }, end: { line: 0, character: 4 } },
        newText: 'NOTE] ',
      });
    });
  });

  // ── candidates cap ────────────────────────────────────────────────────────────

  describe('candidates cap', () => {
    it('caps results at 50 and sets isIncomplete=true when exceeded', () => {
      // Add 60 docs to exceed the cap
      for (let i = 0; i < 60; i++) {
        const docId = id(`doc${i.toString().padStart(2, '0')}`);
        vaultIndex.set(docId, makeDoc(`file:///vault/doc${i}.md`));
      }
      folderLookup.rebuild(vaultIndex);

      const text = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '[');

      const result = router.route(params);

      expect(result.items.length).toBe(50);
      expect(result.isIncomplete).toBe(true);
    });

    it('does not set isIncomplete when at or under cap', () => {
      for (let i = 0; i < 5; i++) {
        vaultIndex.set(id(`doc${i}`), makeDoc(`file:///vault/doc${i}.md`));
      }
      folderLookup.rebuild(vaultIndex);

      const text = '[[';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '[');

      const result = router.route(params);

      expect(result.items.length).toBe(5);
      expect(result.isIncomplete).toBe(false);
    });

    it('uses configured completion.candidates cap', () => {
      for (let i = 0; i < 8; i++) {
        vaultIndex.set(id(`doc${i}`), makeDoc(`file:///vault/doc${i}.md`));
      }
      folderLookup.rebuild(vaultIndex);
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, '[[');
      (router as unknown as { settings: ServerSettings }).settings.applyInitializationOptions({
        completionCandidates: 5,
      });

      const result = router.route(makeParams(TEST_URI, '[[', '['));

      expect(result.items).toHaveLength(5);
      expect(result.isIncomplete).toBe(true);
    });
  });

  describe('link styles', () => {
    it('uses title-slug completion text when configured', () => {
      vaultIndex.set(
        id('notes/alpha'),
        makeDoc('file:///vault/notes/alpha.md', {
          frontmatter: { title: 'Alpha Document' },
        }),
      );
      folderLookup.rebuild(vaultIndex);
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, '[[');
      (router as unknown as { settings: ServerSettings }).settings.applyInitializationOptions({
        linkStyle: 'title-slug',
      });

      const result = router.route(makeParams(TEST_URI, '[[', '['));

      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 2 }, end: { line: 0, character: 2 } },
        newText: 'Alpha Document',
      });
    });

    it('maps legacy relative-path to file-path-stem completion text', () => {
      vaultIndex.set(id('notes/alpha'), makeDoc('file:///vault/notes/alpha.md'));
      folderLookup.rebuild(vaultIndex);
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, '[[');
      (router as unknown as { settings: ServerSettings }).settings.applyInitializationOptions({
        linkStyle: 'relative-path',
      });

      const result = router.route(makeParams(TEST_URI, '[[', '['));

      expect(result.items[0].textEdit).toEqual({
        range: { start: { line: 0, character: 2 }, end: { line: 0, character: 2 } },
        newText: 'notes/alpha',
      });
    });
  });

  // ── none context ──────────────────────────────────────────────────────────────

  describe('none context', () => {
    it('returns empty items when context is none', () => {
      const text = 'plain text';
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text);

      const result = router.route(params);

      expect(result.items).toHaveLength(0);
      expect(result.isIncomplete).toBe(false);
    });
  });

  // ── missing document ──────────────────────────────────────────────────────────

  describe('missing document in parseCache', () => {
    it('returns empty items when document is not in parseCache', () => {
      const params = makeParams('file:///vault/missing.md', '[[', '[');
      const result = router.route(params);
      expect(result.items).toHaveLength(0);
    });
  });

  // ── missing raw text ──────────────────────────────────────────────────────────

  describe('missing raw text', () => {
    it('returns empty items when raw text not registered', () => {
      // doc is in parseCache but setDocumentText was not called
      parseCache.set(TEST_URI, makeDoc(TEST_URI));
      const params = makeParams(TEST_URI, '[[', '[');
      const result = router.route(params);
      expect(result.items).toHaveLength(0);
    });
  });
});
