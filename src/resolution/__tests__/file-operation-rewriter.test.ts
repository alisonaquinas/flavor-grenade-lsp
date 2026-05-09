import { describe, expect, it } from '@jest/globals';
import { FileOperationRewriter } from '../file-operation-rewriter.js';
import { EmbedResolver } from '../embed-resolver.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { Oracle } from '../oracle.js';
import { RefGraph } from '../ref-graph.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import type { VaultScanner } from '../../vault/vault-scanner.js';
import type { PlannedFileMove } from '../../vault/file-operation-planner.js';
import type { DocId } from '../../vault/doc-id.js';

function id(value: string): DocId {
  return value as DocId;
}

describe('FileOperationRewriter', () => {
  it('rewrites moved-target refs while preserving link syntax details', () => {
    const parser = new OFMParser();
    const vaultIndex = new VaultIndex();
    const folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    const refGraph = new RefGraph();

    const sourceText = [
      '[[notes/alpha#Overview|Alpha]]',
      '![[notes/alpha#Overview|Alpha Embed]]',
      '[Alpha](notes/alpha.md#overview "Title")',
      '[alpha-ref]: notes/alpha.md#overview "Title"',
      '![Diagram](assets/diagram.png "Diagram")',
      '![[assets/diagram.png|300x200]]',
    ].join('\n');
    const sourceUri = 'file:///vault/source.md';
    const sourceDoc = parser.parse(sourceUri, sourceText, 1);
    const alphaDoc = parser.parse('file:///vault/notes/alpha.md', '# Overview', 1);
    vaultIndex.set(id('source'), sourceDoc);
    vaultIndex.set(id('notes/alpha'), alphaDoc);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///vault/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 1,
    });
    folderLookup.rebuild(vaultIndex);
    const vaultScanner = {
      hasAsset: (assetPath: string) => assetPath === 'assets/diagram.png',
      getAssetIndex: () => new Set(['assets/diagram.png']),
    } as unknown as VaultScanner;
    refGraph.rebuild(vaultIndex, oracle, new EmbedResolver(oracle, vaultScanner));

    const moves: PlannedFileMove[] = [
      {
        kind: 'document',
        oldUri: 'file:///vault/notes/alpha.md',
        newUri: 'file:///vault/archive/alpha.md',
        oldPath: 'notes/alpha.md',
        newPath: 'archive/alpha.md',
        oldDocId: id('notes/alpha'),
        newDocId: id('archive/alpha'),
      },
      {
        kind: 'attachment',
        oldUri: 'file:///vault/assets/diagram.png',
        newUri: 'file:///vault/media/diagram.png',
        oldPath: 'assets/diagram.png',
        newPath: 'media/diagram.png',
      },
    ];

    const result = new FileOperationRewriter(vaultIndex, refGraph).rewrite(moves);

    expect(result.skipped).toEqual([]);
    expect(result.edits.map((edit) => edit.newText)).toEqual([
      '[[archive/alpha#Overview|Alpha]]',
      '![[archive/alpha#Overview|Alpha Embed]]',
      'archive/alpha.md#overview',
      'archive/alpha.md#overview',
      'media/diagram.png',
      '![[media/diagram.png|300x200]]',
    ]);
    expect(result.edits.every((edit) => edit.uri === sourceUri)).toBe(true);
  });
});
