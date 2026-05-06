import { describe, expect, it } from '@jest/globals';
import { pathToFileURL } from 'url';
import * as path from 'path';
import { OFMParser } from '../../parser/ofm-parser.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { VaultIndex } from '../../vault/vault-index.js';
import { Oracle } from '../oracle.js';
import { RefGraph } from '../ref-graph.js';
import { FileOperationPlanner } from '../../vault/file-operation-planner.js';
import { FileOperationRewriter } from '../file-operation-rewriter.js';
import { WorkspaceEditValidator } from '../workspace-edit-validator.js';
import type { DocId } from '../../vault/doc-id.js';

function id(value: string): DocId {
  return value as DocId;
}

function uriFor(vaultRoot: string, relPath: string): string {
  return pathToFileURL(path.join(vaultRoot, relPath)).toString();
}

describe('file operation regression flow', () => {
  it('rewrites nested Markdown image refs that use vault-relative attachment paths', () => {
    const vaultRoot = path.resolve('C:/vault');
    const parser = new OFMParser();
    const vaultIndex = new VaultIndex();
    const folderLookup = new FolderLookup();
    const oracle = new Oracle(folderLookup, vaultIndex);
    const refGraph = new RefGraph();
    const sourceUri = uriFor(vaultRoot, 'notes/source.md');
    vaultIndex.set(
      id('notes/source'),
      parser.parse(sourceUri, '![Diagram](assets/diagram.png)', 1),
    );
    vaultIndex.setAttachment({
      path: 'assets/diagram.png',
      uri: uriFor(vaultRoot, 'assets/diagram.png'),
      extension: 'png',
      kind: 'image',
      sizeBytes: 1,
    });
    folderLookup.rebuild(vaultIndex);
    refGraph.rebuild(vaultIndex, oracle);

    const plan = new FileOperationPlanner(vaultIndex).planRenameFiles(vaultRoot, {
      files: [
        {
          oldUri: uriFor(vaultRoot, 'assets/diagram.png'),
          newUri: uriFor(vaultRoot, 'media/diagram.png'),
        },
      ],
    });
    expect(plan.status).toBe('ok');

    const rewrite = new FileOperationRewriter(vaultIndex, refGraph).rewrite(
      plan.status === 'ok' ? plan.moves : [],
    );
    const validated = new WorkspaceEditValidator().validate(rewrite);

    expect(validated.status).toBe('ok');
    expect(
      validated.status === 'ok' ? validated.edit.changes[sourceUri]?.[0]?.newText : undefined,
    ).toBe('media/diagram.png');
  });
});
