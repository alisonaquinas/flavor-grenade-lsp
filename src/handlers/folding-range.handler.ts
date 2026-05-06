import { Injectable } from '@nestjs/common';
import type { FoldingRange } from 'vscode-languageserver-types';

interface FoldingRangeParams {
  textDocument?: { uri?: string };
}

/** Handles `textDocument/foldingRange` requests. */
@Injectable()
export class FoldingRangeHandler {
  handle(_params: FoldingRangeParams): FoldingRange[] {
    return [];
  }
}
