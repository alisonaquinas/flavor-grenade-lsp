import { Injectable, Optional } from '@nestjs/common';
import { TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';

/** Parameters sent with a `textDocument/didChange` notification. */
interface DidChangeTextDocumentParams {
  textDocument: { uri: string; version: number };
  contentChanges: TextDocumentContentChangeEvent[];
}

/**
 * Handles the `textDocument/didChange` LSP notification.
 *
 * Applies content changes to the open document in the {@link DocumentStore},
 * re-parses with {@link OFMParser}, updates {@link ParseCache}, and publishes
 * diagnostics via {@link DiagnosticService}.
 */
@Injectable()
export class DidChangeHandler {
  constructor(
    private readonly store: DocumentStore,
    private readonly ofmParser: OFMParser,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
    @Optional() private readonly diagnosticService: DiagnosticService | null = null,
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

      if (this.diagnosticService !== null) {
        this.publishDiags(textDocument.uri, doc);
      }
    }
  }

  private publishDiags(uri: string, doc: ReturnType<OFMParser['parse']>): void {
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detect(fsPath);
    if (detection.vaultRoot === null) {
      this.diagnosticService!.publishDiagnostics('' as ReturnType<typeof toDocId>, doc, fsPath);
      return;
    }
    const docId = toDocId(detection.vaultRoot, fsPath);
    this.diagnosticService!.publishDiagnostics(docId, doc, detection.vaultRoot);
  }
}
