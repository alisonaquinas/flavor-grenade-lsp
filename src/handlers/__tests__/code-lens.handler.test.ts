import { describe, it, expect, beforeEach } from '@jest/globals';
import { CodeLensHandler } from '../code-lens.handler.js';
import { ParseCache } from '../../parser/parser.module.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import type { OFMDoc, HeadingEntry } from '../../parser/types.js';
import type { DocId } from '../../vault/doc-id.js';

function id(s: string): DocId {
  return s as DocId;
}

function makeHeading(text: string, level = 1, line = 0): HeadingEntry {
  return {
    level,
    text,
    range: {
      start: { line, character: 0 },
      end: { line, character: text.length + level + 1 },
    },
  };
}

function makeDoc(
  uri: string,
  headings: HeadingEntry[] = [],
  wikiLinks: OFMDoc['index']['wikiLinks'] = [],
): OFMDoc {
  return {
    uri,
    version: 0,
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: { wikiLinks, embeds: [], blockAnchors: [], tags: [], callouts: [], headings },
  };
}

describe('CodeLensHandler', () => {
  let parseCache: ParseCache;
  let refGraph: RefGraph;
  let handler: CodeLensHandler;

  beforeEach(() => {
    const vaultIndex = new VaultIndex();
    const folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
    parseCache = new ParseCache();
    handler = new CodeLensHandler(parseCache, refGraph);

    // Set up a simple vault: beta.md with a heading, alpha.md linking to beta
    const betaDoc = makeDoc('file:///vault/beta.md', [
      makeHeading('Introduction', 2, 0),
      makeHeading('Summary', 2, 5),
    ]);
    const alphaDoc = makeDoc('file:///vault/alpha.md', [], [
      {
        raw: '[[beta]]',
        target: 'beta',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 8 } },
      },
    ]);

    vaultIndex.set(id('beta'), betaDoc);
    vaultIndex.set(id('alpha'), alphaDoc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    parseCache.set('file:///vault/beta.md', betaDoc);
    parseCache.set('file:///vault/alpha.md', alphaDoc);
  });

  it('returns empty array when document is not in cache', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/unknown.md' } });
    expect(result).toEqual([]);
  });

  it('returns one CodeLens per heading', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/beta.md' } });
    expect(result).toHaveLength(2);
  });

  it('each CodeLens has the heading range', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/beta.md' } });
    // makeHeading: end.character = text.length + level + 1
    // 'Introduction': 12 + 2 + 1 = 15
    expect(result[0].range).toEqual({
      start: { line: 0, character: 0 },
      end: { line: 0, character: 15 },
    });
    // 'Summary': 7 + 2 + 1 = 10
    expect(result[1].range).toEqual({
      start: { line: 5, character: 0 },
      end: { line: 5, character: 10 },
    });
  });

  it('each CodeLens command title contains the reference count', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/beta.md' } });
    // headings have 0 refs (beta doc is referenced by alpha, but heading-specific refs need defKey)
    for (const lens of result) {
      expect(lens.command).toBeDefined();
      expect(lens.command!.title).toMatch(/\d+ reference/);
    }
  });

  it('returns empty array for doc with no headings', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/alpha.md' } });
    expect(result).toEqual([]);
  });

  it('CodeLens command is editor.action.findReferences', () => {
    const result = handler.handle({ textDocument: { uri: 'file:///vault/beta.md' } });
    for (const lens of result) {
      expect(lens.command!.command).toBe('editor.action.findReferences');
    }
  });
});
