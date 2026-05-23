import { Injectable, Optional } from '@nestjs/common';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  MarkdownFlavorState,
  type MarkdownFlavorConfiguration,
} from '../../markdown-flavor/markdown-flavor-state.js';
import { OFMParser } from '../../parser/ofm-parser.js';
import { ParseCache } from '../../parser/parser.module.js';
import { SingleFileModeGuard } from '../../vault/single-file-mode.js';
import { toDocId } from '../../vault/doc-id.js';
import { VaultDetector } from '../../vault/vault-detector.js';
import { DiagnosticService } from '../../resolution/diagnostic-service.js';
import { ProjectMarkdownFlavorConfig } from '../../markdown-flavor/project-markdown-flavor-config.js';
import { DocumentStore } from '../services/document-store.js';
import type { ParseContext } from '../../parser/types.js';

interface FlavorGrenadeSettings {
  markdownFlavor?: unknown;
  markdownFlavorResources?: unknown;
  markdownStructuredProfiles?: unknown;
}

@Injectable()
export class ConfigurationHandler {
  constructor(
    private readonly flavorState: MarkdownFlavorState,
    private readonly store: DocumentStore,
    private readonly parser: OFMParser,
    private readonly parseCache: ParseCache,
    private readonly vaultDetector: VaultDetector,
    @Optional() private readonly diagnosticService: DiagnosticService | null = null,
    @Optional() private readonly projectConfig: ProjectMarkdownFlavorConfig | null = null,
  ) {}

  async handle(params: unknown): Promise<void> {
    if (hasDangerousPrototypeKey(params)) {
      return;
    }
    const settings = (params as { settings?: { flavorGrenade?: FlavorGrenadeSettings } } | null)
      ?.settings?.flavorGrenade;
    if (!settings) {
      return;
    }

    const config: MarkdownFlavorConfiguration = {};
    if (settings.markdownFlavor !== undefined) {
      config.selection = settings.markdownFlavor as MarkdownFlavorConfiguration['selection'];
    }
    if (settings.markdownStructuredProfiles !== undefined) {
      config.structuredProfileSelection =
        settings.markdownStructuredProfiles as MarkdownFlavorConfiguration['structuredProfileSelection'];
    }
    if (settings.markdownFlavorResources !== undefined) {
      if (isRecord(settings.markdownFlavorResources)) {
        config.resources =
          settings.markdownFlavorResources as MarkdownFlavorConfiguration['resources'];
      }
    }

    const changed = this.flavorState.applyConfiguration(config, new Set(this.store.uris()));
    if (changed) {
      this.refreshOpenDocuments();
    }
  }

  private refreshOpenDocuments(): void {
    for (const doc of this.store.all()) {
      if (doc.languageId !== 'markdown') {
        continue;
      }
      const parsed = this.parser.parse(doc.uri, doc.getText(), doc.version, {
        ...this.resolveParseContext(doc),
      });
      this.parseCache.set(doc.uri, parsed);
      this.publishDiagnostics(doc.uri, parsed);
    }
  }

  private resolveParseContext(doc: TextDocument): ParseContext {
    const fsPath = SingleFileModeGuard.uriToPath(doc.uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    const result = this.flavorState.resolveForDocument({
      uri: doc.uri,
      languageId: doc.languageId,
      hasObsidianMarker: detection.mode === 'obsidian',
      projectTomlFlavor: this.projectConfig?.resolveFlavor(detection.vaultRoot),
      projectTomlStructuredProfiles: this.projectConfig?.resolveStructuredProfiles(
        detection.vaultRoot,
      ),
      syntaxText: doc.getText(),
    });
    return result.kind === 'active'
      ? {
          effectiveFlavor: result.effective,
          structuredProfiles: result.structuredProfiles,
        }
      : { effectiveFlavor: 'commonmark', structuredProfiles: [] };
  }

  private publishDiagnostics(uri: string, doc: ReturnType<OFMParser['parse']>): void {
    if (this.diagnosticService === null) {
      return;
    }
    const fsPath = SingleFileModeGuard.uriToPath(uri);
    const detection = this.vaultDetector.detectFresh(fsPath);
    if (detection.vaultRoot === null) {
      this.diagnosticService.publishDiagnostics('' as ReturnType<typeof toDocId>, doc, fsPath);
      return;
    }
    this.diagnosticService.publishDiagnostics(
      toDocId(detection.vaultRoot, fsPath),
      doc,
      detection.vaultRoot,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasDangerousPrototypeKey(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => hasDangerousPrototypeKey(item));
  }
  if (!isRecord(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    if (hasDangerousPrototypeKey(value[key])) {
      return true;
    }
  }
  return false;
}
