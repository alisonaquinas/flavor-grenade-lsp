import { describe, it, expect, beforeEach } from '@jest/globals';
import { ReferencesHandler } from '../references.handler.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { ParseCache } from '../../parser/parser.module.js';
import type { OFMDoc, WikiLinkEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

const ZERO_RANGE = {
  start: { line: 0, character: 0 },
  end: { line: 0, character: 10 },
};

function makeWikiLink(target: string): WikiLinkEntry {
  return { raw: `[[${target}]]`, target, range: ZERO_RANGE };
}

function makeDoc(uri: string, wikiLinks: WikiLinkEntry[] = []): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: { wikiLinks, embeds: [], blockAnchors: [], tags: [], callouts: [], headings: [] },
  };
}

describe('ReferencesHandler', () => {
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;
  let parseCache: ParseCache;
  let handler: ReferencesHandler;

  beforeEach(() => {
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
    parseCache = new ParseCache();
    handler = new ReferencesHandler(refGraph, parseCache, vaultIndex);
  });

  it('returns empty array when document is not in cache', () => {
    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });
    expect(result).toEqual([]);
  });

  it('returns locations for all refs pointing to the target doc', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    const alphaDoc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta')]);

    vaultIndex.set(id('beta'), betaDoc);
    vaultIndex.set(id('alpha'), alphaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(1);
    expect(result[0].uri).toBe('file:///vault/alpha.md');
  });

  it('includeDeclaration=true prepends the document itself', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    const alphaDoc = makeDoc('file:///vault/alpha.md', [makeWikiLink('beta')]);

    vaultIndex.set(id('beta'), betaDoc);
    vaultIndex.set(id('alpha'), alphaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: true },
    });

    expect(result).toHaveLength(2);
    expect(result[0].uri).toBe('file:///vault/beta.md');
    expect(result[1].uri).toBe('file:///vault/alpha.md');
  });

  it('returns empty when no refs point to target', () => {
    const betaDoc = makeDoc('file:///vault/beta.md');
    vaultIndex.set(id('beta'), betaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);

    const result = handler.handle({
      textDocument: { uri: 'file:///vault/beta.md' },
      position: { line: 0, character: 0 },
      context: { includeDeclaration: false },
    });

    expect(result).toHaveLength(0);
  });
});
