import { Injectable, Optional } from '@nestjs/common';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';

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
 * Registers the newly opened document in the {@link DocumentStore},
 * parses it with {@link OFMParser}, caches the result in {@link ParseCache},
 * and publishes diagnostics via {@link DiagnosticService}.
 */
@Injectable()
export class DidOpenHandler {
  constructor(
    private readonly store: DocumentStore,
    private readonly ofmParser: OFMParser,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
    @Optional() private readonly diagnosticService: DiagnosticService | null = null,
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

    if (this.diagnosticService !== null) {
      this.publishDiags(textDocument.uri, doc);
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
