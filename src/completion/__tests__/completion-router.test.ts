import { describe, it, expect, beforeEach } from '@jest/globals';
import { CompletionRouter } from '../completion-router.js';
import { ContextAnalyzer } from '../context-analyzer.js';
import { WikiLinkCompletionProvider } from '../../resolution/wiki-link-completion-provider.js';
import { HeadingCompletionProvider } from '../heading-completion-provider.js';
import { BlockRefCompletionProvider } from '../../resolution/block-ref-completion-provider.js';
import { EmbedCompletionProvider } from '../embed-completion-provider.js';
import { TagCompletionProvider } from '../tag-completion-provider.js';
import { CalloutCompletionProvider } from '../callout-completion-provider.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { Oracle } from '../../resolution/oracle.js';
import { TagRegistry } from '../../tags/tag-registry.js';
import { VaultScanner } from '../../vault/vault-scanner.js';
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
  } = {},
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
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
    },
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

  const contextAnalyzer = new ContextAnalyzer();
  const wikiLinkProvider = new WikiLinkCompletionProvider(folderLookup, vaultIndex);
  const headingProvider = new HeadingCompletionProvider(oracle, vaultIndex);
  const blockRefProvider = new BlockRefCompletionProvider(oracle, vaultIndex, parseCache);
  const embedProvider = new EmbedCompletionProvider(folderLookup, scanner, vaultIndex);
  const tagProvider = new TagCompletionProvider(tagRegistry);
  const calloutProvider = new CalloutCompletionProvider(vaultIndex);

  const router = new CompletionRouter(
    contextAnalyzer,
    wikiLinkProvider,
    headingProvider,
    blockRefProvider,
    embedProvider,
    tagProvider,
    calloutProvider,
    parseCache,
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
    });
  });

  // ── routing to block-ref provider ─────────────────────────────────────────────

  describe('block-ref routing', () => {
    it('routes [[#^ to BlockRefCompletionProvider (intra-doc)', () => {
      const currentDoc = makeDoc(TEST_URI, { blockAnchors: ['my-anchor'] });
      parseCache.set(TEST_URI, currentDoc);

      const text = '[[#^';
      router.setDocumentText(TEST_URI, text);
      const params = makeParams(TEST_URI, text, '^');

      const result = router.route(params);

      expect(result.items.some((i) => i.label === 'my-anchor')).toBe(true);
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
