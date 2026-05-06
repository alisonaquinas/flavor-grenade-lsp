import { Injectable } from '@nestjs/common';
import type { DocumentLink } from 'vscode-languageserver-types';

interface DocumentLinkParams {
  textDocument?: { uri?: string };
}

/** Handles `textDocument/documentLink` requests. */
@Injectable()
export class DocumentLinkHandler {
  handle(_params: DocumentLinkParams): DocumentLink[] {
    return [];
  }
}
