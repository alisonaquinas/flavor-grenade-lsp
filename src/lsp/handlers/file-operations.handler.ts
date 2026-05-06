import { Injectable } from '@nestjs/common';
import { fileURLToPath } from 'url';
import { LifecycleState } from '../services/lifecycle-state.js';
import { FileOperationPlanner } from '../../vault/file-operation-planner.js';
import { FileOperationRewriter } from '../../resolution/file-operation-rewriter.js';
import { WorkspaceEditValidator } from '../../resolution/workspace-edit-validator.js';
import { FileOperationRefreshService } from './file-operation-refresh.service.js';
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
    private readonly refreshService: FileOperationRefreshService,
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

  async handleDidRenameFiles(params: unknown): Promise<void> {
    const vaultRoot = this.vaultRoot();
    if (vaultRoot === null) {
      return;
    }

    const plan = this.planner.planRenameFiles(vaultRoot, params);
    if (plan.status === 'rejected') {
      return;
    }

    this.refreshService.refresh(vaultRoot, plan.moves);
  }

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
