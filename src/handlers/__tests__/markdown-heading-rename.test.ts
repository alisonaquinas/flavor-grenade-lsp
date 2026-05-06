import { describe, it, expect, beforeEach } from '@jest/globals';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import type { DocId } from '../../vault/doc-id.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { Oracle } from '../../resolution/oracle.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { RenameHandler } from '../rename.handler.js';

function id(value: string): DocId {
  return value as DocId;
}

function makeVaultDetector(): VaultDetector {
  return {
    detect: (_path: string) => ({ mode: 'obsidian', vaultRoot: '/vault' }),
  } as unknown as VaultDetector;
}

describe('Markdown heading rename', () => {
  let parser: OFMParser;
  let parseCache: ParseCache;
  let vaultIndex: VaultIndex;
  let folderLookup: FolderLookup;
  let oracle: Oracle;
  let refGraph: RefGraph;
  let handler: RenameHandler;

  beforeEach(() => {
    parser = new OFMParser();
    parseCache = new ParseCache();
    vaultIndex = new VaultIndex();
    folderLookup = new FolderLookup();
    oracle = new Oracle(folderLookup, vaultIndex);
    refGraph = new RefGraph();
    handler = new RenameHandler(parseCache, refGraph, vaultIndex, makeVaultDetector());
  });

  it('updates same-document Markdown heading anchors during heading rename', () => {
    const doc = parser.parse(
      'file:///vault/notes/source.md',
      '# Links\n\n[Keep text](#Links "Title")',
      1,
    );
    vaultIndex.set(id('notes/source'), doc);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);
    parseCache.set(doc.uri, doc);

    const result = handler.handle({
      textDocument: { uri: doc.uri },
      position: { line: 0, character: 2 },
      newName: 'Link Index',
    });

    expect(result.changes[doc.uri].map((edit) => edit.newText)).toContain('Link Index');
    expect(result.changes[doc.uri].map((edit) => edit.newText)).toContain('#Link-Index');
  });

  it('updates file-plus-heading Markdown anchors while preserving link text', () => {
    const target = parser.parse('file:///vault/notes/alpha.md', '# Overview\n\nBody', 1);
    const source = parser.parse(
      'file:///vault/notes/source.md',
      '[Overview label](alpha.md#overview "Title")',
      1,
    );
    vaultIndex.set(id('notes/alpha'), target);
    vaultIndex.set(id('notes/source'), source);
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);
    parseCache.set(target.uri, target);

    const result = handler.handle({
      textDocument: { uri: target.uri },
      position: { line: 0, character: 2 },
      newName: 'Project Overview',
    });

    const sourceEdits = result.changes[source.uri];
    expect(sourceEdits.map((edit) => edit.newText)).toContain('alpha.md#Project-Overview');
    expect(source.text).toContain('[Overview label]');
    expect(source.text).toContain('"Title"');
  });
});
