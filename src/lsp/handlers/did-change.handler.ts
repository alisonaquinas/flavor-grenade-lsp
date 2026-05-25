import { Injectable, Optional } from '@nestjs/common';
import { TextDocumentContentChangeEvent } from 'vscode-languageserver-textdocument';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';
import { MarkdownFlavorState } from '../../markdown-flavor/markdown-flavor-state.js';
import { ProjectMarkdownFlavorConfig } from '../../markdown-flavor/project-markdown-flavor-config.js';
import type { ParseContext } from '../../parser/types.js';

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
    @Optional() private readonly flavorState: MarkdownFlavorState | null = null,
    @Optional() private readonly projectConfig: ProjectMarkdownFlavorConfig | null = null,
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
      const doc = this.ofmParser.parse(textDocument.uri, updated.getText(), textDocument.version, {
        ...this.resolveParseContext(textDocument.uri, updated.languageId, updated.getText()),
      });
      this.parseCache.set(textDocument.uri, doc);

      if (this.diagnosticService !== null) {
        this.publishDiags(textDocument.uri, doc);
      }
    }
  }

  private publishDiags(uri: string, doc: ReturnType<OFMParser['parse']>): void {
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    if (detection.vaultRoot === null) {
      this.diagnosticService!.publishDiagnostics('' as ReturnType<typeof toDocId>, doc, fsPath);
      return;
    }
    const docId = toDocId(detection.vaultRoot, fsPath);
    this.diagnosticService!.publishDiagnostics(docId, doc, detection.vaultRoot);
  }

  private resolveParseContext(uri: string, languageId: string, syntaxText: string): ParseContext {
    if (this.flavorState === null) {
      return { effectiveFlavor: 'obsidian', structuredProfiles: [] };
    }
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    const result = this.flavorState.resolveForDocument({
      uri,
      languageId,
      hasObsidianMarker: detection.mode === 'obsidian',
      projectConfigFlavor: this.projectConfig?.resolveFlavor(detection.vaultRoot, fsPath),
      projectConfigStructuredProfiles: this.projectConfig?.resolveStructuredProfiles(
        detection.vaultRoot,
        fsPath,
      ),
      syntaxText,
    });
    return result.kind === 'active'
      ? {
          effectiveFlavor: result.effective,
          structuredProfiles: result.structuredProfiles,
        }
      : { effectiveFlavor: 'commonmark', structuredProfiles: [] };
  }
}
