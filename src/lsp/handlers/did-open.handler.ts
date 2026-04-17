import { Injectable } from '@nestjs/common';
import { DocumentStore } from '../services/document-store.js';

/** Parameters sent with a `textDocument/didOpen` notification. */
interface DidOpenTextDocumentParams {
  textDocument: {
    uri: string;
    languageId: string;
    version: number;
    text: string;
  };
}

/**
 * Handles the `textDocument/didOpen` LSP notification.
 *
 * Registers the newly opened document in the {@link DocumentStore} so it
 * is available for subsequent document operations.
 *
 * // Phase 3: trigger OFMParser
 */
@Injectable()
export class DidOpenHandler {
  constructor(private readonly store: DocumentStore) {}

  /**
   * Handle a `textDocument/didOpen` notification.
   *
   * @param params - The didOpen notification parameters.
   */
  async handle(params: unknown): Promise<void> {
    const { textDocument } = params as DidOpenTextDocumentParams;
    this.store.open(
      textDocument.uri,
      textDocument.languageId,
      textDocument.version,
      textDocument.text,
    );
  }
}
