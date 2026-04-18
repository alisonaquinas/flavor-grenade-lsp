/**
 * TASK-091: Unit tests for block ref resolution (CrossBlockRef, FG005,
 * definition, references, and completion).
 *
 * RED phase: all tests fail until the Phase 8 implementation is in place.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { RefGraph } from '../ref-graph.js';
import { Oracle } from '../oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { BlockRefCompletionProvider } from '../block-ref-completion-provider.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry, BlockAnchorEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';
import type { CrossBlockRef } from '../ref-graph.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function id(s: string): DocId {
  return s as DocId;
}

const ZERO_RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 10 },
};

const ANCHOR_RANGE = {
  start: { line: 4, character: 10 },
  end: { line: 4, character: 20 },
};

function makeAnchor(anchorId: string): BlockAnchorEntry {
  return { id: anchorId, range: ANCHOR_RANGE };
}

function makeAnchorAtLine(anchorId: string, line: number): BlockAnchorEntry {
  return {
    id: anchorId,
    range: {
      start: { line, character: 5 },
      end: { line, character: 5 + anchorId.length + 1 },
    },
  };
}

function makeDoc(
  uri: string,
  wikiLinks: WikiLinkEntry[] = [],
  blockAnchors: BlockAnchorEntry[] = [],
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: {
      wikiLinks,
      embeds: [],
      blockAnchors,
      tags: [],
      callouts: [],
      headings: [],
    },
  };
}

function makeBlockRefEntry(
  target: string,
  blockRef: string,
  range = ZERO_RANGE,
): WikiLinkEntry {
  return {
    raw: `[[${target}#^${blockRef}]]`,
    target,
    blockRef,
    range,
  };
}

function makeIntraBlockRefEntry(blockRef: string, range = ZERO_RANGE): WikiLinkEntry {
  return {
    raw: `[[#^${blockRef}]]`,
    target: '',
    blockRef,
    range,
  };
}

// ---------------------------------------------------------------------------
// RefGraph — CrossBlockRef indexing
// ---------------------------------------------------------------------------

describe('RefGraph — block refs', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
  });

  it('addBlockRef stores and getBlockRefsToAnchor retrieves it', () => {
    const anchor = makeAnchor('my-anchor');
    const entry = makeBlockRefEntry('target-doc', 'my-anchor');
    const ref: CrossBlockRef = {
      sourceDocId: id('source'),
      targetDocId: id('target-doc'),
      anchorId: 'my-anchor',
      entry,
      resolvedAnchor: anchor,
      diagnostic: null,
    };

    refGraph.addBlockRef(ref);

    const found = refGraph.getBlockRefsToAnchor(id('target-doc'), 'my-anchor');
    expect(found).toHaveLength(1);
    expect(found[0].anchorId).toBe('my-anchor');
    expect(found[0].sourceDocId).toBe('source');
  });

  it('getBrokenBlockRefs returns refs with diagnostic FG005', () => {
    const entry = makeBlockRefEntry('target-doc', 'missing-anchor');
    const brokenRef: CrossBlockRef = {
      sourceDocId: id('source'),
      targetDocId: id('target-doc'),
      anchorId: 'missing-anchor',
      entry,
      resolvedAnchor: null,
      diagnostic: 'FG005',
    };
    const goodRef: CrossBlockRef = {
      sourceDocId: id('source2'),
      targetDocId: id('target-doc'),
      anchorId: 'real-anchor',
      entry: makeBlockRefEntry('target-doc', 'real-anchor'),
      resolvedAnchor: makeAnchor('real-anchor'),
      diagnostic: null,
    };

    refGraph.addBlockRef(brokenRef);
    refGraph.addBlockRef(goodRef);

    const broken = refGraph.getBrokenBlockRefs();
    expect(broken).toHaveLength(1);
    expect(broken[0].anchorId).toBe('missing-anchor');
    expect(broken[0].diagnostic).toBe('FG005');
  });

  it('rebuild populates block refs from wiki-links with blockRef set', () => {
    const anchor = makeAnchor('para1');
    const entry = makeBlockRefEntry('target', 'para1');
    vaultIndex.set(id('target'), makeDoc('file:///v/target.md', [], [anchor]));
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const blockRefs = refGraph.getBlockRefsToAnchor(id('target'), 'para1');
    expect(blockRefs).toHaveLength(1);
    expect(blockRefs[0].resolvedAnchor).not.toBeNull();
    expect(blockRefs[0].diagnostic).toBeNull();
  });

  it('rebuild sets FG005 when anchor not found in target', () => {
    vaultIndex.set(id('target'), makeDoc('file:///v/target.md', [], []));
    const entry = makeBlockRefEntry('target', 'ghost');
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const broken = refGraph.getBrokenBlockRefs();
    expect(broken).toHaveLength(1);
    expect(broken[0].anchorId).toBe('ghost');
    expect(broken[0].diagnostic).toBe('FG005');
  });

  it('rebuild marks FG001 (via oracle) when target doc does not exist', () => {
    const entry = makeBlockRefEntry('nonexistent-doc', 'some-anchor');
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    // target doc does not exist → oracle returns broken → no CrossBlockRef added
    // (the wiki-link resolves as FG001 via normal wiki-link path)
    const blockRefs = refGraph.getBlockRefsToAnchor(id('nonexistent-doc'), 'some-anchor');
    expect(blockRefs).toHaveLength(0);
  });

  it('rebuild handles intra-document block ref (target = empty string)', () => {
    const anchor = makeAnchor('local-anchor');
    const entry = makeIntraBlockRefEntry('local-anchor');
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry], [anchor]));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const intraRefs = refGraph.getBlockRefsToAnchor(id('source'), 'local-anchor');
    expect(intraRefs).toHaveLength(1);
    expect(intraRefs[0].targetDocId).toBeNull();
    expect(intraRefs[0].resolvedAnchor).not.toBeNull();
    expect(intraRefs[0].diagnostic).toBeNull();
  });

  it('rebuild sets FG005 for intra-document block ref when anchor not found', () => {
    const entry = makeIntraBlockRefEntry('no-such-anchor');
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry], []));
    folderLookup.rebuild(vaultIndex);

    refGraph.rebuild(vaultIndex, oracle);

    const broken = refGraph.getBrokenBlockRefs();
    expect(broken).toHaveLength(1);
    expect(broken[0].anchorId).toBe('no-such-anchor');
    expect(broken[0].targetDocId).toBeNull();
  });

  it('getBlockRefsToAnchor returns empty for unknown docId/anchorId', () => {
    expect(refGraph.getBlockRefsToAnchor(id('nonexistent'), 'nope')).toHaveLength(0);
  });

  it('rebuild clears previous block refs', () => {
    const anchor = makeAnchor('para1');
    const entry = makeBlockRefEntry('target', 'para1');
    vaultIndex.set(id('target'), makeDoc('file:///v/target.md', [], [anchor]));
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    // Remove source and rebuild
    vaultIndex.delete(id('source'));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    expect(refGraph.getBlockRefsToAnchor(id('target'), 'para1')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CrossBlockRef anchor position (anchor at end-of-file, on list item)
// ---------------------------------------------------------------------------

describe('CrossBlockRef — anchor location edge cases', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
  });

  it('resolves anchor at the last line (end of file)', () => {
    const anchor = makeAnchorAtLine('eof-anchor', 99);
    const entry = makeBlockRefEntry('target', 'eof-anchor');
    vaultIndex.set(id('target'), makeDoc('file:///v/target.md', [], [anchor]));
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    const refs = refGraph.getBlockRefsToAnchor(id('target'), 'eof-anchor');
    expect(refs).toHaveLength(1);
    expect(refs[0].resolvedAnchor?.range.start.line).toBe(99);
  });

  it('resolves anchor on a list item (any line)', () => {
    const anchor = makeAnchorAtLine('list-item-anchor', 3);
    const entry = makeBlockRefEntry('target', 'list-item-anchor');
    vaultIndex.set(id('target'), makeDoc('file:///v/target.md', [], [anchor]));
    vaultIndex.set(id('source'), makeDoc('file:///v/source.md', [entry]));
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    const refs = refGraph.getBlockRefsToAnchor(id('target'), 'list-item-anchor');
    expect(refs).toHaveLength(1);
    expect(refs[0].resolvedAnchor?.id).toBe('list-item-anchor');
  });
});

// ---------------------------------------------------------------------------
// [[#^id]] intra-doc syntax via WikiLinkParser
// ---------------------------------------------------------------------------

describe('WikiLinkParser — intra-doc [[#^id]] syntax', () => {
  it('is tested in src/parser/__tests__/wiki-link-parser.test.ts', () => {
    // Cross-reference: see the dedicated wiki-link-parser test file for
    // the intra-doc block ref parsing edge-case tests (TASK-090).
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BlockRefCompletionProvider
// ---------------------------------------------------------------------------

describe('BlockRefCompletionProvider', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let parseCache: ParseCache;
  let provider: BlockRefCompletionProvider;

  function makeDocWithAnchors(uri: string, anchors: BlockAnchorEntry[]): OFMDoc {
    return makeDoc(uri, [], anchors);
  }

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    parseCache = new ParseCache();
    provider = new BlockRefCompletionProvider(oracle, vaultIndex, parseCache);
  });

  it('returns anchor completions for a resolved cross-doc trigger', () => {
    const doc = makeDocWithAnchors('file:///v/target.md', [
      makeAnchor('section-one'),
      makeAnchor('section-two'),
    ]);
    vaultIndex.set(id('target'), doc);
    folderLookup.rebuild(vaultIndex);

    const result = provider.getCompletions('', 'target');
    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.label)).toContain('section-one');
    expect(result.items.map((i) => i.label)).toContain('section-two');
    expect(result.isIncomplete).toBe(false);
  });

  it('returns anchor completions for intra-doc trigger (no triggerDoc)', () => {
    const doc = makeDocWithAnchors('file:///v/current.md', [
      makeAnchor('local-one'),
    ]);
    parseCache.set('file:///v/current.md', doc);

    const result = provider.getCompletions('', undefined, 'file:///v/current.md');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].label).toBe('local-one');
    expect(result.items[0].kind).toBe(18); // CompletionItemKind.Reference
  });

  it('filters completions by partial prefix (case-insensitive)', () => {
    const doc = makeDocWithAnchors('file:///v/target.md', [
      makeAnchor('alpha-block'),
      makeAnchor('beta-block'),
    ]);
    vaultIndex.set(id('target'), doc);
    folderLookup.rebuild(vaultIndex);

    const result = provider.getCompletions('alpha', 'target');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].label).toBe('alpha-block');
  });

  it('returns empty items when triggerDoc does not resolve', () => {
    folderLookup.rebuild(vaultIndex);

    const result = provider.getCompletions('', 'no-such-doc');
    expect(result.items).toHaveLength(0);
    expect(result.isIncomplete).toBe(false);
  });

  it('returns empty when no current doc for intra-doc completion', () => {
    const result = provider.getCompletions('', undefined, undefined);
    expect(result.items).toHaveLength(0);
  });

  it('completion items use CompletionItemKind.Reference (18) for cross-doc', () => {
    const doc = makeDocWithAnchors('file:///v/target.md', [makeAnchor('my-block')]);
    vaultIndex.set(id('target'), doc);
    folderLookup.rebuild(vaultIndex);

    const result = provider.getCompletions('', 'target');
    expect(result.items[0].kind).toBe(18);
  });
});
