import { Injectable } from '@nestjs/common';
import { TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';

/** Parameters sent with a `textDocument/didChange` notification. */
interface DidChangeTextDocumentParams {
  textDocument: { uri: string; version: number };
  contentChanges: TextDocumentContentChangeEvent[];
}

/**
 * Handles the `textDocument/didChange` LSP notification.
 *
 * Applies content changes to the open document in the {@link DocumentStore},
 * then re-parses with {@link OFMParser} and updates {@link ParseCache}.
 */
@Injectable()
export class DidChangeHandler {
  constructor(
    private readonly store: DocumentStore,
    private readonly ofmParser: OFMParser,
    private readonly parseCache: ParseCache,
  ) {}

  /**
   * Handle a `textDocument/didChange` notification.
   *
   * @param params - The didChange notification parameters.
   */
  async handle(params: unknown): Promise<void> {
    const { textDocument, contentChanges } = params as DidChangeTextDocumentParams;
    this.store.update(textDocument.uri, contentChanges, textDocument.version);
    const updated = this.store.get(textDocument.uri);
    if (updated) {
      const doc = this.ofmParser.parse(textDocument.uri, updated.getText(), textDocument.version);
      this.parseCache.set(textDocument.uri, doc);
    }
  }
}
