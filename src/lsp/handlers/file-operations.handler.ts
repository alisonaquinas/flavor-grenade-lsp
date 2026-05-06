import { Injectable } from '@nestjs/common';
import { fileURLToPath } from 'url';
import { LifecycleState } from '../services/lifecycle-state.js';
import { FileOperationPlanner } from '../../vault/file-operation-planner.js';
import { FileOperationRewriter } from '../../resolution/file-operation-rewriter.js';
import { WorkspaceEditValidator } from '../../resolution/workspace-edit-validator.js';
import type { WorkspaceEdit } from '../../handlers/workspace-edit-builder.js';

export interface FileRename {
  oldUri: string;
  newUri: string;
}

export interface RenameFilesParams {
  files: FileRename[];
}

/**
 * Entry point for LSP workspace file-operation notifications and requests.
 *
 * `willRenameFiles` is pre-apply planning only; it must not mutate the vault
 * index. Post-apply refresh is handled by `didRenameFiles`.
 */
@Injectable()
export class FileOperationsHandler {
  constructor(
    private readonly lifecycle: LifecycleState,
    private readonly planner: FileOperationPlanner,
    private readonly rewriter: FileOperationRewriter,
    private readonly validator: WorkspaceEditValidator,
  ) {}

  async handleWillRenameFiles(params: unknown): Promise<WorkspaceEdit | null> {
    const vaultRoot = this.vaultRoot();
    if (vaultRoot === null) {
      return null;
    }

    const plan = this.planner.planRenameFiles(vaultRoot, params);
    if (plan.status === 'rejected') {
      return null;
    }

    const validated = this.validator.validate(this.rewriter.rewrite(plan.moves));
    if (validated.status === 'rejected') {
      return null;
    }

    return Object.keys(validated.edit.changes).length > 0 ? validated.edit : null;
  }

  async handleDidRenameFiles(_params: unknown): Promise<void> {}

  private vaultRoot(): string | null {
    if (this.lifecycle.rootUri === null) {
      return null;
    }

    try {
      return fileURLToPath(this.lifecycle.rootUri);
    } catch {
      return null;
    }
  }
}
