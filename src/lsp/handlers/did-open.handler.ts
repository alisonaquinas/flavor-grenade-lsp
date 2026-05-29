import { Injectable, Optional } from '@nestjs/common';
import { dirname } from 'node:path';
import { DocumentStore } from '../services/document-store.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';
import { MarkdownFlavorState } from '../../markdown-flavor/markdown-flavor-state.js';
import { ProjectMarkdownFlavorConfig } from '../../markdown-flavor/project-markdown-flavor-config.js';
import {
  FlavorGrenadeConfigFiles,
  type FgConfigResolution,
} from '../../markdown-flavor/fg-config-files.js';
import type { ParseContext } from '../../parser/types.js';

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
    @Optional() private readonly flavorState: MarkdownFlavorState | null = null,
    @Optional() private readonly projectConfig: ProjectMarkdownFlavorConfig | null = null,
    @Optional() private readonly fgConfigFiles: FlavorGrenadeConfigFiles | null = null,
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
    if (this.isIgnored(textDocument.uri)) {
      this.parseCache.delete(textDocument.uri);
      this.diagnosticService?.clearDiagnostics(textDocument.uri);
      return;
    }
    const doc = this.ofmParser.parse(textDocument.uri, textDocument.text, textDocument.version, {
      ...this.resolveParseContext(textDocument.uri, textDocument.languageId, textDocument.text),
    });
    this.parseCache.set(textDocument.uri, doc);

    if (this.diagnosticService !== null) {
      this.publishDiags(textDocument.uri, doc);
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
    const fgConfig = this.resolveFgConfig(detection.vaultRoot, fsPath);
    const result = this.flavorState.resolveForDocument({
      uri,
      languageId,
      hasObsidianMarker: detection.mode === 'obsidian',
      fgAttributesFlavor: fgConfig?.attributes.flavor,
      fgAttributesStructuredProfiles: fgConfig?.attributes.structuredProfiles,
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

  private isIgnored(uri: string): boolean {
    if (this.fgConfigFiles === null) {
      return false;
    }
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    return this.resolveFgConfig(detection.vaultRoot, fsPath)?.ignored === true;
  }

  private resolveFgConfig(
    vaultRoot: string | null,
    fsPath: string,
  ): FgConfigResolution | undefined {
    return this.fgConfigFiles?.resolveForFile(vaultRoot ?? dirname(fsPath), fsPath);
  }
}
