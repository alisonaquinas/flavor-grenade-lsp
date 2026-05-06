import { Injectable } from '@nestjs/common';
import type { SelectionRange } from 'vscode-languageserver-types';

interface SelectionRangeParams {
  textDocument?: { uri?: string };
}

/** Handles `textDocument/selectionRange` requests. */
@Injectable()
export class SelectionRangeHandler {
  handle(_params: SelectionRangeParams): SelectionRange[] {
    return [];
  }
}
