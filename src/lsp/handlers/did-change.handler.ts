import { Injectable } from '@nestjs/common';
import { TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument';
import { DocumentStore } from '../services/document-store.js';

/** Parameters sent with a `textDocument/didChange` notification. */
interface DidChangeTextDocumentParams {
  textDocument: { uri: string; version: number };
  contentChanges: TextDocumentContentChangeEvent[];
}

/**
 * Handles the `textDocument/didChange` LSP notification.
 *
 * Applies content changes to the open document in the {@link DocumentStore}.
 */
@Injectable()
export class DidChangeHandler {
  constructor(private readonly store: DocumentStore) {}

  /**
   * Handle a `textDocument/didChange` notification.
   *
   * @param params - The didChange notification parameters.
   */
  async handle(params: unknown): Promise<void> {
    const { textDocument, contentChanges } = params as DidChangeTextDocumentParams;
    this.store.update(textDocument.uri, contentChanges, textDocument.version);
  }
}
