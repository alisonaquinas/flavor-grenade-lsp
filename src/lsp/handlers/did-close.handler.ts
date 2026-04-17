import { Injectable } from '@nestjs/common';
import { DocumentStore } from '../services/document-store.js';

/** Parameters sent with a `textDocument/didClose` notification. */
interface DidCloseTextDocumentParams {
  textDocument: { uri: string };
}

/**
 * Handles the `textDocument/didClose` LSP notification.
 *
 * Removes the document from the {@link DocumentStore} to free memory.
 *
 * // Phase 3: clear ParseCache entry for uri
 */
@Injectable()
export class DidCloseHandler {
  constructor(private readonly store: DocumentStore) {}

  /**
   * Handle a `textDocument/didClose` notification.
   *
   * @param params - The didClose notification parameters.
   */
  async handle(params: unknown): Promise<void> {
    const { textDocument } = params as DidCloseTextDocumentParams;
    this.store.close(textDocument.uri);
  }
}
