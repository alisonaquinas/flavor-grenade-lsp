import { Injectable } from '@nestjs/common';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';

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
 * Registers the newly opened document in the {@link DocumentStore} and
 * parses it with {@link OFMParser}, caching the result in {@link ParseCache}.
 */
@Injectable()
export class DidOpenHandler {
  constructor(
    private readonly store: DocumentStore,
    private readonly ofmParser: OFMParser,
    private readonly parseCache: ParseCache,
  ) {}

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
    const doc = this.ofmParser.parse(textDocument.uri, textDocument.text, textDocument.version);
    this.parseCache.set(textDocument.uri, doc);
  }
}
