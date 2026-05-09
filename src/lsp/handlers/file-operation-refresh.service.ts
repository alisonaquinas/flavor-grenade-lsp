import { Injectable } from '@nestjs/common';
import { VaultIndex } from '../../vault/vault-index.js';
import { FolderLookup } from '../../vault/folder-lookup.js';
import { TagRegistry } from '../../tags/tag-registry.js';
import { RefGraph } from '../../resolution/ref-graph.js';
import { Oracle } from '../../resolution/oracle.js';
import { EmbedResolver } from '../../resolution/embed-resolver.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';
import type { PlannedFileMove } from '../../vault/file-operation-planner.js';

/**
 * Refreshes in-memory vault state after the client applies file operations.
 */
@Injectable()
export class FileOperationRefreshService {
  constructor(
    private readonly vaultIndex: VaultIndex,
    private readonly folderLookup: FolderLookup,
    private readonly tagRegistry: TagRegistry,
    private readonly refGraph: RefGraph,
    private readonly oracle: Oracle,
    private readonly embedResolver: EmbedResolver,
    private readonly diagnosticService: DiagnosticService,
  ) {}

  refresh(vaultRoot: string, moves: readonly PlannedFileMove[]): void {
    for (const move of moves) {
      if (move.kind === 'document') {
        const doc = this.vaultIndex.get(move.oldDocId);
        if (doc === undefined) continue;

        this.vaultIndex.delete(move.oldDocId);
        this.vaultIndex.set(move.newDocId, { ...doc, uri: move.newUri });
      } else {
        const attachment = this.vaultIndex.getAttachment(move.oldPath);
        if (attachment === undefined) continue;

        this.vaultIndex.deleteAttachment(move.oldPath);
        this.vaultIndex.setAttachment({
          ...attachment,
          path: move.newPath,
          uri: move.newUri,
        });
      }
    }

    this.folderLookup.rebuild(this.vaultIndex);
    this.tagRegistry.rebuild(this.vaultIndex);
    this.refGraph.rebuild(this.vaultIndex, this.oracle, this.embedResolver);

    for (const [docId, doc] of this.vaultIndex.entries()) {
      this.diagnosticService.publishDiagnostics(docId, doc, vaultRoot);
    }
  }
}
