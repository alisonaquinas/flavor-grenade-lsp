import { describe, it, expect, beforeEach } from '@jest/globals';
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
