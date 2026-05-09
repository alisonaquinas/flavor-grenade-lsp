import { describe, expect, it, jest } from '@jest/globals';
import { FileOperationRefreshService } from '../file-operation-refresh.service.js';
import { VaultIndex } from '../../../vault/vault-index.js';
import { FolderLookup } from '../../../vault/folder-lookup.js';
import { TagRegistry } from '../../../tags/tag-registry.js';
import type { RefGraph } from '../../../resolution/ref-graph.js';
import type { Oracle } from '../../../resolution/oracle.js';
import type { EmbedResolver } from '../../../resolution/embed-resolver.js';
import type { DiagnosticService } from '../../../resolution/diagnostic-service.js';
import type { PlannedFileMove } from '../../../vault/file-operation-planner.js';
import type { DocId } from '../../../vault/doc-id.js';
import type { OFMDoc } from '../../../parser/types.js';

function id(value: string): DocId {
  return value as DocId;
}

function doc(uri: string): OFMDoc {
  return {
    uri,
    version: 1,
    text: '# Doc',
    frontmatter: null,
    frontmatterEndOffset: 0,
    opaqueRegions: [],
    index: {
      wikiLinks: [],
      embeds: [],
      blockAnchors: [],
      tags: [],
      callouts: [],
      headings: [],
      markdownLinks: [],
      markdownImages: [],
      linkLabelRefs: [],
      linkLabelDefs: [],
    },
  };
}

describe('FileOperationRefreshService', () => {
  it('remaps moved documents and attachments, then refreshes graph and diagnostics', () => {
    const vaultIndex = new VaultIndex();
    const oldDoc = doc('file:///vault/notes/alpha.md');
    vaultIndex.set(id('notes/alpha'), oldDoc);
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: 'file:///vault/assets/diagram.png',
      extension: 'png',
      kind: 'image',
      sizeBytes: 1,
    });
    const refGraph = { rebuild: jest.fn() } as unknown as RefGraph;
    const oracle = {} as Oracle;
    const embedResolver = {} as EmbedResolver;
    const diagnosticService = { publishDiagnostics: jest.fn() } as unknown as DiagnosticService;

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

    new FileOperationRefreshService(
      vaultIndex,
      new FolderLookup(),
      new TagRegistry(),
      refGraph,
      oracle,
      embedResolver,
      diagnosticService,
    ).refresh('/vault', moves);

    expect(vaultIndex.has(id('notes/alpha'))).toBe(false);
    expect(vaultIndex.get(id('archive/alpha'))?.uri).toBe('file:///vault/archive/alpha.md');
    expect(vaultIndex.hasAttachment('assets/diagram.png')).toBe(false);
    expect(vaultIndex.getAttachment('media/diagram.png')?.uri).toBe(
      'file:///vault/media/diagram.png',
    );
    expect(refGraph.rebuild).toHaveBeenCalledWith(vaultIndex, oracle, embedResolver);
    expect(diagnosticService.publishDiagnostics).toHaveBeenCalledWith(
      id('archive/alpha'),
      expect.objectContaining({ uri: 'file:///vault/archive/alpha.md' }),
      '/vault',
    );
  });
});
