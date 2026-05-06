import { describe, expect, it, jest } from '@jest/globals';
import { FileOperationsHandler } from '../file-operations.handler.js';
import { LifecycleState } from '../../services/lifecycle-state.js';
import { pathToFileURL } from 'url';
import * as path from 'path';
import type { FileOperationPlanner } from '../../../vault/file-operation-planner.js';
import type { FileOperationRewriter } from '../../../resolution/file-operation-rewriter.js';
import type { WorkspaceEditValidator } from '../../../resolution/workspace-edit-validator.js';
import type { FileOperationRefreshService } from '../file-operation-refresh.service.js';
import type { Range } from 'vscode-languageserver-types';

describe('FileOperationsHandler', () => {
  it('returns a validated WorkspaceEdit from the willRenameFiles pipeline', async () => {
    const lifecycle = new LifecycleState();
    const vaultRoot = path.resolve('test-vault');
    lifecycle.rootUri = pathToFileURL(vaultRoot).toString();
    const planner = {
      planRenameFiles: jest.fn().mockReturnValue({ status: 'ok', moves: [{ kind: 'document' }] }),
    } as unknown as FileOperationPlanner;
    const rewriter = {
      rewrite: jest.fn().mockReturnValue({
        edits: [{ uri: 'file:///vault/source.md', range: range(0, 0, 0, 1), newText: 'x' }],
        skipped: [],
      }),
    } as unknown as FileOperationRewriter;
    const validator = {
      validate: jest.fn().mockReturnValue({
        status: 'ok',
        edit: {
          changes: {
            'file:///vault/source.md': [{ range: range(0, 0, 0, 1), newText: 'x' }],
          },
        },
        skipped: [],
      }),
    } as unknown as WorkspaceEditValidator;

    const result = await new FileOperationsHandler(
      lifecycle,
      planner,
      rewriter,
      validator,
      {} as FileOperationRefreshService,
    ).handleWillRenameFiles({
      files: [{ oldUri: 'file:///vault/old.md', newUri: 'file:///vault/new.md' }],
    });

    expect(planner.planRenameFiles).toHaveBeenCalledWith(vaultRoot, {
      files: [{ oldUri: 'file:///vault/old.md', newUri: 'file:///vault/new.md' }],
    });
    expect(rewriter.rewrite).toHaveBeenCalledWith([{ kind: 'document' }]);
    expect(result).toEqual({
      changes: {
        'file:///vault/source.md': [{ range: range(0, 0, 0, 1), newText: 'x' }],
      },
    });
  });

  it('returns null when planning rejects the file operation', async () => {
    const lifecycle = new LifecycleState();
    lifecycle.rootUri = pathToFileURL(path.resolve('test-vault')).toString();
    const planner = {
      planRenameFiles: jest.fn().mockReturnValue({
        status: 'rejected',
        reason: 'Path escapes vault root',
      }),
    } as unknown as FileOperationPlanner;

    const result = await new FileOperationsHandler(
      lifecycle,
      planner,
      {} as FileOperationRewriter,
      {} as WorkspaceEditValidator,
      {} as FileOperationRefreshService,
    ).handleWillRenameFiles({});

    expect(result).toBeNull();
  });

  it('refreshes planned moves after didRenameFiles', async () => {
    const lifecycle = new LifecycleState();
    const vaultRoot = path.resolve('test-vault');
    lifecycle.rootUri = pathToFileURL(vaultRoot).toString();
    const moves = [{ kind: 'document' }];
    const planner = {
      planRenameFiles: jest.fn().mockReturnValue({ status: 'ok', moves }),
    } as unknown as FileOperationPlanner;
    const refresh = {
      refresh: jest.fn(),
    } as unknown as FileOperationRefreshService;

    await new FileOperationsHandler(
      lifecycle,
      planner,
      {} as FileOperationRewriter,
      {} as WorkspaceEditValidator,
      refresh,
    ).handleDidRenameFiles({
      files: [{ oldUri: 'file:///vault/old.md', newUri: 'file:///vault/new.md' }],
    });

    expect(refresh.refresh).toHaveBeenCalledWith(vaultRoot, moves);
  });
});

function range(sl: number, sc: number, el: number, ec: number): Range {
  return {
    start: { line: sl, character: sc },
    end: { line: el, character: ec },
  };
}
