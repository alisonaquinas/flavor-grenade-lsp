import { describe, it, expect, beforeEach } from '@jest/globals';
import { pathToFileURL } from 'url';
import * as path from 'path';
import { RenameHandler } from '../rename.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import type { OFMDoc, HeadingEntry, WikiLinkEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function docId(s: string): DocId {
  return s as DocId;
}

const RANGE = (
  sl: number,
  sc: number,
  el: number,
  ec: number,
): { start: { line: number; character: number }; end: { line: number; character: number } } => ({
  start: { line: sl, character: sc },
  end: { line: el, character: ec },
});

function makeDoc(uri: string, overrides: Partial<OFMDoc['index']> = {}): OFMDoc {
  return {
    uri,
    version: 1,
    frontmatter: null,
    frontmatterEndOffset: 0,
    text: '',
    opaqueRegions: [],
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

describe('RenameHandler', () => {
  let parseCache: ParseCache;
  let refGraph: RefGraph;
  let vaultIndex: VaultIndex;
  let vaultDetector: VaultDetector;
  let handler: RenameHandler;
  let oracle: Oracle;

  const betaUri = 'file:///vault/beta.md';
  const alphaUri = 'file:///vault/alpha.md';

  beforeEach(() => {
    parseCache = new ParseCache();
    refGraph = new RefGraph();
    vaultIndex = new VaultIndex();
    vaultDetector = new VaultDetector();
    const folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    handler = new RenameHandler(parseCache, refGraph, vaultIndex, vaultDetector);
  });

  it('returns empty WorkspaceEdit when document not in parse cache', () => {
    const result = handler.handle({
      textDocument: { uri: betaUri },
      position: { line: 0, character: 0 },
      newName: 'New Name',
    });
    expect(result.changes).toEqual({});
  });

  it('returns empty WorkspaceEdit when cursor is not on a renameable entity', () => {
    const doc = makeDoc(betaUri);
    parseCache.set(betaUri, doc);

    const result = handler.handle({
      textDocument: { uri: betaUri },
      position: { line: 0, character: 0 },
      newName: 'New Name',
    });
    expect(result.changes).toEqual({});
  });

  describe('file rename', () => {
    // Use a platform-appropriate absolute path so pathToFileURL produces the
    // same URI on both Linux CI and Windows development machines.
    const vaultRoot = process.platform === 'win32' ? 'C:/vault' : '/vault';
    const betaUri = pathToFileURL(path.join(vaultRoot, 'beta.md')).href;
    const alphaUri = pathToFileURL(path.join(vaultRoot, 'alpha.md')).href;
    const gammaUri = pathToFileURL(path.join(vaultRoot, 'gamma.md')).href;

    // Helper: build a RenameHandler with a stubbed VaultDetector that returns vaultRoot.
    function makeHandlerWithVaultRoot(
      pc: ParseCache,
      rg: RefGraph,
      vi: VaultIndex,
      root: string | null,
    ): RenameHandler {
      const stubbedDetector = {
        detect: (_path: string) => ({
          mode: 'obsidian' as const,
          vaultRoot: root,
        }),
      } as unknown as VaultDetector;
      return new RenameHandler(pc, rg, vi, stubbedDetector);
    }

    // Helper: set up alpha doc with a single wiki-link and rebuild refGraph.
    function setupAlphaWithLink(
      vi: VaultIndex,
      rg: RefGraph,
      wikiLink: WikiLinkEntry,
    ): ReturnType<typeof makeDoc> {
      const betaDoc = makeDoc(betaUri);
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });

      vi.set(docId('beta'), betaDoc);
      vi.set(docId('alpha'), alphaDoc);

      const folderLookup = new FolderLookup();
      folderLookup.rebuild(vi);
      const localOracle = new Oracle(folderLookup, vi);
      rg.rebuild(vi, localOracle);

      return alphaDoc;
    }

    it('stem-style link: produces RenameFile change and text edit updating [[beta]] to [[gamma]]', () => {
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta]]',
        target: 'beta',
        range: RANGE(0, 0, 0, 8),
      };

      const alphaDoc = setupAlphaWithLink(vaultIndex, refGraph, wikiLink);
      parseCache.set(alphaUri, alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 4 },
        newName: 'gamma',
      });

      // Should have a RenameFile document change: beta → gamma.
      expect(result.documentChanges).toBeDefined();
      expect(result.documentChanges).toHaveLength(1);
      const rename = result.documentChanges![0];
      expect(rename.kind).toBe('rename');
      expect(rename.oldUri).toBe(betaUri);
      expect(rename.newUri).toBe(gammaUri);

      // Alpha should have a text edit replacing [[beta]] with [[gamma]].
      expect(result.changes[alphaUri]).toBeDefined();
      expect(result.changes[alphaUri]).toHaveLength(1);
      expect(result.changes[alphaUri][0].newText).toBe('[[gamma]]');
    });

    it('path-style link: text edit uses full docId path [[notes/gamma]]', () => {
      // notes/beta is the docId; the raw link uses a path-style target.
      const wikiLink: WikiLinkEntry = {
        raw: '[[notes/beta]]',
        target: 'notes/beta',
        range: RANGE(0, 0, 0, 14),
      };

      const betaDoc = makeDoc('file:///C:/vault/notes/beta.md');
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });

      vaultIndex.set(docId('notes/beta'), betaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      const folderLookup = new FolderLookup();
      folderLookup.rebuild(vaultIndex);
      const localOracle = new Oracle(folderLookup, vaultIndex);
      refGraph.rebuild(vaultIndex, localOracle);

      parseCache.set(alphaUri, alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 7 },
        newName: 'gamma',
      });

      // Text edit should use the full path-style docId: notes/gamma.
      expect(result.changes[alphaUri]).toBeDefined();
      const editText = result.changes[alphaUri][0].newText;
      expect(editText).toBe('[[notes/gamma]]');
    });

    it('alias identity rule: alias matching old stem is updated to new stem', () => {
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta|beta]]',
        target: 'beta',
        alias: 'beta',
        range: RANGE(0, 0, 0, 13),
      };

      const alphaDoc = setupAlphaWithLink(vaultIndex, refGraph, wikiLink);
      parseCache.set(alphaUri, alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 4 },
        newName: 'gamma',
      });

      expect(result.changes[alphaUri]).toBeDefined();
      expect(result.changes[alphaUri][0].newText).toBe('[[gamma|gamma]]');
    });

    it('alias identity rule: alias differing from old stem is preserved', () => {
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta|my alias]]',
        target: 'beta',
        alias: 'my alias',
        range: RANGE(0, 0, 0, 17),
      };

      const alphaDoc = setupAlphaWithLink(vaultIndex, refGraph, wikiLink);
      parseCache.set(alphaUri, alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 4 },
        newName: 'gamma',
      });

      expect(result.changes[alphaUri]).toBeDefined();
      expect(result.changes[alphaUri][0].newText).toBe('[[gamma|my alias]]');
    });

    it('zero references: result has RenameFile in documentChanges but no text edits', () => {
      // Only beta.md in vault; no doc links to it. Cursor doc has the [[beta]]
      // wiki-link so the handler dispatches to fileRename, but refGraph has
      // no incoming refs to beta.
      const betaDoc = makeDoc(betaUri);
      // alphaDoc has a [[beta]] link — this is what the cursor is on.
      const alphaDoc = makeDoc(alphaUri, {
        wikiLinks: [{ raw: '[[beta]]', target: 'beta', range: RANGE(0, 0, 0, 8) }],
      });

      // vaultIndex needs beta so resolveTargetDocId finds it.
      // vaultIndex needs alpha so docIdToUriFromIndex can map it (but there are
      // no incoming refs, so no text edits will be emitted).
      vaultIndex.set(docId('beta'), betaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      // Build a refGraph from a vault that has only beta (no alpha) so that
      // getRefsTo('beta') returns an empty array.
      const indexWithOnlyBeta = new VaultIndex();
      indexWithOnlyBeta.set(docId('beta'), betaDoc);
      const fl = new FolderLookup();
      fl.rebuild(indexWithOnlyBeta);
      const o = new Oracle(fl, indexWithOnlyBeta);
      refGraph.rebuild(indexWithOnlyBeta, o);

      parseCache.set(alphaUri, alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 4 },
        newName: 'gamma',
      });

      // RenameFile should be present.
      expect(result.documentChanges).toBeDefined();
      expect(result.documentChanges!.some((c) => c.kind === 'rename')).toBe(true);
      // No text edits because no doc references beta.
      expect(Object.keys(result.changes)).toHaveLength(0);
    });

    it('returns empty edit when vaultRoot cannot be resolved (detector returns null, empty index)', () => {
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta]]',
        target: 'beta',
        range: RANGE(0, 0, 0, 8),
      };
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });
      parseCache.set(alphaUri, alphaDoc);
      // vaultIndex is empty: no fallback via index scan either.

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, null);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 4 },
        newName: 'gamma',
      });

      expect(result.changes).toEqual({});
      expect(result.documentChanges).toBeUndefined();
    });

    it('empty target wiki-link: resolveTargetDocId returns null, handle returns empty edit', () => {
      const wikiLink: WikiLinkEntry = {
        raw: '[[]]',
        target: '',
        range: RANGE(0, 0, 0, 4),
      };
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });
      parseCache.set(alphaUri, alphaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      const h = makeHandlerWithVaultRoot(parseCache, refGraph, vaultIndex, vaultRoot);
      const result = h.handle({
        textDocument: { uri: alphaUri },
        position: { line: 0, character: 2 },
        newName: 'gamma',
      });

      expect(result.changes).toEqual({});
      expect(result.documentChanges).toBeUndefined();
    });
  });

  describe('heading rename', () => {
    it('renames heading text at source with no refs (zero-reference rename, TASK-114)', () => {
      // "## Old Heading" at line 0
      const heading: HeadingEntry = {
        level: 2,
        text: 'Old Heading',
        range: RANGE(0, 0, 0, 14),
      };
      const doc = makeDoc(betaUri, { headings: [heading] });
      parseCache.set(betaUri, doc);
      vaultIndex.set(docId('beta'), doc);
      refGraph.rebuild(vaultIndex, oracle);

      const result = handler.handle({
        textDocument: { uri: betaUri },
        position: { line: 0, character: 5 },
        newName: 'New Heading',
      });

      // Should contain at least the source edit
      expect(result.changes[betaUri]).toBeDefined();
      expect(result.changes[betaUri]).toHaveLength(1);
      const edit = result.changes[betaUri][0];
      expect(edit.newText).toBe('New Heading');
      // Range should cover the heading text (after "## ")
      expect(edit.range.start.character).toBe(3);
    });

    it('updates heading text and all refs in other docs', () => {
      // beta.md has heading "## Section One" at line 0
      const heading: HeadingEntry = {
        level: 2,
        text: 'Section One',
        range: RANGE(0, 0, 0, 14),
      };

      // alpha.md has a wiki-link [[beta#Section One]]
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta#Section One]]',
        target: 'beta',
        heading: 'Section One',
        range: RANGE(0, 0, 0, 20),
      };

      const betaDoc = makeDoc(betaUri, { headings: [heading] });
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });

      parseCache.set(betaUri, betaDoc);
      parseCache.set(alphaUri, alphaDoc);

      vaultIndex.set(docId('beta'), betaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      const folderLookup = new FolderLookup();
      folderLookup.rebuild(vaultIndex);
      const localOracle = new Oracle(folderLookup, vaultIndex);
      refGraph.rebuild(vaultIndex, localOracle);

      const result = handler.handle({
        textDocument: { uri: betaUri },
        position: { line: 0, character: 5 },
        newName: 'Section Two',
      });

      // Source doc gets the heading text edit
      expect(result.changes[betaUri]).toBeDefined();
      expect(result.changes[betaUri].some((e) => e.newText === 'Section Two')).toBe(true);

      // Referencing doc gets its wiki-link updated
      expect(result.changes[alphaUri]).toBeDefined();
      expect(result.changes[alphaUri].some((e) => e.newText.includes('Section Two'))).toBe(true);
    });

    it('preserves alias when alias differs from heading text (TASK-113)', () => {
      const heading: HeadingEntry = {
        level: 2,
        text: 'Section One',
        range: RANGE(0, 0, 0, 14),
      };
      // [[beta#Section One|my alias]] — alias != heading text → preserve alias
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta#Section One|my alias]]',
        target: 'beta',
        heading: 'Section One',
        alias: 'my alias',
        range: RANGE(0, 0, 0, 29),
      };

      const betaDoc = makeDoc(betaUri, { headings: [heading] });
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });

      parseCache.set(betaUri, betaDoc);
      parseCache.set(alphaUri, alphaDoc);
      vaultIndex.set(docId('beta'), betaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      const folderLookup = new FolderLookup();
      folderLookup.rebuild(vaultIndex);
      const localOracle = new Oracle(folderLookup, vaultIndex);
      refGraph.rebuild(vaultIndex, localOracle);

      const result = handler.handle({
        textDocument: { uri: betaUri },
        position: { line: 0, character: 5 },
        newName: 'Section Two',
      });

      // The edit in alpha should keep the alias "my alias"
      const alphaEdits = result.changes[alphaUri];
      expect(alphaEdits).toBeDefined();
      const editText = alphaEdits[0].newText;
      expect(editText).toContain('Section Two');
      expect(editText).toContain('my alias');
    });

    it('updates alias when alias matches old heading text (TASK-113)', () => {
      const heading: HeadingEntry = {
        level: 2,
        text: 'Section One',
        range: RANGE(0, 0, 0, 14),
      };
      // [[beta#Section One|Section One]] — alias == heading text → update alias
      const wikiLink: WikiLinkEntry = {
        raw: '[[beta#Section One|Section One]]',
        target: 'beta',
        heading: 'Section One',
        alias: 'Section One',
        range: RANGE(0, 0, 0, 32),
      };

      const betaDoc = makeDoc(betaUri, { headings: [heading] });
      const alphaDoc = makeDoc(alphaUri, { wikiLinks: [wikiLink] });

      parseCache.set(betaUri, betaDoc);
      parseCache.set(alphaUri, alphaDoc);
      vaultIndex.set(docId('beta'), betaDoc);
      vaultIndex.set(docId('alpha'), alphaDoc);

      const folderLookup = new FolderLookup();
      folderLookup.rebuild(vaultIndex);
      const localOracle = new Oracle(folderLookup, vaultIndex);
      refGraph.rebuild(vaultIndex, localOracle);

      const result = handler.handle({
        textDocument: { uri: betaUri },
        position: { line: 0, character: 5 },
        newName: 'Section Two',
      });

      const alphaEdits = result.changes[alphaUri];
      expect(alphaEdits).toBeDefined();
      const editText = alphaEdits[0].newText;
      expect(editText).toContain('Section Two');
      // alias was equal to heading text → should be updated to new name too
      expect(editText).not.toContain('Section One');
    });
  });
});
