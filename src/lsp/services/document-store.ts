import { Injectable } from '@nestjs/common';
import { TextDocument, TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument';

/**
 * Maintains an in-memory map of open text documents keyed by URI.
 *
 * Wraps {@link TextDocument} from `vscode-languageserver-textdocument` so
 * that incremental or full-text changes can be applied per the LSP spec.
 */
@Injectable()
export class DocumentStore {
  private readonly documents = new Map<string, TextDocument>();

  /**
   * Open and store a new document.
   *
   * @param uri        - The document URI (e.g. `file:///path/to/file.md`).
   * @param languageId - The language identifier (e.g. `'markdown'`).
   * @param version    - The initial document version number.
   * @param text       - The full initial text content.
   */
  open(uri: string, languageId: string, version: number, text: string): void {
    const doc = TextDocument.create(uri, languageId, version, text);
    this.documents.set(uri, doc);
  }

  /**
   * Apply content changes to an open document.
   *
   * No-op if the URI is not currently open.
   *
   * @param uri     - The document URI.
   * @param changes - Array of content change events (full or incremental).
   * @param version - The new version number after the change.
   */
  update(uri: string, changes: TextDocumentContentChangeEvent[], version: number): void {
    const existing = this.documents.get(uri);
    if (!existing) return;
    const updated = TextDocument.update(existing, changes, version);
    this.documents.set(uri, updated);
  }

  /**
   * Remove a document from the store.
   *
   * No-op if the URI is not currently open.
   *
   * @param uri - The document URI.
   */
  close(uri: string): void {
    this.documents.delete(uri);
  }

  /**
   * Retrieve an open document by URI.
   *
   * @param uri - The document URI.
   * @returns The {@link TextDocument}, or `undefined` if not open.
   */
  get(uri: string): TextDocument | undefined {
    return this.documents.get(uri);
  }
}
