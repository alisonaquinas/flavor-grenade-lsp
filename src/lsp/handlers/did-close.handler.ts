import { Injectable } from '@nestjs/common';
import { DocumentStore } from '../services/document-store.js';
import { ParseCache } from '../../parser/parser.module.js';

/** Parameters sent with a `textDocument/didClose` notification. */
interface DidCloseTextDocumentParams {
  textDocument: { uri: string };
}

/**
 * Handles the `textDocument/didClose` LSP notification.
 *
 * Removes the document from the {@link DocumentStore} and clears the
 * corresponding entry from {@link ParseCache}.
 */
@Injectable()
export class DidCloseHandler {
  constructor(
    private readonly store: DocumentStore,
    private readonly parseCache: ParseCache,
  ) {}

  /**
   * Handle a `textDocument/didClose` notification.
   *
   * @param params - The didClose notification parameters.
   */
  async handle(params: unknown): Promise<void> {
    const { textDocument } = params as DidCloseTextDocumentParams;
    this.store.close(textDocument.uri);
    this.parseCache.delete(textDocument.uri);
  }
}
