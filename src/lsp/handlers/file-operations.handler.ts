import { Injectable } from '@nestjs/common';

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
  async handleWillRenameFiles(_params: unknown): Promise<null> {
    return null;
  }

  async handleDidRenameFiles(_params: unknown): Promise<void> {}
}
